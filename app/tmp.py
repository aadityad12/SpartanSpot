from pathlib import Path

from app.database import ParkingDatabase


PROJECT_ROOT = Path(__file__).resolve().parent.parent

TEST_DATABASE_PATH = (
    PROJECT_ROOT / "database" / "parking_test.db"
)

database = ParkingDatabase(TEST_DATABASE_PATH)

print("Using database:")
print(TEST_DATABASE_PATH.resolve())

vehicle_id = database.register_vehicle(
    user_id=1,
    license_plate="7ABC123",
    state="CA",
    make="Toyota",
    model="Camry",
    vehicle_year=2022
)

permit_id = database.add_permit(
    vehicle_id=vehicle_id,
    lot_id="LOT_A",
    term_type="semester",
    term_name="Fall 2026",
    start_date="2026-08-20",
    end_date="2026-12-20"
)

print("Vehicle ID:", vehicle_id)
print("Permit ID:", permit_id)

database.close()