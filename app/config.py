from pathlib import Path


PROJECT_ROOT = Path(__file__).resolve().parent.parent

# Model paths
MODEL_PATH = PROJECT_ROOT / "models" / "best_parking.pt"

LICENSE_PLATE_MODEL_PATH = (
    PROJECT_ROOT / "models" / "best_license_plate.pt"
)

# Database path
DATABASE_PATH = (
    PROJECT_ROOT / "database" / "parking.db"
)

# Camera settings
CAMERA_INDEX = 1

# Detection settings
CONFIDENCE_THRESHOLD = 0.5
PLATE_CONFIDENCE_THRESHOLD = 0.8
IMAGE_SIZE = 640
DETECTION_INTERVAL = 0.1

# Database update interval
DATABASE_UPDATE_INTERVAL = 10

# Window
WINDOW_NAME = "SpartanSpot Parking Detection"

# OpenCV uses BGR colors
AVAILABLE_COLOR = (0, 255, 0)
OCCUPIED_COLOR = (0, 0, 255)
UNKNOWN_COLOR = (255, 255, 0)
PLATE_COLOR = (255, 0, 0)

TARGET_WIDTH = 1920
TARGET_HEIGHT = 1080