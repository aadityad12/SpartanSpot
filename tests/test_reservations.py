"""Practice program for customer reservations.

Run from the project root with:

    python -m tests.test_reservations
"""

from datetime import datetime, timedelta, timezone
from pathlib import Path
from tempfile import TemporaryDirectory

from app.database.database import ParkingDatabase

def main():
    """Test ownership, reservation creation, and cancellation."""

    # Use a temporary database for practice.
    with TemporaryDirectory() as temporary_folder:
        database_path = Path(temporary_folder) / "test_reservations.db"
        database = ParkingDatabase(database_path)

        customer_id = database.register_customer(
            first_name = "Thien",
            last_name = "Doan",
            email = "thien.doan@example.com",
            password = "password123",
        )
        
        vehicle_id = database.register_vehicle(
            customer_id = customer_id,
            license_plate = "5CMPE686",
            state = "CA",
        )

        # Use a future time so the reservation can be cancelled
        start_time = (
            datetime.now(timezone.utc) + timedelta(hours = 1)
        ).isoformat(timespec = "seconds")

        reservation_id = database.create_reservation(
            customer_id = customer_id,
            vehicle_id = vehicle_id,
            spot_id = "A1",
            reserved_from = start_time,
        )

        print(f"Created reservation ID: {reservation_id}")

        # A second reservation for the same spot should fail.
        try:
            database.create_reservation(
                customer_id = customer_id,
                vehicle_id = vehicle_id,
                spot_id = "A1",
                reserved_from = start_time,
            )
        except ValueError as error:
            print(f"Duplicate reservation blocke: {error}")

        # Cancel the first reservation.
        cancelled = database.cancel_reservation(reservation_id)
        print(f"Reservation cancelled: {cancelled}")

        # The cancelled reservation no longer blocks A1
        second_reservation_id = database.create_reservation(
            customer_id = customer_id,
            vehicle_id = vehicle_id,
            spot_id = "A1",
            reserved_from = start_time,
        )
        print(f"Created second reservation ID: {second_reservation_id}")

        database.close()

if __name__ == "__main__":
    main()