"""Authentication endpoints for account registration and verification."""

from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel, EmailStr

from app.accounts.auth_service import (
    login as authenticate_login,
    register_account,
    verify_account,
)
from app.config import DATABASE_PATH
from app.database.database import ParkingDatabase


router = APIRouter(
    prefix="/api/auth",
    tags=["Authentication"],
)


class SignupRequest(BaseModel):
    """Data submitted by a new customer."""

    first_name: str
    last_name: str
    email: EmailStr
    password: str

class LoginRequest(BaseModel):
    """Data submitted by a customer logging in."""

    email: EmailStr
    password: str


@router.post("/signup")
def signup(request: SignupRequest):
    """Create an account and send an email-verification link."""

    database = ParkingDatabase(DATABASE_PATH)

    try:
        customer_id = register_account(
            database=database,
            first_name=request.first_name,
            last_name=request.last_name,
            email=str(request.email),
            password=request.password,
        )

        return {
            "message": (
                "Account created. "
                "Check your email to verify your account."
            ),
            "customer_id": customer_id,
        }

    except ValueError as error:
        raise HTTPException(
            status_code=400,
            detail=str(error),
        ) from error

    except RuntimeError as error:
        raise HTTPException(
            status_code=503,
            detail=(
                "Account was created, but the verification email "
                f"could not be sent: {error}"
            ),
        ) from error

    finally:
        database.close()


@router.get("/verify")
def verify_email(
    token: str = Query(...),
):
    """Verify an account using the token from the email link."""

    database = ParkingDatabase(DATABASE_PATH)

    try:
        verified = verify_account(
            database,
            token,
        )

        if not verified:
            raise HTTPException(
                status_code=400,
                detail="The verification token is invalid or expired.",
            )

        return {
            "message": (
                "Email verified successfully. "
                "You can now log in."
            )
        }

    finally:
        database.close()

@router.post("/login")
def login(request: LoginRequest):
    """Check a verified customer's email and password."""

    database = ParkingDatabase(DATABASE_PATH)

    try:
        account = authenticate_login(
            database=database,
            email=str(request.email),
            password=request.password,
        )

        if account is None:
            raise HTTPException(
                status_code=401,
                detail=(
                    "Invalid email/password, "
                    "unverified email, or inactive account."
                ),
            )

        # Return only safe account information.
        # Never return password_hash to the client.
        return {
            "message": "Login successful.",
            "customer": {
                "customer_id": account["customer_id"],
                "first_name": account["first_name"],
                "last_name": account["last_name"],
                "email": account["email"],
                "role": account["role"],
            },
        }

    finally:
        database.close()