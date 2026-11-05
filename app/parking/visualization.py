"""Draw parking-space status and license-plate boxes.

These functions draw on a copy of the camera frame so saved images
and API crops do not contain colored boxes or labels.
"""

import cv2 as cv

from app.config import (
    AVAILABLE_COLOR,
    DISCONNECTED_COLOR,
    OCCUPIED_COLOR,
    PLATE_COLOR,
    RESERVED_COLOR,
    UNKNOWN_COLOR,
)


def draw_box(frame, box, label: str, color):
    """Draw one bounding box and its label on the supplied image."""

    cv.rectangle(
        frame,
        (box["x1"], box["y1"]),
        (box["x2"], box["y2"]),
        color,
        3,
    )

    cv.putText(
        frame,
        label,
        (box["x1"], max(box["y1"] - 10, 25)),
        cv.FONT_HERSHEY_SIMPLEX,
        0.7,
        color,
        2,
        cv.LINE_AA,
    )


def draw_parking_status(
    frame,
    tracker,
    plate_detections,
    reserved_spot_ids,
):
    """Return an annotated copy of the current camera frame.

    Reservations affect the displayed status. The tracker continues
    recording what the camera sees: available, occupied, or disconnected.
    """

    display = frame.copy()

    colors = {
        "available": AVAILABLE_COLOR,
        "reserved": RESERVED_COLOR,
        "occupied": OCCUPIED_COLOR,
        "disconnected": DISCONNECTED_COLOR,
    }

    for spot_id, slot in tracker.slots.items():
        # A box may not exist yet during camera calibration.
        if slot.bbox is None:
            continue

        box = {
            "x1": slot.bbox[0],
            "y1": slot.bbox[1],
            "x2": slot.bbox[2],
            "y2": slot.bbox[3],
        }

        display_status = slot.status

        # Show RESERVED only when the camera sees an empty space.
        # Occupied and disconnected states take priority.
        if (
            slot.status == "available"
            and spot_id in reserved_spot_ids
        ):
            display_status = "reserved"

        label = f"{spot_id}: {display_status.upper()}"

        # Plate information belongs to the current occupied vehicle.
        if slot.status == "occupied":
            if slot.validation_status:
                label += f" - {slot.validation_status.upper()}"

            if slot.plate_text:
                label += f" {slot.plate_text}"

        color = colors.get(
            display_status,
            UNKNOWN_COLOR,
        )

        draw_box(
            display,
            box,
            label,
            color,
        )

    for plate in plate_detections:
        draw_box(
            display,
            plate,
            "PLATE",
            PLATE_COLOR,
        )

    return display