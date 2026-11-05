"""Coordinate parking events and license-plate processing.

Responsibilities:
    - Save occupied/available status changes.
    - Process plate scans requested by the tracker.
    - Send plate crops to Plate Recognizer.
    - Save full parking-space images locally.
    - Update parking records and reservations.

The tracker decides when a scan is due, including the initial
10-second occupancy delay and the delay between retries.
"""

from app.config import MAX_PLATE_ATTEMPTS

from app.plates.plate_storage import (
    crop_detection,
    save_parking_image,
)


def process_status_events(
    events,
    tracker,
    database,
    camera_id: str,
):
    """Save occupied and available transitions."""

    for spot_id in events["occupied"]:
        slot = tracker.slots[spot_id]

        reservation = database.get_reservation_for_spot(
            spot_id
        )

        reservation_id = None

        if reservation is not None:
            reservation_id = reservation["reservation_id"]

        slot.event_id = database.start_event(
            camera_id=camera_id,
            spot_id=spot_id,
            reservation_id=reservation_id,
        )

        print(f"{spot_id} became occupied.")

    for spot_id in events["available"]:
        slot = tracker.slots[spot_id]

        if slot.event_id is not None:
            database.finish_event(
                slot.event_id
            )

        # Remove information belonging to the previous vehicle.
        slot.event_id = None
        slot.plate_text = None
        slot.validation_status = None
        slot.image_path = None

        print(f"{spot_id} became available.")


def plate_inside_slot(plate, slot_box) -> bool:
    """Check whether a plate's center is inside a parking-space box."""

    center_x = (
        plate["x1"] + plate["x2"]
    ) / 2

    center_y = (
        plate["y1"] + plate["y2"]
    ) / 2

    return (
        slot_box["x1"] <= center_x <= slot_box["x2"]
        and
        slot_box["y1"] <= center_y <= slot_box["y2"]
    )


def find_plate_for_slot(
    plate_detections,
    slot_box,
):
    """Return the most confident plate inside this parking space.

    Return None when no matching plate was detected.
    """

    matching_plates = [
        plate
        for plate in plate_detections
        if plate_inside_slot(plate, slot_box)
    ]

    return max(
        matching_plates,
        key=lambda plate: plate.get("confidence", 0.0),
        default=None,
    )


def record_failed_scan(
    spot_id: str,
    spot_crop,
    tracker,
    database,
):
    """Handle a failed attempt and save the spot after the final failure."""

    slot = tracker.slots[spot_id]

    tracker.record_plate_failure(
        spot_id
    )

    print(
        f"{spot_id}: plate attempt "
        f"{slot.plate_attempts}/{MAX_PLATE_ATTEMPTS} failed."
    )

    if slot.plate_attempts < MAX_PLATE_ATTEMPTS:
        return

    # Save the full parking-space image for manual review.
    path = save_parking_image(
        crop=spot_crop,
        spot_id=spot_id,
        category="UNREADABLE",
        plate_text="UNREADABLE",
    )

    slot.image_path = str(path)

    if slot.event_id is not None:
        database.update_event_plate(
            event_id=slot.event_id,
            plate_text="UNREADABLE",
            validation_status="UNREADABLE",
            image_path=str(path),
        )

    print(
        f"{spot_id}: saved parking image to {path}"
    )


def process_plate_scans(
    events,
    frame,
    slot_boxes,
    plate_detections,
    tracker,
    database,
    api_reader,
    now: float,
):
    """Process the parking spaces whose scan timers are ready.

    Args:
        events: Events returned by tracker.observe().
        frame: Original camera frame without display annotations.
        slot_boxes: Current parking boxes, indexed by spot ID.
        plate_detections: Plate boxes detected in this frame.
        tracker: Parking-space state and retry timers.
        database: ParkingDatabase instance.
        api_reader: PlateApiReader instance.
        now: Current time from time.monotonic().
    """

    for spot_id in events["scan"]:
        slot = tracker.slots[spot_id]
        slot_box = slot_boxes.get(spot_id)

        # A missing space cannot be cropped reliably.
        # Wait for another observation without consuming an attempt.
        if slot_box is None:
            continue

        spot_crop = crop_detection(
            frame,
            slot_box,
        )

        if spot_crop.size == 0:
            continue

        tracker.begin_plate_attempt(
            spot_id,
            now,
        )

        plate_box = find_plate_for_slot(
            plate_detections,
            slot_box,
        )

        # No plate box means there is no plate crop to send.
        if plate_box is None:
            record_failed_scan(
                spot_id,
                spot_crop,
                tracker,
                database,
            )
            continue

        plate_crop = crop_detection(
            frame,
            plate_box,
        )

        if plate_crop.size == 0:
            record_failed_scan(
                spot_id,
                spot_crop,
                tracker,
                database,
            )
            continue

        try:
            # Only the small plate image is sent to the API.
            result = api_reader.read_image(
                plate_crop
            )

        except Exception as error:
            # Count an API failure as a failed attempt.
            print(
                f"{spot_id}: Plate API request failed: {error}"
            )
            result = None

        if result is None:
            record_failed_scan(
                spot_id,
                spot_crop,
                tracker,
                database,
            )
            continue

        plate_text, confidence = result

        # Check the paid permit and any reservation assigned to this spot.
        validation = database.validate_plate_for_spot(
            spot_id,
            plate_text,
        ).upper()

        # Save the complete parking-space image.
        path = save_parking_image(
            crop=spot_crop,
            spot_id=spot_id,
            category=validation,
            plate_text=plate_text,
        )

        tracker.record_plate_success(
            spot_id=spot_id,
            plate_text=plate_text,
            validation_status=validation,
            image_path=str(path),
        )

        if slot.event_id is not None:
            database.update_event_plate(
                event_id=slot.event_id,
                plate_text=plate_text,
                validation_status=validation,
                image_path=str(path),
            )

        reservation = database.get_reservation_for_spot(
            spot_id
        )

        if (
            validation == "VALID"
            and reservation is not None
        ):
            database.fulfill_reservation(
                reservation["reservation_id"]
            )

        print(
            f"{spot_id}: {plate_text} "
            f"({validation}, confidence={confidence:.2f})"
        )