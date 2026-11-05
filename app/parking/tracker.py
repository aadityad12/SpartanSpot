"""Remember fixed parking spaces and track their status.

The tracker:
    - Learns the space locations during calibration.
    - Keeps permanent IDs such as A1, A2, A3, and A4.
    - Confirms status changes over several observations.
    - Marks missing spaces as disconnected.
    - Schedules plate scans after continuous occupancy.
"""

from dataclasses import dataclass
from math import hypot


@dataclass
class SlotState:
    """Information remembered for one parking space."""

    spot_id: str
    center_x: float
    center_y: float

    status: str = "disconnected"
    last_seen: float = 0.0

    # Remember the physical state across a temporary disconnection.
    last_confirmed_status: str | None = None

    candidate_status: str | None = None
    candidate_since: float = 0.0

    occupied_since: float | None = None

    plate_attempts: int = 0
    next_plate_attempt: float = 0.0
    plate_finished: bool = False

    event_id: int | None = None
    plate_text: str | None = None
    validation_status: str | None = None
    image_path: str | None = None

    bbox: tuple[int, int, int, int] | None = None


class ParkingTracker:
    """Match detections to fixed spaces and emit status events."""

    def __init__(
        self,
        spot_ids,
        calibration_seconds,
        match_distance,
        status_confirmation_seconds,
        disconnected_seconds,
        occupancy_delay_seconds,
        retry_seconds,
        max_attempts,
    ):
        self.spot_ids = list(spot_ids)
        self.calibration_seconds = calibration_seconds
        self.match_distance = match_distance
        self.confirmation_seconds = status_confirmation_seconds
        self.disconnected_seconds = disconnected_seconds
        self.occupancy_delay_seconds = occupancy_delay_seconds
        self.retry_seconds = retry_seconds
        self.max_attempts = max_attempts

        self.started_at = None
        self.calibration_samples = []
        self.slots = {}

    @property
    def calibrated(self) -> bool:
        """Return True after all configured spaces are initialized."""

        return len(self.slots) == len(self.spot_ids)

    def observe(self, detections, now):
        """Update spaces and return occupied, available, and scan events."""

        events = {
            "occupied": [],
            "available": [],
            "scan": [],
        }

        if not self.calibrated:
            self._collect_calibration(detections, now)

            if self._calibration_finished(now):
                self._finish_calibration(now)

            return events

        matched = self._match_detections(detections)

        for spot_id, slot in self.slots.items():
            detection = matched.get(spot_id)

            if detection is None:
                # Missing observations interrupt status confirmation.
                slot.candidate_status = None

                # Require continuous visible occupancy before a scan.
                if not slot.plate_finished:
                    slot.occupied_since = None

                if (
                    now - slot.last_seen
                    >= self.disconnected_seconds
                ):
                    slot.status = "disconnected"

                continue

            slot.last_seen = now

            slot.bbox = (
                detection["x1"],
                detection["y1"],
                detection["x2"],
                detection["y2"],
            )

            self._update_status(
                slot,
                detection["class_name"],
                now,
                events,
            )

            if (
                slot.status == "occupied"
                and slot.candidate_status == "occupied"
                and not slot.plate_finished
                and slot.occupied_since is not None
                and now - slot.occupied_since
                >= self.occupancy_delay_seconds
                and now >= slot.next_plate_attempt
                and slot.plate_attempts < self.max_attempts
            ):
                events["scan"].append(spot_id)

        return events

    def _collect_calibration(self, detections, now):
        """Group repeated detections around their center positions."""

        if self.started_at is None:
            self.started_at = now

        used_samples = set()

        for detection in detections:
            best_index = None
            best_distance = self.match_distance

            for index, sample in enumerate(
                self.calibration_samples
            ):
                if index in used_samples:
                    continue

                distance = hypot(
                    detection["center_x"] - sample["center_x"],
                    detection["center_y"] - sample["center_y"],
                )

                if distance < best_distance:
                    best_distance = distance
                    best_index = index

            if best_index is None:
                self.calibration_samples.append(
                    {
                        "center_x": detection["center_x"],
                        "center_y": detection["center_y"],
                        "hits": 1,
                    }
                )

                used_samples.add(
                    len(self.calibration_samples) - 1
                )

            else:
                sample = self.calibration_samples[best_index]
                hits = sample["hits"]

                sample["center_x"] = (
                    sample["center_x"] * hits
                    + detection["center_x"]
                ) / (hits + 1)

                sample["center_y"] = (
                    sample["center_y"] * hits
                    + detection["center_y"]
                ) / (hits + 1)

                sample["hits"] += 1
                used_samples.add(best_index)

    def _calibration_finished(self, now):
        """Wait for the calibration period and enough space locations."""

        return (
            self.started_at is not None
            and now - self.started_at
            >= self.calibration_seconds
            and len(self.calibration_samples)
            >= len(self.spot_ids)
        )

    def _finish_calibration(self, now):
        """Choose the strongest locations and assign permanent IDs."""

        strongest = sorted(
            self.calibration_samples,
            key=lambda sample: sample["hits"],
            reverse=True,
        )[:len(self.spot_ids)]

        # For a single row of four spaces, assign IDs left to right.
        strongest.sort(
            key=lambda sample: sample["center_x"]
        )

        for spot_id, sample in zip(
            self.spot_ids,
            strongest,
        ):
            self.slots[spot_id] = SlotState(
                spot_id=spot_id,
                center_x=sample["center_x"],
                center_y=sample["center_y"],
                last_seen=now,
            )

        print(
            "Calibration complete:",
            list(self.slots),
        )

    def _match_detections(self, detections):
        """Assign each detection to at most one fixed space."""

        candidates = []

        for spot_id, slot in self.slots.items():
            for index, detection in enumerate(detections):
                distance = hypot(
                    detection["center_x"] - slot.center_x,
                    detection["center_y"] - slot.center_y,
                )

                if distance < self.match_distance:
                    candidates.append(
                        (distance, spot_id, index)
                    )

        # Consider the closest pairs first.
        candidates.sort()

        matched = {}
        used_detections = set()

        for distance, spot_id, index in candidates:
            if spot_id in matched:
                continue

            if index in used_detections:
                continue

            matched[spot_id] = detections[index]
            used_detections.add(index)

        return matched

    def _update_status(self, slot, observed, now, events):
        """Require a stable observation before confirming its status."""

        if observed not in {"available", "occupied"}:
            return

        if observed != "occupied":
            slot.occupied_since = None

        if slot.candidate_status != observed:
            slot.candidate_status = observed
            slot.candidate_since = now
            return

        if (
            now - slot.candidate_since
            < self.confirmation_seconds
        ):
            return

        previous = slot.last_confirmed_status
        slot.status = observed

        if previous == observed:
            # Reconnecting to an occupied space should not create a
            # second event for the same assumed parking session.
            if (
                observed == "occupied"
                and slot.occupied_since is None
            ):
                slot.occupied_since = now

            return

        slot.last_confirmed_status = observed

        if observed == "occupied":
            slot.occupied_since = now
            slot.plate_attempts = 0
            slot.next_plate_attempt = (
                now + self.occupancy_delay_seconds
            )
            slot.plate_finished = False
            slot.plate_text = None
            slot.validation_status = None
            slot.image_path = None

            events["occupied"].append(slot.spot_id)

        else:
            slot.occupied_since = None
            slot.plate_attempts = 0
            slot.next_plate_attempt = 0.0
            slot.plate_finished = False

            events["available"].append(slot.spot_id)

    def begin_plate_attempt(self, spot_id, now):
        """Count one attempt and schedule the next possible retry."""

        slot = self.slots[spot_id]
        slot.plate_attempts += 1
        slot.next_plate_attempt = now + self.retry_seconds

    def record_plate_success(
        self,
        spot_id,
        plate_text,
        validation_status,
        image_path,
    ):
        """Stop scanning after successfully reading a plate."""

        slot = self.slots[spot_id]
        slot.plate_finished = True
        slot.plate_text = plate_text
        slot.validation_status = validation_status
        slot.image_path = image_path

    def record_plate_failure(self, spot_id):
        """Mark the session unreadable after the last allowed attempt."""

        slot = self.slots[spot_id]

        if slot.plate_attempts >= self.max_attempts:
            slot.plate_finished = True
            slot.plate_text = "UNREADABLE"
            slot.validation_status = "UNREADABLE"

    def states(self):
        """Return the current states for occupancy summaries."""

        return list(self.slots.values())