import cv2 as cv

from app.config import (
    AVAILABLE_COLOR,
    OCCUPIED_COLOR,
    UNKNOWN_COLOR
)
from app.parking_logic import normalize_status


def draw_detection(frame, detection):
    status = normalize_status(
        detection["class_name"]
    )

    x1 = detection["x1"]
    y1 = detection["y1"]
    x2 = detection["x2"]
    y2 = detection["y2"]

    spot_id = detection["spot_id"]

    if status == "available":
        color = AVAILABLE_COLOR
    elif status == "occupied":
        color = OCCUPIED_COLOR
    else:
        color = UNKNOWN_COLOR

    # Confidence is intentionally hidden
    label = f"{spot_id}: {status}"

    cv.rectangle(
        frame,
        (x1, y1),
        (x2, y2),
        color,
        3
    )

    cv.putText(
        frame,
        label,
        (x1, max(y1 - 10, 25)),
        cv.FONT_HERSHEY_SIMPLEX,
        0.7,
        color,
        2,
        cv.LINE_AA
    )

def draw_license_plates(frame, detections):
    plate_color = (255, 0, 0)  # Blue in OpenCV BGR format

    for index, detection in enumerate(
        detections,
        start=1
    ):
        x1 = detection["x1"]
        y1 = detection["y1"]
        x2 = detection["x2"]
        y2 = detection["y2"]

        label = f"Plate {index}"

        cv.rectangle(
            frame,
            (x1, y1),
            (x2, y2),
            plate_color,
            2
        )

        cv.putText(
            frame,
            label,
            (x1, max(y1 - 8, 25)),
            cv.FONT_HERSHEY_SIMPLEX,
            0.6,
            plate_color,
            2,
            cv.LINE_AA
        )


def draw_all_detections(frame, detections):
    for detection in detections:
        draw_detection(frame, detection)


def draw_dashboard(frame, summary):
    cv.rectangle(
        frame,
        (20, 20),
        (600, 260),
        (0, 0, 0),
        -1
    )

    cv.rectangle(
        frame,
        (20, 20),
        (600, 260),
        (255, 255, 255),
        2
    )

    cv.putText(
        frame,
        f"Total: {summary.total}",
        (40, 60),
        cv.FONT_HERSHEY_SIMPLEX,
        0.8,
        (255, 255, 255),
        2,
        cv.LINE_AA
    )

    cv.putText(
        frame,
        f"Available: {summary.available}",
        (40, 100),
        cv.FONT_HERSHEY_SIMPLEX,
        0.8,
        (0, 255, 0),
        2,
        cv.LINE_AA
    )

    cv.putText(
        frame,
        f"Occupied: {summary.occupied}",
        (40, 140),
        cv.FONT_HERSHEY_SIMPLEX,
        0.8,
        (0, 0, 255),
        2,
        cv.LINE_AA
    )

    available_text = ", ".join(
        summary.available_spot_ids
    )

    if not available_text:
        available_text = "None"

    cv.putText(
        frame,
        "Open spots:",
        (40, 185),
        cv.FONT_HERSHEY_SIMPLEX,
        0.7,
        (0, 255, 0),
        2,
        cv.LINE_AA
    )

    cv.putText(
        frame,
        available_text,
        (40, 220),
        cv.FONT_HERSHEY_SIMPLEX,
        0.65,
        (255, 255, 255),
        2,
        cv.LINE_AA
    )