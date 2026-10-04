import time

from app.parking_logic import normalize_status


class DatabaseUpdater:
    def __init__(self, database, update_interval):
        self.database = database
        self.update_interval = update_interval
        self.last_update_time = 0

    def update_if_needed(self, detections):
        current_time = time.monotonic()

        if (
            current_time - self.last_update_time
            < self.update_interval
        ):
            return False

        for detection in detections:
            status = normalize_status(
                detection["class_name"]
            )

            self.database.update_spot(
                spot_id=detection["spot_id"],
                status=status,
                confidence=detection["confidence"]
            )

        self.last_update_time = current_time

        print("Database updated.")
        return True