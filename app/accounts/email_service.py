""" Send account-verification emails
The database creates a one-time token. This module places that token inside
a link and sends the link to the customer's email address

SMTP settings come from app.config. Do not put an email password directly 
in Python source code or commit it to Git.
"""

import smtplib
from email.message import EmailMessage
import html

from app.config import (
    EMAIL_FROM,
    EMAIL_VERIFICATION_URL,
    SMTP_HOST,
    SMTP_PASSWORD,
    SMTP_PORT,
    SMTP_USERNAME,
)

def send_verification_email(
    to_email: str,
    raw_token: str,
) -> None:
    """Send an email containing a clickable verification link."""

    if not SMTP_HOST or not SMTP_USERNAME or not SMTP_PASSWORD:
        raise RuntimeError(
            "SMTP is not configured. "
            "Set SPARTAN_SMTP_HOST, "
            "SPARTAN_SMTP_USERNAME, and "
            "SPARTAN_SMTP_PASSWORD."
        )

    verification_link = (
        f"{EMAIL_VERIFICATION_URL}?token={raw_token}"
    )

    # Escape the link before inserting it into HTML.
    safe_link = html.escape(
        verification_link,
        quote=True,
    )

    message = EmailMessage()
    message["Subject"] = (
        "Verify your SpartanSpot account"
    )
    message["From"] = EMAIL_FROM
    message["To"] = to_email

    # Plain-text fallback for email clients without HTML support.
    message.set_content(
        "Welcome to SpartanSpot!\n\n"
        "Verify your account using this link:\n"
        f"{verification_link}\n\n"
        "This link expires in 24 hours."
    )

    # HTML version creates a clickable button.
    message.add_alternative(
        f"""
        <html>
            <body>
                <h2>Welcome to SpartanSpot!</h2>

                <p>
                    Click the button below to verify your account:
                </p>

                <p>
                    <a href="{safe_link}"
                       style="
                       background-color:#1976D2;
                       color:white;
                       padding:12px 20px;
                       text-decoration:none;
                       border-radius:5px;
                       display:inline-block;">
                        Verify my account
                    </a>
                </p>

                <p>
                    This link expires in 24 hours.
                </p>

                <p>
                    If the button does not work, copy this link:
                </p>

                <p>{safe_link}</p>
            </body>
        </html>
        """,
        subtype="html",
    )

    with smtplib.SMTP(
        SMTP_HOST,
        SMTP_PORT,
        timeout=20,
    ) as smtp:
        smtp.starttls()
        smtp.login(
            SMTP_USERNAME,
            SMTP_PASSWORD,
        )
        smtp.send_message(message)