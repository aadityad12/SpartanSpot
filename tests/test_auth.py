"""Practice program for testing SpartanSpot authentication.

Run from the project root with:

    python -m tests.test_auth

This test does not send a real email. It temporarily replaces the email
function and prints the verification token instead.
"""

from pathlib import Path
from tempfile import TemporaryDirectory

import app.accounts.auth_service as auth_service
from app.database.database import ParkingDatabase

def fake_send_verification_email(
    to_email: str,
    raw_token: str,
) -> None:
    """Pretend to send an email and save the token for this text."""
    
    print(f"Fake email sent to: {to_email}")
    print(f"Verification token: {raw_token}")

def main():
    """Run the account registration and login test."""

    # Use a temporary datbase so the real database is not changed
    with TemporaryDirectory() as temporary_folder:
        database_path = Path(temporary_folder) / "test_auth.db"
        database = ParkingDatabase(database_path)

        # Replace the real email sender for this test only
        auth_service.send_verification_email = (
            fake_send_verification_email
        )

        customer_id = auth_service.register_account(
            database = database,
            first_name = "Test",
            last_name = "User",
            email = "test@example.com",
            password = "password123",
        )

        print(f"Created customer ID: {customer_id}")

        # Normally, the user gets the token through email
        # For this test, copy it from the termial
        token = input("Paste the verification token: ")

        verified = auth_service.verify_account(
            database,
            token,
        )

        print(f"Email verified: {verified}")

        account = auth_service.login(
            database = database,
            email = "test@example.com",
            password = "password123",
        )

        if account is None:
            print("Login failed")
        else:
            print("Login successful!")
            print(f"Welcome, {account['first_name']}!")
            print(f"Role: {account['role']}")
        
        database.close()

if __name__ == "__main__":
    main()
