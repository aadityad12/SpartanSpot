import time
import cv2 as cv

from app.camera import Camera
from app.config import (
    MODEL_PATH,
    DATABASE_PATH,
    CAMERA_INDEX,
    CONFIDENCE_THRESHOLD,
    IMAGE_SIZE,
    WINDOW_NAME,
    DATABASE_UPDATE_INTERVAL,
    DETECTION_INTERVAL,
    LICENSE_PLATE_MODEL_PATH,
    PLATE_CONFIDENCE_THRESHOLD,
    TARGET_WIDTH,
    TARGET_HEIGHT
)
from app.license_plate_detector import (
    LicensePlateDetector
)


from app.database import ParkingDatabase
from app.detector import ParkingDetector
from app.parking_logic import summarize_detections
from app.visualization import (
    draw_all_detections,
    draw_dashboard,
    draw_license_plates
)
from app.database_updater import DatabaseUpdater


def main():
    detector = ParkingDetector(
        model_path=MODEL_PATH,
        confidence_threshold=CONFIDENCE_THRESHOLD,
        image_size=IMAGE_SIZE
    )

    plate_detector = LicensePlateDetector(
        model_path=LICENSE_PLATE_MODEL_PATH,
        confidence_threshold=PLATE_CONFIDENCE_THRESHOLD,
        image_size=IMAGE_SIZE
    )

    camera = Camera(CAMERA_INDEX)
    database = ParkingDatabase(DATABASE_PATH)

    database_updater = DatabaseUpdater(
        database=database,
        update_interval=DATABASE_UPDATE_INTERVAL
    )
    # Create a resizable window
    cv.namedWindow(
        WINDOW_NAME,
        cv.WINDOW_NORMAL
    )

    cv.resizeWindow(
        WINDOW_NAME,
        TARGET_WIDTH,
        TARGET_HEIGHT
    )

    last_detection_time = 0
    last_detections = []
    last_plate_detections = []

    try:
        while True:
            frame = camera.read()

            if frame is None:
                print("Could not read camera frame.")
                break

            frame = cv.resize(
                frame,
                (TARGET_WIDTH, TARGET_HEIGHT),
                interpolation=cv.INTER_AREA
            )

            current_time = time.monotonic()

            # Run both models once per second
            if (
                current_time - last_detection_time
                >= DETECTION_INTERVAL
            ):
                last_detections = detector.detect(frame)

                if last_detections is None:
                    last_detections = []

                last_plate_detections = plate_detector.detect(frame)

                if last_plate_detections is None:
                    last_plate_detections = []

                last_detection_time = current_time

                print(
                    "Parking and license-plate "
                    "detection updated."
                )

            detections = last_detections

            summary = summarize_detections(
                detections
            )

            draw_all_detections(
                frame,
                detections
            )

            draw_license_plates(
                frame,
                last_plate_detections
            )

            draw_dashboard(
                frame,
                summary
            )

            database_updater.update_if_needed(
                detections
            )

            cv.imshow(
                WINDOW_NAME,
                frame
            )

            # Press q to quit
            if cv.waitKey(1) & 0xFF == ord("q"):
                break

    finally:
        camera.release()
        database.close()
        cv.destroyAllWindows()

if __name__ == "__main__":
    main()