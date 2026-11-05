"""Application-level account operations.

This module connects the database functions with email services:

    register -> create account -> create token -> send email
    verify -> check token -> activate email login
    login -> check email, password, and account status

The future web UI can call these functions instead of writing SQL itself.
"""

import sqlite3

from app.database.database import ParkingDatabase
from app.accounts.email_service import send_verification_email

def register_account(
    database: ParkingDatabase,
    first_name: str,
    last_name: str,
    email: str,
    password: str,
) -> int:
    """Register a user and send the email-verification link.

    Returns:
        The new customer's database ID.

    Raises:
        ValueError: If the email is already registered or input is invalid.
        RuntimeError: If SMTP settings are missing or email sending fails.
    """

    try:
        # Create the account with an unverified email.
        customer_id = database.register_customer(
            first_name = first_name,
            last_name = last_name,
            email = email,
            password = password,
        )

    except sqlite3.IntegrityError as error:
        # This normally means the email is already exists.
        raise ValueError(
            "That email address is already registered."
        ) from error

    # Create a secure, temporary verification token.
    token = database.create_verification_token(customer_id)

    # Send the verification link to the user.
    send_verification_email(
        email.strip().lower(),
        token,
    )

    return customer_id

def verify_account(
    database: ParkingDatabase,
    token: str,
) -> bool:
    """Verify an account using the token from the email link."""

    if not token.strip():
        return False

    return database.verify_customer_email(token.strip())

def login(
    database: ParkingDatabase,
    email: str,
    password: str,
):
    """Return account information for a valid login.
    
    Returns None if:
        - The email does not exist
        - The password is incorrect
        - The email has not been verified
        - The account is inactive
    """

    return database.authenticate_customer(
        email,
        password,
    )