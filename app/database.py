import sqlite3
from datetime import datetime


class ParkingDatabase:
    def __init__(self, database_path):
        self.database_path = database_path

        self.database_path.parent.mkdir(
            parents=True,
            exist_ok=True
        )

        self.connection = sqlite3.connect(
            str(self.database_path)
        )

        self.connection.execute(
            "PRAGMA foreign_keys = ON"
        )

        self.create_tables()

    def create_tables(self):
        cursor = self.connection.cursor()

        cursor.execute("""
            CREATE TABLE IF NOT EXISTS parking_spots (
                spot_id TEXT PRIMARY KEY,
                status TEXT NOT NULL,
                confidence REAL,
                updated_at TEXT NOT NULL
            )
        """)

        cursor.execute("""
            CREATE TABLE IF NOT EXISTS parking_history (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                spot_id TEXT NOT NULL,
                status TEXT NOT NULL,
                confidence REAL,
                changed_at TEXT NOT NULL
            )
        """)

        cursor.execute("""
            CREATE TABLE IF NOT EXISTS vehicles (
                vehicle_id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER,
                license_plate TEXT NOT NULL,
                state TEXT NOT NULL,
                make TEXT,
                model TEXT,
                vehicle_year INTEGER,
                created_at TEXT DEFAULT CURRENT_TIMESTAMP,

                UNIQUE (license_plate, state)
            )
        """)

        cursor.execute("""
            CREATE TABLE IF NOT EXISTS parking_permits (
                permit_id INTEGER PRIMARY KEY AUTOINCREMENT,
                vehicle_id INTEGER NOT NULL,
                lot_id TEXT,
                term_type TEXT NOT NULL
                    CHECK (term_type IN ('semester', 'annual')),
                term_name TEXT,
                start_date TEXT NOT NULL,
                end_date TEXT NOT NULL,
                status TEXT NOT NULL DEFAULT 'active'
                    CHECK (
                        status IN (
                            'active',
                            'expired',
                            'cancelled'
                        )
                    ),
                created_at TEXT DEFAULT CURRENT_TIMESTAMP,

                FOREIGN KEY (vehicle_id)
                    REFERENCES vehicles(vehicle_id)
            )
        """)

        self.connection.commit()

    def register_vehicle(
        self,
        user_id,
        license_plate,
        state,
        make=None,
        model=None,
        vehicle_year=None
    ):
        cursor = self.connection.cursor()

        clean_plate = license_plate.upper().replace(" ", "")
        clean_state = state.upper()

        cursor.execute("""
            INSERT INTO vehicles (
                user_id,
                license_plate,
                state,
                make,
                model,
                vehicle_year
            )
            VALUES (?, ?, ?, ?, ?, ?)
        """, (
            user_id,
            clean_plate,
            clean_state,
            make,
            model,
            vehicle_year
        ))

        self.connection.commit()

        return cursor.lastrowid

    def add_permit(
        self,
        vehicle_id,
        lot_id,
        term_type,
        term_name,
        start_date,
        end_date
    ):
        cursor = self.connection.cursor()

        cursor.execute("""
            INSERT INTO parking_permits (
                vehicle_id,
                lot_id,
                term_type,
                term_name,
                start_date,
                end_date
            )
            VALUES (?, ?, ?, ?, ?, ?)
        """, (
            vehicle_id,
            lot_id,
            term_type,
            term_name,
            start_date,
            end_date
        ))

        self.connection.commit()

        # This must be inside add_permit()
        return cursor.lastrowid

    def update_spot(
        self,
        spot_id,
        status,
        confidence
    ):
        cursor = self.connection.cursor()

        current_time = datetime.now().isoformat(
            timespec="seconds"
        )

        cursor.execute("""
            INSERT INTO parking_spots (
                spot_id,
                status,
                confidence,
                updated_at
            )
            VALUES (?, ?, ?, ?)
            ON CONFLICT(spot_id)
            DO UPDATE SET
                status = excluded.status,
                confidence = excluded.confidence,
                updated_at = excluded.updated_at
        """, (
            spot_id,
            status,
            confidence,
            current_time
        ))

        cursor.execute("""
            INSERT INTO parking_history (
                spot_id,
                status,
                confidence,
                changed_at
            )
            VALUES (?, ?, ?, ?)
        """, (
            spot_id,
            status,
            confidence,
            current_time
        ))

        self.connection.commit()

    def close(self):
        self.connection.close()