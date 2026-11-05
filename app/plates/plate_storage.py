"""Crop camera images and save full parking-space images."""

import re
from datetime import datetime, timezone

import cv2 as cv

from app.config import CAMERA_ID, PARKING_LOT_DIR


def crop_detection(
    frame,
    detection,
    padding: int = 5,
):
    """Crop a detection while keeping coordinates inside the frame."""

    x1 = max(0, int(detection["x1"]) - padding)
    y1 = max(0, int(detection["y1"]) - padding)
    x2 = min(
        frame.shape[1],
        int(detection["x2"]) + padding,
    )
    y2 = min(
        frame.shape[0],
        int(detection["y2"]) + padding,
    )

    return frame[y1:y2, x1:x2]


def safe_plate_name(plate_text: str) -> str:
    """Keep only uppercase letters and numbers for the plate folder."""

    cleaned = re.sub(
        r"[^A-Z0-9]",
        "",
        plate_text.upper(),
    )

    return cleaned or "UNKNOWN"


def save_parking_image(
    crop,
    spot_id: str,
    category: str,
    plate_text: str,
):
    """Save a full parking-space crop and return its file path."""

    # Check the image before creating directories or writing files.
    if crop is None or crop.size == 0:
        raise ValueError(
            "Cannot save an empty parking-space image."
        )

    category = category.strip().upper()

    if category not in {"VALID", "INVALID", "UNREADABLE"}:
        raise ValueError(
            f"Unsupported image category: {category}"
        )

    timestamp = datetime.now(
        timezone.utc
    ).strftime("%Y%m%d_%H%M%S_%f")

    # Build the directory shared by all categories.
    directory = (
        PARKING_LOT_DIR
        / CAMERA_ID
        / spot_id
        / category
    )

    if category == "UNREADABLE":
        filename = f"{spot_id}_{timestamp}.jpg"

    else:
        plate_name = safe_plate_name(plate_text)

        directory = directory / plate_name
        filename = f"{plate_name}.jpg"

    directory.mkdir(
        parents=True,
        exist_ok=True,
    )

    # Define the complete file path before passing it to OpenCV.
    # This line fixes the NameError.
    path = directory / filename

    if not cv.imwrite(str(path), crop):
        raise RuntimeError(
            f"Could not save parking image: {path}"
        )

    return path