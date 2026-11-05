"""Database access for SpartanSpot.

This module keeps SQL in one place so the rest of the project does not need
to know how SQLite tables are structured.

Important security rule:
    We never store a customer's real password. We store a salted password
    hash instead.
"""

import hashlib
import hmac
import secrets
import sqlite3
from datetime import datetime, timezone, timedelta
from pathlib import Path


PASSWORD_ITERATIONS = 600_000


def normalize_email(email: str) -> str:
    """Return a consistent version of an email address."""
    return email.strip().lower()


def normalize_plate(plate_text: str) -> str:
    """Return a consistent version of a license plate."""
    return "".join(plate_text.upper().split())


def hash_password(password: str) -> str:
    """Create a salted PBKDF2 password hash for database storage."""
    if len(password) < 8:
        raise ValueError("Password must contain at least 8 characters.")

    salt = secrets.token_bytes(16)
    digest = hashlib.pbkdf2_hmac(
        "sha256", password.encode("utf-8"), salt, PASSWORD_ITERATIONS
    )
    return (
        f"pbkdf2_sha256${PASSWORD_ITERATIONS}$"
        f"{salt.hex()}${digest.hex()}"
    )


def verify_password(password: str, stored_hash: str) -> bool:
    """Check a password against the stored hash."""
    try:
        algorithm, iteration_text, salt_hex, digest_hex = stored_hash.split("$")
        if algorithm != "pbkdf2_sha256":
            return False

        expected = bytes.fromhex(digest_hex)
        actual = hashlib.pbkdf2_hmac(
            "sha256",
            password.encode("utf-8"),
            bytes.fromhex(salt_hex),
            int(iteration_text),
        )
        return hmac.compare_digest(actual, expected)
    except (ValueError, TypeError):
        return False


class ParkingDatabase:
    """Store accounts, vehicles, reservations, events, and summaries."""

    def __init__(self, database_path: Path):
        self.database_path = Path(database_path)
        self.database_path.parent.mkdir(parents=True, exist_ok=True)
        self.connection = sqlite3.connect(str(self.database_path))
        self.connection.row_factory = sqlite3.Row
        self.connection.execute("PRAGMA foreign_keys = ON")
        self.create_tables()

    @staticmethod
    def now_text() -> str:
        """Return a UTC timestamp suitable for SQLite."""
        return datetime.now(timezone.utc).isoformat(timespec="seconds")

    def create_tables(self):
        """Create the schema and add new columns to older demo databases."""
        self.connection.executescript(
            """
            CREATE TABLE IF NOT EXISTS customers (
                customer_id INTEGER PRIMARY KEY AUTOINCREMENT,
                first_name TEXT NOT NULL,
                last_name TEXT NOT NULL,
                email TEXT NOT NULL UNIQUE,
                password_hash TEXT NOT NULL,
                email_verified INTEGER NOT NULL DEFAULT 0,
                role TEXT NOT NULL DEFAULT 'user'
                    CHECK (role IN ('user', 'admin')),
                is_active INTEGER NOT NULL DEFAULT 1,
                monthly_reservation_limit INTEGER NOT NULL DEFAULT 8,
                created_at TEXT NOT NULL
            );

            CREATE TABLE IF NOT EXISTS verification_tokens (
                token_id INTEGER PRIMARY KEY AUTOINCREMENT,
                customer_id INTEGER NOT NULL,
                token_hash TEXT NOT NULL UNIQUE,
                expires_at TEXT NOT NULL,
                used_at TEXT,
                created_at TEXT NOT NULL,
                FOREIGN KEY (customer_id) REFERENCES customers(customer_id)
            );

            CREATE TABLE IF NOT EXISTS vehicles (
                vehicle_id INTEGER PRIMARY KEY AUTOINCREMENT,
                customer_id INTEGER,
                license_plate TEXT NOT NULL UNIQUE,
                state TEXT,
                created_at TEXT NOT NULL,
                FOREIGN KEY (customer_id) REFERENCES customers(customer_id)
            );

            CREATE TABLE IF NOT EXISTS parking_permits (
                permit_id INTEGER PRIMARY KEY AUTOINCREMENT,
                vehicle_id INTEGER NOT NULL,
                status TEXT NOT NULL DEFAULT 'active'
                    CHECK (status IN ('active', 'expired', 'cancelled')),
                start_date TEXT NOT NULL,
                end_date TEXT NOT NULL,
                created_at TEXT NOT NULL,
                FOREIGN KEY (vehicle_id) REFERENCES vehicles(vehicle_id)
            );

            CREATE TABLE IF NOT EXISTS reservations (
                reservation_id INTEGER PRIMARY KEY AUTOINCREMENT,
                customer_id INTEGER NOT NULL,
                vehicle_id INTEGER NOT NULL,
                spot_id TEXT NOT NULL,
                reserved_from TEXT NOT NULL,
                expires_at TEXT NOT NULL,
                status TEXT NOT NULL DEFAULT 'scheduled'
                    CHECK (status IN
                        ('scheduled', 'active', 'fulfilled', 'expired', 'cancelled')),
                created_at TEXT NOT NULL,
                FOREIGN KEY (customer_id) REFERENCES customers(customer_id),
                FOREIGN KEY (vehicle_id) REFERENCES vehicles(vehicle_id)
            );

            CREATE UNIQUE INDEX IF NOT EXISTS one_active_reservation_per_spot
            ON reservations (spot_id)
            WHERE status IN ('scheduled', 'active');

            CREATE TABLE IF NOT EXISTS parking_events (
                event_id INTEGER PRIMARY KEY AUTOINCREMENT,
                camera_id TEXT NOT NULL,
                spot_id TEXT NOT NULL,
                reservation_id INTEGER,
                occupied_at TEXT NOT NULL,
                available_at TEXT,
                plate_text TEXT,
                validation_status TEXT,
                image_path TEXT,
                FOREIGN KEY (reservation_id) REFERENCES reservations(reservation_id)
            );

            CREATE TABLE IF NOT EXISTS occupancy_snapshots (
                snapshot_id INTEGER PRIMARY KEY AUTOINCREMENT,
                camera_id TEXT NOT NULL,
                recorded_at TEXT NOT NULL,
                total_spaces INTEGER NOT NULL,
                occupied_spaces INTEGER NOT NULL,
                available_spaces INTEGER NOT NULL,
                reserved_spaces INTEGER NOT NULL DEFAULT 0,
                disconnected_spaces INTEGER NOT NULL,
                occupancy_percent REAL NOT NULL
            );
            """
        )

        # These statements help an older database gain the new columns.
        self._add_column_if_missing(
            "parking_events", "reservation_id", "INTEGER"
        )
        self._add_column_if_missing(
            "vehicles", "customer_id", "INTEGER"
        )
        self._add_column_if_missing(
            "parking_permits", "created_at", "TEXT"
        )
        self._add_column_if_missing(
            "occupancy_snapshots", "reserved_spaces",
            "INTEGER NOT NULL DEFAULT 0",
        )
        self.connection.commit()

    def _add_column_if_missing(
        self, table_name: str, column_name: str, definition: str
    ):
        """Add one column only when an older database does not have it."""
        columns = self.connection.execute(
            f"PRAGMA table_info({table_name})"
        ).fetchall()
        existing_names = {column[1] for column in columns}
        if column_name not in existing_names:
            self.connection.execute(
                f"ALTER TABLE {table_name} ADD COLUMN "
                f"{column_name} {definition}"
            )

    def register_customer(
        self,
        first_name: str,
        last_name: str,
        email: str,
        password: str,
        role: str = "user",
    ) -> int:
        """Create an unverified account and return its customer ID."""
        email = normalize_email(email)
        role = role.strip().lower()
        if role not in {"user", "admin"}:
            raise ValueError("Role must be 'user' or 'admin'.")
        if not first_name.strip() or not last_name.strip():
            raise ValueError("First name and last name are required.")

        cursor = self.connection.execute(
            """
            INSERT INTO customers (
                first_name, last_name, email, password_hash,
                email_verified, role, created_at
            )
            VALUES (?, ?, ?, ?, 0, ?, ?)
            """,
            (
                first_name.strip(),
                last_name.strip(),
                email,
                hash_password(password),
                role,
                self.now_text(),
            ),
        )
        self.connection.commit()
        return int(cursor.lastrowid)

    def authenticate_customer(self, email: str, password: str):
        """Return account data for a valid login, otherwise return None."""
        customer = self.connection.execute(
            """
            SELECT * FROM customers
            WHERE email = ? AND is_active = 1
            """,
            (normalize_email(email),),
        ).fetchone()

        if customer is None:
            return None
        if not customer["email_verified"]:
            return None
        if not verify_password(password, customer["password_hash"]):
            return None
        return dict(customer)

    def create_verification_token(self, customer_id: int, hours: int = 24) -> str:
        """Create a one-time token and return the raw token for an email link."""
        raw_token = secrets.token_urlsafe(32)
        token_hash = hashlib.sha256(raw_token.encode("utf-8")).hexdigest()
        expires_at = (
            datetime.now(timezone.utc) + timedelta(hours=hours)
        ).isoformat(timespec="seconds")

        self.connection.execute(
            """
            INSERT INTO verification_tokens
                (customer_id, token_hash, expires_at, created_at)
            VALUES (?, ?, ?, ?)
            """,
            (customer_id, token_hash, expires_at, self.now_text()),
        )
        self.connection.commit()
        return raw_token

    def verify_customer_email(self, raw_token: str) -> bool:
        """Verify an account using an unexpired, unused email token."""
        token_hash = hashlib.sha256(raw_token.encode("utf-8")).hexdigest()
        token = self.connection.execute(
            """
            SELECT * FROM verification_tokens
            WHERE token_hash = ? AND used_at IS NULL
            """,
            (token_hash,),
        ).fetchone()

        if token is None or token["expires_at"] < self.now_text():
            return False

        now = self.now_text()
        self.connection.execute(
            "UPDATE customers SET email_verified = 1 WHERE customer_id = ?",
            (token["customer_id"],),
        )
        self.connection.execute(
            "UPDATE verification_tokens SET used_at = ? WHERE token_id = ?",
            (now, token["token_id"]),
        )
        self.connection.commit()
        return True

    def register_vehicle(
        self, customer_id: int, license_plate: str, state: str | None = None
    ) -> int:
        """Register another vehicle for an existing customer."""
        customer_exists = self.connection.execute(
            "SELECT 1 FROM customers WHERE customer_id = ?",
            (customer_id,),
        ).fetchone()
        if customer_exists is None:
            raise ValueError("Customer does not exist.")

        cursor = self.connection.execute(
            """
            INSERT INTO vehicles (customer_id, license_plate, state, created_at)
            VALUES (?, ?, ?, ?)
            """,
            (customer_id, normalize_plate(license_plate), state, self.now_text()),
        )
        self.connection.commit()
        return int(cursor.lastrowid)

    def add_paid_permit(
        self,
        vehicle_id: int,
        start_date: str,
        end_date: str,
    ) -> int:
        """Add an active paid permit."""

        cursor = self.connection.execute(
            """
            INSERT INTO parking_permits (
                vehicle_id,
                status,
                start_date,
                end_date,
                created_at
            )
            VALUES (?, 'active', ?, ?, ?)
            """,
            (
                vehicle_id,
                start_date,
                end_date,
                self.now_text(),
            ),
        )

        self.connection.commit()
        return int(cursor.lastrowid)

    def create_reservation(
        self,
        customer_id: int,
        vehicle_id: int,
        spot_id: str,
        reserved_from: str | None = None,
        hold_hours: int = 2,
    ) -> int:
        """Create a reservation after checking the project rules.

        The UI supplies the start time. ``expires_at`` is an internal safety
        time so an abandoned reservation does not block a space forever.
        The caller should check the camera status before calling this method.
        """
        now = self.now_text()
        reserved_from = reserved_from or now

        # Expired reservations should not continue blocking spaces.
        self.expire_reservations()

        customer = self.connection.execute(
            """
            SELECT monthly_reservation_limit
            FROM customers
            WHERE customer_id = ? AND is_active = 1
            """,
            (customer_id,),
        ).fetchone()
        if customer is None:
            raise ValueError("Customer does not exist or is inactive.")

        # A cancelled reservation is intentionally not counted.
        month_start = now[:7] + "-01T00:00:00+00:00"
        reservations_used = self.connection.execute(
            """
            SELECT COUNT(*)
            FROM reservations
            WHERE customer_id = ?
              AND created_at >= ?
              AND status <> 'cancelled'
            """,
            (customer_id, month_start),
        ).fetchone()[0]
        if reservations_used >= customer["monthly_reservation_limit"]:
            raise ValueError(
                "This customer has reached the monthly reservation limit."
            )

        # A customer can reserve only one of their own registered vehicles.
        vehicle = self.connection.execute(
            """
            SELECT 1 FROM vehicles
            WHERE vehicle_id = ? AND customer_id = ?
            """,
            (vehicle_id, customer_id),
        ).fetchone()
        if vehicle is None:
            raise ValueError("This vehicle does not belong to the customer.")

        # One spot cannot have two scheduled or active reservations.
        existing = self.connection.execute(
            """
            SELECT 1 FROM reservations
            WHERE spot_id = ? AND status IN ('scheduled', 'active')
            """,
            (spot_id,),
        ).fetchone()
        if existing is not None:
            raise ValueError("This parking spot is already reserved.")

        expires_at = (
            datetime.fromisoformat(reserved_from) + timedelta(hours=hold_hours)
        ).isoformat(timespec="seconds")

        try:
            cursor = self.connection.execute(
                """
                INSERT INTO reservations (
                    customer_id, vehicle_id, spot_id, reserved_from,
                    expires_at, status, created_at
                )
                VALUES (?, ?, ?, ?, ?, 'scheduled', ?)
                """,
                (
                    customer_id,
                    vehicle_id,
                    spot_id,
                    reserved_from,
                    expires_at,
                    now,
                ),
            )
        except sqlite3.IntegrityError as error:
            # This also protects against two requests reserving the same spot
            # at nearly the same time.
            raise ValueError("This parking spot is already reserved.") from error

        self.connection.commit()
        return int(cursor.lastrowid)

    def cancel_reservation(self, reservation_id: int) -> bool:
        """Cancel a scheduled reservation before it starts."""
        reservation = self.connection.execute(
            """
            SELECT status, reserved_from FROM reservations
            WHERE reservation_id = ?
            """,
            (reservation_id,),
        ).fetchone()
        if reservation is None:
            return False

        if reservation["status"] != "scheduled":
            return False
        if reservation["reserved_from"] <= self.now_text():
            return False

        self.connection.execute(
            """
            UPDATE reservations SET status = 'cancelled'
            WHERE reservation_id = ?
            """,
            (reservation_id,),
        )
        self.connection.commit()
        return True

    def expire_reservations(self):
        """Release scheduled reservations whose internal hold time ended."""
        self.connection.execute(
            """
            UPDATE reservations SET status = 'expired'
            WHERE status IN ('scheduled', 'active')
              AND expires_at < ?
            """,
            (self.now_text(),),
        )
        self.connection.commit()

    def is_plate_valid(self, plate_text: str) -> bool:
        """Return True if the plate has an active paid permit."""

        normalized_plate = normalize_plate(plate_text)

        today = datetime.now(
            timezone.utc
        ).date().isoformat()

        row = self.connection.execute(
            """
            SELECT 1
            FROM vehicles AS v
            JOIN parking_permits AS p
                ON p.vehicle_id = v.vehicle_id
            WHERE REPLACE(
                    UPPER(v.license_plate),
                    ' ',
                    ''
                ) = ?
            AND p.status = 'active'
            AND date(p.start_date) <= date(?)
            AND date(p.end_date) >= date(?)
            LIMIT 1
            """,
            (
                normalized_plate,
                today,
                today,
            ),
        ).fetchone()

        return row is not None

    def get_reserved_spot_ids(self) -> set[str]:
        """Return currently reserved parking-space IDs."""

        self.expire_reservations()

        rows = self.connection.execute(
            """
            SELECT spot_id
            FROM reservations
            WHERE status IN ('scheduled', 'active')
            """
        ).fetchall()

        return {
            row["spot_id"]
            for row in rows
        }

    def get_reservation_for_spot(self, spot_id: str):
        """Return a scheduled or active reservation for a spot."""

        # Expired reservations should not block the parking spot.
        self.expire_reservations()

        reservation = self.connection.execute(
            """
            SELECT
                r.*,
                v.license_plate
            FROM reservations AS r
            LEFT JOIN vehicles AS v
                ON v.vehicle_id = r.vehicle_id
            WHERE r.spot_id = ?
            AND r.status IN ('scheduled', 'active')
            ORDER BY r.reserved_from ASC
            LIMIT 1
            """,
            (spot_id,),
        ).fetchone()

        return reservation

    def fulfill_reservation(
        self,
        reservation_id: int,
    ) -> bool:
        """Mark a reservation as fulfilled after the vehicle arrives."""

        cursor = self.connection.execute(
            """
            UPDATE reservations
            SET status = 'fulfilled'
            WHERE reservation_id = ?
            AND status IN ('scheduled', 'active')
            """,
            (reservation_id,),
        )

        self.connection.commit()

        # rowcount is 1 when a reservation was updated successfully.
        return cursor.rowcount == 1

    def validate_plate_for_spot(
        self,
        spot_id: str,
        plate_text: str,
    ) -> str:
        """Check whether a detected plate is valid for a parking spot."""

        # Normalize the OCR result first.
        normalized_plate = normalize_plate(plate_text)

        # Find the reservation assigned to this spot.
        reservation = self.get_reservation_for_spot(spot_id)

        # The vehicle must have an active paid permit.
        if not self.is_plate_valid(normalized_plate):
            return "invalid"

        # If the spot is not reserved, any valid permitted vehicle is accepted.
        if reservation is None:
            return "valid"

        # If reserved, the detected plate must match the reserved vehicle.
        reserved_plate = normalize_plate(
            reservation["license_plate"]
        )

        if reserved_plate != normalized_plate:
            return "invalid"

        return "valid"

    def start_event(
        self, camera_id: str, spot_id: str, reservation_id: int | None = None
    ) -> int:
        """Create an event when a space becomes occupied."""
        cursor = self.connection.execute(
            """
            INSERT INTO parking_events
                (camera_id, spot_id, reservation_id, occupied_at)
            VALUES (?, ?, ?, ?)
            """,
            (camera_id, spot_id, reservation_id, self.now_text()),
        )
        self.connection.commit()
        return int(cursor.lastrowid)

    def finish_event(self, event_id: int):
        """Close an event when the space becomes available."""
        self.connection.execute(
            """
            UPDATE parking_events SET available_at = ?
            WHERE event_id = ?
            """,
            (self.now_text(), event_id),
        )
        self.connection.commit()

    def update_event_plate(
        self,
        event_id: int,
        plate_text: str,
        validation_status: str,
        image_path: str,
    ):
        """Save the plate result and saved crop path."""
        self.connection.execute(
            """
            UPDATE parking_events
            SET plate_text = ?, validation_status = ?, image_path = ?
            WHERE event_id = ?
            """,
            (normalize_plate(plate_text), validation_status, image_path, event_id),
        )
        self.connection.commit()

    def record_snapshot(
        self,
        camera_id: str,
        total_spaces: int,
        occupied_spaces: int,
        available_spaces: int,
        disconnected_spaces: int,
        reserved_spaces: int = 0,
    ):
        """Save one aggregate reading for busy-time analysis."""
        occupancy_percent = (
            occupied_spaces / total_spaces * 100 if total_spaces else 0.0
        )
        self.connection.execute(
            """
            INSERT INTO occupancy_snapshots (
                camera_id, recorded_at, total_spaces,
                occupied_spaces, available_spaces, reserved_spaces,
                disconnected_spaces, occupancy_percent
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                camera_id,
                self.now_text(),
                total_spaces,
                occupied_spaces,
                available_spaces,
                reserved_spaces,
                disconnected_spaces,
                occupancy_percent,
            ),
        )
        self.connection.commit()

    def close(self):
        """Close the SQLite connection."""
        self.connection.close()
