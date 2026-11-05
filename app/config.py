from pathlib import Path
import os

# __file__ means the location of this config.py file
# parent is the app folder
# parent.parent is the main project folder

PROJECT_ROOT = Path(__file__).resolve().parent.parent

# location of the trained YOLO model
MODEL_PATH = (
    PROJECT_ROOT
    / "models" 
    / "best_combined.pt"
)

# Location of the SQLite database
DATABASE_PATH = (
    PROJECT_ROOT
    / "database"
    / "spartan_spot.db"
)

# Folder for saved parking-space and plate images
PARKING_LOT_DIR = (
    PROJECT_ROOT
    / "parking_lot"
)

# Camera settings
CAMERA_INDEX = 0
CAMERA_ID = "camera_1"

FRAME_WIDTH = 1920
FRAME_HEIGHT = 1080

# Paking-space settings
EXPECTED_SPACE_COUNT = 4

SPACE_IDS = [
    "A1",
    "A2",
    "A3",
    "A4"
]

# Timing settings
DETECTION_INTERVAL_SECONDS = 0.5
CALIBRATION_SECONDS = 5.0
STATUS_CONFIRMATION_SECONDS = 1.0
SLOT_DISCONNECTED_SECONDS = 5.0
OCCUPANCY_DELAY_SECONDS = 10.0

# The API will be called at most three times
MAX_PLATE_ATTEMPTS = 3

# Wait three seconds between failed attempts
PLATE_RETRY_SECONDS = 3.0

# Save one general occupancy summary per minutes
SNAPSHOT_INTERVAL_SECONDS = 60.0

# YOLO settings
YOLO_CONFIDENCE = 0.8
YOLO_IMAGE_SIZE = 640

# Distance used when matching a detection
# to remembered parking space
CALIBRATION_MATCH_DISTANCE = 120.0

# Plate Regconizer settings
PLATE_API_TOKEN_ENV = "PLATE_API_TOKEN"
PLATE_REGION = "us-ca"

# Email verification settings.
# Keep SMTP credentials in environment variables, never in this file
SMTP_HOST = os.getenv("SPARTAN_SMTP_HOST", "")
SMTP_PORT = int(os.getenv("SPARTAN_SMTP_PORT", "587"))
SMTP_USERNAME = os.getenv("SPARTAN_SMTP_USERNAME", "")
SMTP_PASSWORD = os.getenv("SPARTAN_SMTP_PASSWORD", "")
EMAIL_FROM = os.getenv("SPARTAN_EMAIL_FROM", SMTP_USERNAME)

# This is the address where the web UI will later expose verification.
# Example: http://127.0.0.1:5000/verify-email
EMAIL_VERIFICATION_URL = os.getenv(
    "SPARTAN_EMAIL_VERIFICATION_URL",
    "http://127.0.0.1:5000/verify-email"
)


# Display window
WINDOW_NAME = "SpartanSpot"

# OpenCV colors use BGR format
AVAILABLE_COLOR = (0, 255, 0)        # Green
OCCUPIED_COLOR = (0, 0, 255)         # Red
DISCONNECTED_COLOR = (0, 165, 255)   # Orange
RESERVED_COLOR = (255, 0, 255)        # Magenta
PLATE_COLOR = (255, 0, 0)            # Blue
UNKNOWN_COLOR = (0, 255, 255)        # Yellow

# Text colors for reservation validation
VALID_COLOR = (0, 255, 0)            # Green
INVALID_COLOR = (0, 0, 255)          # Red