"""Read-only parking API for the future mobile interface."""

from fastapi import FastAPI, Response

from app.parking.status_store import read_status

from app.api.auth_routes import router as auth_router


app = FastAPI(
    title="SpartanSpot API",
    description="Current availability for the SpartanSpot parking lot.",
    version="0.1.0",
)

app.include_router(auth_router)


@app.get("/api/health")
def health():
    """Confirm that the backend is running."""

    return {
        "status": "ok",
    }


@app.get("/api/spaces")
def get_spaces(response: Response):
    """Return the latest parking status and aggregate counts."""

    # Ask browsers to fetch fresh availability for each request.
    response.headers["Cache-Control"] = "no-store"

    payload = read_status()

    counts = {
        "available": 0,
        "occupied": 0,
        "reserved": 0,
        "disconnected": 0,
    }

    for space in payload["spaces"]:
        counts[space["status"]] += 1

    return {
        **payload,
        "total_spaces": len(payload["spaces"]),
        "counts": counts,
    }