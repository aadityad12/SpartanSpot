"""Read-only parking API for the future mobile interface."""

from fastapi import FastAPI, Response

from app.parking.status_store import mobile_feed

from app.api.auth_routes import router as auth_router

from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    title="SpartanSpot API",
    description="Current availability for the SpartanSpot parking lot.",
    version="0.1.0",
)

app.include_router(auth_router)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Development only
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/health")
def health():
    """Confirm that the backend is running."""

    return {
        "status": "ok",
    }


@app.get("/api/spaces")
def get_spaces(response: Response):
    """Return the mobile parking-feed contract from the camera status file."""

    # Ask browsers to fetch fresh availability for each request.
    response.headers["Cache-Control"] = "no-store"

    return mobile_feed()
