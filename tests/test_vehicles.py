"""Practice program for customer vehicles and paid permits.

Run from the project root with:

    python -m tests.test_vehicles
"""

from pathlib import Path
from tempfile import TemporaryDirectory

from app.database.database import ParkingDatabase

def main():
    """Create one customer with two vehicles and test permits."""

    # Use a temporary database for practice
    with TemporaryDirectory() as temporary_folder:
        database_path = Path(temporary_folder) / "test_vehicles.db"
        database = ParkingDatabase(database_path)

        # Create one customer
        customer_id = database.register_customer(
            first_name = "Thien",
            last_name = "Doan",
            email = "thien.doan@example.com",
            password = "password123"
        )

        # One customer can register multiple vehicles
        first_vehicle_id = database.register_vehicle(
            customer_id = customer_id,
            license_plate = "5CMP686",
            state = "CA"
        )

        second_vehicle_id = database.register_vehicle(
            customer_id = customer_id,
            license_plate = "7ABC123",
            state = "CA"
        )

        print(f"First vehicle ID: {first_vehicle_id}")
        print(f"Second vehicle ID: {second_vehicle_id}")

        # Add a paid permit to the first vehicle only.
        database.add_paid_permit(
            vehicle_id = first_vehicle_id,
            start_date = "2026-01-01",
            end_date = "2026-12-31",
        )

        # Spaces and OCR may include spaces or lowecase letters
        # is_plate_valid() normalizes the plate before checking it
        print(
            "5CMP686 valid:",
            database.is_plate_valid("5 cmp 686"),
        )

        # This vehicle has no paid permit
        print(
            "7ABC123 valid:",
            database.is_plate_valid("7abc123"),
        )

        database.close()

if __name__ == "__main__":
    main()
