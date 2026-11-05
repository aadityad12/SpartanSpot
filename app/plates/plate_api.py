"""Read license plates using Plate Recognizer.

The API token is loaded from an environment variable.
Only the image supplied to read_image() is uploaded.
"""

import os

import cv2 as cv
import requests


class PlateApiReader:
    """Send a cropped plate image and return recognized text."""

    API_URL = (
        "https://api.platerecognizer.com"
        "/v1/plate-reader/"
    )

    def __init__(
        self,
        token_env: str,
        region: str,
    ):
        """Load the API token and region setting."""

        self.token = os.getenv(
            token_env,
            "",
        ).strip()

        self.region = region

        if not self.token:
            raise RuntimeError(
                f"Set the {token_env} environment variable "
                "before starting the application."
            )

    def read_image(self, image):
        """Return (plate_text, confidence), or None when no plate is read.

        Network and API errors are raised to the parking service,
        which handles retry tracking.
        """

        if image is None or image.size == 0:
            return None

        # Encode the crop in memory. No temporary image file is needed.
        success, encoded = cv.imencode(
            ".jpg",
            image,
        )

        if not success:
            raise RuntimeError(
                "Could not encode the plate crop."
            )

        data = {}

        if self.region:
            data["regions"] = self.region

        response = requests.post(
            self.API_URL,
            headers={
                "Authorization": f"Token {self.token}",
            },
            files={
                "upload": (
                    "plate.jpg",
                    encoded.tobytes(),
                    "image/jpeg",
                ),
            },
            data=data,
            timeout=(5, 30),
        )

        response.raise_for_status()

        results = response.json().get(
            "results",
            [],
        )

        if not results:
            return None

        # Choose the result with the highest recognition score.
        best = max(
            results,
            key=lambda item: float(
                item.get("score", 0.0)
            ),
        )

        plate_text = str(
            best.get("plate", "")
        ).strip().upper()

        if not plate_text:
            return None

        confidence = float(
            best.get("score", 0.0)
        )

        return plate_text, confidence