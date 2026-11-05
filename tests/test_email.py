"""Send one test email through the configured SMTP provider.

Run from the project root:

    python -m app.accounts.test_email

This checks email delivery only. It does not create or verify an account.
"""

import smtplib
import ssl
from email.message import EmailMessage

from app.config import (
    EMAIL_FROM,
    SMTP_HOST,
    SMTP_PASSWORD,
    SMTP_PORT,
    SMTP_USERNAME,
)


def main():
    """Ask for a recipient and send one test email."""

    if not all(
        [
            SMTP_HOST,
            SMTP_USERNAME,
            SMTP_PASSWORD,
            EMAIL_FROM,
        ]
    ):
        print(
            "Email configuration is incomplete. "
            "Set the SMTP environment variables first."
        )
        return

    recipient = input(
        "Send the test email to: "
    ).strip()

    if not recipient:
        print("A recipient address is required.")
        return

    message = EmailMessage()
    message["Subject"] = "SpartanSpot email test"
    message["From"] = EMAIL_FROM
    message["To"] = recipient

    message.set_content(
        "Hello!\n\n"
        "SpartanSpot successfully sent this test email.\n\n"
        "This message checks email delivery only. "
        "It does not verify an account.\n\n"
        "SpartanSpot Team"
    )

    try:
        # Use a certificate-verified encrypted connection.
        tls_context = ssl.create_default_context()

        with smtplib.SMTP(
            SMTP_HOST,
            SMTP_PORT,
            timeout=20,
        ) as smtp:
            smtp.ehlo()

            smtp.starttls(
                context=tls_context
            )

            smtp.ehlo()

            smtp.login(
                SMTP_USERNAME,
                SMTP_PASSWORD,
            )

            smtp.send_message(
                message
            )

    except (smtplib.SMTPException, OSError) as error:
        print(
            f"Email could not be sent: {error}"
        )
        return

    print(
        "SMTP server accepted the test email."
    )
    print(
        "Check the recipient's inbox and spam folder."
    )


if __name__ == "__main__":
    main()