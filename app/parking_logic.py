from dataclasses import dataclass


@dataclass
class ParkingSummary:
    total: int
    available: int
    occupied: int
    available_spot_ids: list[str]


def normalize_status(class_name):
    name = class_name.lower().replace("_", "-")

    if name in [
        "occupied",
        "space-occupied",
        "parking-occupied"
    ]:
        return "occupied"

    if name in [
        "available",
        "empty",
        "space-empty",
        "parking-empty"
    ]:
        return "available"

    return "unknown"


def summarize_detections(detections):
    available_count = 0
    occupied_count = 0
    available_spot_ids = []

    for detection in detections:
        status = normalize_status(
            detection["class_name"]
        )

        if status == "available":
            available_count += 1
            available_spot_ids.append(
                detection["spot_id"]
            )

        elif status == "occupied":
            occupied_count += 1

    available_spot_ids = sorted(
        set(available_spot_ids)
    )

    return ParkingSummary(
        total=available_count + occupied_count,
        available=available_count,
        occupied=occupied_count,
        available_spot_ids=available_spot_ids
    )