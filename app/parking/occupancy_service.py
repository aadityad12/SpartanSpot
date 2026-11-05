"""Create aggregate parking summaries for busy-time analysis."""


def record_occupancy_snapshot(
    tracker,
    database,
    camera_id: str,
    total_spaces: int,
    reserved_spot_ids,
):
    """Count parking states and save one database snapshot.

    Call this function at the configured snapshot interval.

    An empty reserved space counts as reserved.
    An occupied reserved space counts as occupied.
    A disconnected space counts as disconnected.
    """

    occupied = 0
    available = 0
    reserved = 0
    disconnected = 0

    for slot in tracker.states():
        if slot.status == "occupied":
            occupied += 1

        elif slot.status == "available":
            if slot.spot_id in reserved_spot_ids:
                reserved += 1
            else:
                available += 1

        else:
            # Include spaces whose status cannot currently be determined.
            disconnected += 1

    # Spaces not yet initialized by the tracker remain part of the lot.
    missing_spaces = max(
        0,
        total_spaces - len(tracker.states()),
    )

    disconnected += missing_spaces

    database.record_snapshot(
        camera_id=camera_id,
        total_spaces=total_spaces,
        occupied_spaces=occupied,
        available_spaces=available,
        disconnected_spaces=disconnected,
        reserved_spaces=reserved,
    )