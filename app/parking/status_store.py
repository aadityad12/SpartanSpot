"""Share current parking status between the camera and API.

The camera writes a small JSON file.
The API reads it without opening the camera or loading YOLO.

Only one camera process should write this file.
"""

import json
import os
import tempfile
import time
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
        return {
            "camera_id": CAMERA_ID,
            "camera_online": False,
            "updated_at": None,
            "spaces": [
                {
                    "spot_id": spot_id,
                    "status": "disconnected",
                }
                for spot_id in SPACE_IDS
            ],
        }