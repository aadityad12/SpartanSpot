"""Run the SpartanSpot camera application.

This file coordinates the smaller modules:

    Camera -> Detector -> Tracker -> Parking service -> Display

Parking images, plate recognition, and database operations are handled
by their respective modules.
"""

import time

import cv2 as cv
from ultralytics import YOLO

from app.config import (
    CALIBRATION_MATCH_DISTANCE,
    CALIBRATION_SECONDS,
    CAMERA_ID,
    CAMERA_INDEX,
    DATABASE_PATH,
    DETECTION_INTERVAL_SECONDS,
    EXPECTED_SPACE_COUNT,
    FRAME_HEIGHT,
    FRAME_WIDTH,
    MAX_PLATE_ATTEMPTS,
    MODEL_PATH,
    OCCUPANCY_DELAY_SECONDS,
    PLATE_API_TOKEN_ENV,
    PLATE_REGION,
    PLATE_RETRY_SECONDS,
    SLOT_DISCONNECTED_SECONDS,
    SNAPSHOT_INTERVAL_SECONDS,
    SPACE_IDS,
    STATUS_CONFIRMATION_SECONDS,
    WINDOW_NAME,
)

from app.database.database import ParkingDatabase

from app.parking.camera import Camera
from app.parking.detector import run_model
from app.parking.occupancy_service import (
    record_occupancy_snapshot,
)
from app.parking.parking_service import (
    process_plate_scans,
    process_status_events,
)
from app.parking.tracker import ParkingTracker
from app.parking.visualization import (
    draw_parking_status,
)

from app.plates.plate_api import PlateApiReader

from app.parking.status_store import publish_status

def main():
    """Initialize resources and run the camera loop."""

    # These start as None so cleanup also works if initialization fails.
    database = None
    camera = None

    try:
        model = YOLO(
            str(MODEL_PATH)
        )

        print(
            "Loaded model classes:",
            model.names,
        )

        database = ParkingDatabase(
            DATABASE_PATH
        )

        api_reader = PlateApiReader(
            token_env=PLATE_API_TOKEN_ENV,
            region=PLATE_REGION,
        )

        tracker = ParkingTracker(
            spot_ids=SPACE_IDS,
            calibration_seconds=CALIBRATION_SECONDS,
            match_distance=CALIBRATION_MATCH_DISTANCE,
            status_confirmation_seconds=(
                STATUS_CONFIRMATION_SECONDS
            ),
            disconnected_seconds=(
                SLOT_DISCONNECTED_SECONDS
            ),
            occupancy_delay_seconds=(
                OCCUPANCY_DELAY_SECONDS
            ),
            retry_seconds=PLATE_RETRY_SECONDS,
            max_attempts=MAX_PLATE_ATTEMPTS,
        )

        camera = Camera(
            camera_index=CAMERA_INDEX,
            width=FRAME_WIDTH,
            height=FRAME_HEIGHT,
        )

        # monotonic() measures elapsed time reliably.
        # It is separate from the calendar timestamps stored in SQLite.
        last_detection_at = (
            time.monotonic()
            - DETECTION_INTERVAL_SECONDS
        )

        last_snapshot_at = time.monotonic()

        latest_plates = []
        reserved_spot_ids = set()

        print(
            "Camera running. Press Q in the camera window to exit."
        )

        while True:
            success, frame = camera.read()

            if not success:
                print("Camera frame unavailable.")
                break

            now = time.monotonic()

            if (
                now - last_detection_at
                >= DETECTION_INTERVAL_SECONDS
            ):
                # The detector reads the original frame.
                # Drawing happens later on a separate display copy.
                parking_detections, latest_plates = run_model(
                    model,
                    frame,
                )

                events = tracker.observe(
                    parking_detections,
                    now,
                )

                process_status_events(
                    events=events,
                    tracker=tracker,
                    database=database,
                    camera_id=CAMERA_ID,
                )

                # The tracker stores the latest bounding box for each ID.
                # Build the dictionary expected by the plate service.
                slot_boxes = {}

                for spot_id, slot in tracker.slots.items():
                    if slot.bbox is None:
                        continue

                    slot_boxes[spot_id] = {
                        "x1": slot.bbox[0],
                        "y1": slot.bbox[1],
                        "x2": slot.bbox[2],
                        "y2": slot.bbox[3],
                    }

                # The tracker requests scans only after the occupancy
                # delay and when another attempt is allowed.
                process_plate_scans(
                    events=events,
                    frame=frame,
                    slot_boxes=slot_boxes,
                    plate_detections=latest_plates,
                    tracker=tracker,
                    database=database,
                    api_reader=api_reader,
                    now=now,
                )

                # Refresh after scanning because a successful arrival
                # may have fulfilled a reservation.
                reserved_spot_ids = (
                    database.get_reserved_spot_ids()
                )

                # Publish current availability for the backend API.
                publish_status(
                    tracker=tracker,
                    reserved_spot_ids=reserved_spot_ids,
                )

                last_detection_at = now

            # Refresh the clock because an API request may take time.
            now = time.monotonic()

            if (
                tracker.calibrated
                and now - last_snapshot_at
                >= SNAPSHOT_INTERVAL_SECONDS
            ):
                record_occupancy_snapshot(
                    tracker=tracker,
                    database=database,
                    camera_id=CAMERA_ID,
                    total_spaces=EXPECTED_SPACE_COUNT,
                    reserved_spot_ids=reserved_spot_ids,
                )

                last_snapshot_at = now

            display = draw_parking_status(
                frame=frame,
                tracker=tracker,
                plate_detections=latest_plates,
                reserved_spot_ids=reserved_spot_ids,
            )

            cv.imshow(
                WINDOW_NAME,
                display,
            )

            if cv.waitKey(1) & 0xFF == ord("q"):
                break

    finally:
        # Release resources even if initialization or processing fails.
        try:
            if camera is not None:
                camera.release()
        finally:
            try:
                if database is not None:
                    database.close()
            finally:
                cv.destroyAllWindows()


if __name__ == "__main__":
    main()