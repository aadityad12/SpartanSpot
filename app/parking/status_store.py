"""Share current parking status between the camera and API.

The camera writes a small JSON file.
The API reads it without opening the camera or loading YOLO.

Only one camera process should write this file.
"""

import json
import os
import tempfile
import time
from datetime import datetime, timezone
from pathlib import Path

from app.config import (
    CAMERA_ID,
    PROJECT_ROOT,
    SPACE_IDS,
)


STATUS_FILE = (
    PROJECT_ROOT / "data" / "live_status.json"
)

# If the camera stops publishing, its last status becomes untrustworthy.
# A slow synchronous plate API request may also trigger this timeout.
STATUS_TIMEOUT_SECONDS = 10.0


def disconnected_status():
    """Return a safe response when the camera has not published recently."""

    # Keep this fallback centralized so every API entry point cannot expose
    # stale availability as if it were current.
    return {
        "camera_id": CAMERA_ID,
        "camera_online": False,
        "updated_at": None,
        "spaces": [
            {"spot_id": spot_id, "status": "disconnected"}
            for spot_id in SPACE_IDS
        ],
    }


def publish_status(
    tracker,
    reserved_spot_ids,
):
    """Save the current status without including customer or plate data."""

    spaces = []

    for spot_id in SPACE_IDS:
        slot = tracker.slots.get(spot_id)

        status = (
            slot.status
            if slot is not None
            else "disconnected"
        )

        if (
            status == "available"
            and spot_id in reserved_spot_ids
        ):
            status = "reserved"

        spaces.append(
            {
                "spot_id": spot_id,
                "status": status,
            }
        )

    payload = {
        "camera_id": CAMERA_ID,
        "updated_at": time.time(),
        "spaces": spaces,
    }

    STATUS_FILE.parent.mkdir(
        parents=True,
        exist_ok=True,
    )

    # Write a complete temporary file first.
    # Replacing the destination prevents the API from reading half-written JSON.
    temporary_path = None

    try:
        with tempfile.NamedTemporaryFile(
            mode="w",
            encoding="utf-8",
            dir=STATUS_FILE.parent,
            suffix=".tmp",
            delete=False,
        ) as temporary_file:
            temporary_path = Path(
                temporary_file.name
            )

            json.dump(
                payload,
                temporary_file,
            )

        os.replace(
            temporary_path,
            STATUS_FILE,
        )

    finally:
        if temporary_path is not None:
            temporary_path.unlink(
                missing_ok=True
            )


def read_status():
    """Return current status, or disconnected spaces if data is stale."""

    try:
        payload = json.loads(
            STATUS_FILE.read_text(
                encoding="utf-8"
            )
        )

        updated_at = float(
            payload["updated_at"]
        )

        age = time.time() - updated_at

        if not 0 <= age <= STATUS_TIMEOUT_SECONDS:
            raise ValueError("Camera status is stale.")

        stored_spaces = {
            item["spot_id"]: item["status"]
            for item in payload["spaces"]
        }

        allowed_statuses = {
            "available",
            "occupied",
            "reserved",
            "disconnected",
        }

        spaces = []

        for spot_id in SPACE_IDS:
            status = stored_spaces.get(
                spot_id,
                "disconnected",
            )

            if status not in allowed_statuses:
                status = "disconnected"

            spaces.append(
                {
                    "spot_id": spot_id,
                    "status": status,
                }
            )

        return {
            "camera_id": CAMERA_ID,
            "camera_online": True,
            "updated_at": updated_at,
            "spaces": spaces,
        }

    except (
        OSError,
        ValueError,
        KeyError,
        TypeError,
    ):
        # Never show old availability as if it were current.
        return disconnected_status()


def mobile_feed():
    """Convert internal camera status into the mobile app's public contract."""

    payload = read_status()
    counts = {"available": 0, "occupied": 0, "reserved": 0, "disconnected": 0}
    for space in payload["spaces"]:
        counts[space["status"]] += 1

    updated_at = payload["updated_at"]
    # JavaScript Date.parse requires an ISO string; the status file uses Unix
    # seconds so the camera and API can write/read it without timezone issues.
    updated_at_iso = (
        datetime.fromtimestamp(updated_at, tz=timezone.utc).isoformat()
        if updated_at is not None else None
    )
    return {
        "mode": "live",
        "updatedAt": updated_at_iso,
        "lots": [{
            "id": payload["camera_id"],
            "name": "Camera-monitored lot",
            "subtitle": "Live camera detections · Counts are estimates",
            "available": counts["available"],
            "total": len(payload["spaces"]),
            "unknown": counts["disconnected"],
            "walkMinutes": None,
            "permit": "Check posted permit requirements",
            "tags": [],
            "mapX": 65,
            "mapY": 45,
            "destination": None,
            "location": None,
            "updatedAt": updated_at_iso,
        }],
    }
