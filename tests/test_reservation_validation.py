"""Practice program for validating a vehicle at a reserved spot.

Run from the project root with:

    python -m tests.test_reservation_validation
"""

from datetime import datetime, timedelta, timezone
from pathlib import Path
from tempfile import TemporaryDirectory

from app.database.database import (
    ParkingDatabase,
    normalize_plate,
)

def main():
    """Test reservation lookup and license-plate validation"""

    with TemporaryDirectory() as temporary_folder:
        database = ParkingDatabase(
            Path(temporary_folder) / "test_validation.db"
        )

        customer_id = database.register_customer(
            first_name = "Thien",
            last_name = "Doan",
            email = "thien.doan@example.com",
            password = "password123",
        )

        vehicle_id = database.register_vehicle(
            customer_id = customer_id,
            license_plate = "5CMP686",
            state = "CA",
        )

        database.add_paid_permit(
            vehicle_id = vehicle_id,
            start_date = "2026-01-01",
            end_date = "2026-12-31",
        )
        print(
            "Normalized plate:",
            normalize_plate("5 cmp 686"),
        )

        print(
            "Direct permit check:",
            database.is_plate_valid("5 cmp 686"),
        )

        reservation = database.get_reservation_for_spot("A1")

        if reservation is None:
            print("Reservation lookup: None")
        else:
            print(
                "Reservation lookup:",
                dict(reservation),
            )

        # Create a future reservation for parking spot A1
        future_start = (
            datetime.now(timezone.utc)
            + timedelta(hours = 1)
        ).isoformat(timespec = "seconds")

        reservation_id = database.create_reservation(
            customer_id=customer_id,
            vehicle_id=vehicle_id,
            spot_id ="A1",
            reserved_from=future_start,
        )

        print(
            "Reserved spots:", 
            database.get_reserved_spot_ids(),
        )

        # The correct registered plate should be valid
        print(
            "Correct plate.",
            database.validate_plate_for_spot(
                "A1",
                "5 cmp 686",
            ),
        )

        # A different plate should be invalid
        print(
            "Wrong plate.",
            database.validate_plate_for_spot(
                "A1",
                "7ABC123",
            ),
        )

        # Mark the reservation as completed
        fulfilled = database.fulfill_reservation(
            reservation_id
        )

        print(
            "Reservation fulfilled:",
            fulfilled,
        )

        print(
            "Reserved spots after arrival:",
            database.get_reserved_spot_ids(),
        )

        database.close()

if __name__ == "__main__":
    main()