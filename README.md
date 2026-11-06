# SpartanSpot

SpartanSpot is a smart-parking project for SJSU CMPE 131. It helps students
view parking availability, register vehicles, make reservations, and verify
that a detected license plate has an active paid permit. Parking Services can
monitor camera status and review parking activity.

The repository contains two connected parts:

- `mobile/`: an Expo / React Native concept application for iOS, Android, and
  web. Most screens currently use sample data while the backend integration is
  being completed.
- `app/`: the Python camera, computer-vision, database, authentication, and
  API code.

## System overview

```text
Camera
  -> YOLO detector
  -> fixed parking-space tracker
  -> plate crop and Plate Recognizer
  -> SQLite database and live status file
  -> backend API
  -> mobile app
```

The current camera configuration supports four fixed spaces: A1, A2, A3, and
A4. A future version can add additional cameras.

## Current camera behavior

1. The camera observes the lot during a five-second calibration period.
2. The tracker assigns permanent space IDs from left to right.
3. Space status must remain stable for one second before changing.
4. A space missing from detection for five seconds becomes `DISCONNECTED`.
5. After ten seconds of continuous occupancy, plate processing begins.
6. The small plate crop is sent to Plate Recognizer.
7. The full parking-space crop is saved locally.
8. The system makes up to three plate-reading attempts.
9. After three failed attempts, the full space image is saved under
   `UNREADABLE` for manual review.
10. Occupancy summaries are saved periodically for busy-time analysis.

An empty reserved space displays `RESERVED`. A readable plate is `VALID` only
when it has an active paid permit and matches the vehicle assigned to a
reservation when the space is reserved. Otherwise it is `INVALID`.

## Project layout

| Location | Purpose |
| --- | --- |
| `mobile/` | Expo / React Native concept application |
| `app/main.py` | Main camera application |
| `app/config.py` | Paths, timing, camera, model, and color settings |
| `app/parking/camera.py` | Open, read, and release the webcam |
| `app/parking/detector.py` | Run YOLO and separate detections |
| `app/parking/tracker.py` | Remember fixed spaces and schedule scans |
| `app/parking/parking_service.py` | Process status changes and plate scans |
| `app/parking/occupancy_service.py` | Save occupancy summaries |
| `app/parking/visualization.py` | Draw status and detection boxes |
| `app/plates/plate_api.py` | Communicate with Plate Recognizer |
| `app/plates/plate_storage.py` | Crop and save full space images |
| `app/accounts/auth_service.py` | Register and authenticate customers |
| `app/accounts/email_service.py` | Send verification emails |
| `app/database/database.py` | SQLite schema and operations |
| `app/api/` | FastAPI backend endpoints |
| `app/mobile_api.py` | Teammate's mobile parking-feed server |
| `tests/` | Authentication, vehicle, and reservation tests |
| `models/` | Trained YOLO model weights |
| `parking_lot/` | Generated parking-space images |
| `database/` | SQLite database files |

Each Python package directory should contain an empty `__init__.py` file.

## Python setup

Use Python 3.11 on Windows. Run these commands from the project root, which
contains `app/`, `mobile/`, `models/`, and `requirements.txt`.

```powershell
py -3.11 -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install --upgrade pip
python -m pip install -r requirements.txt
```

The direct Python dependencies are:

```text
opencv-python
ultralytics
requests
fastapi
uvicorn
email-validator
```

## Model setup

Place the trained model at:

```text
models/best_combined.pt
```

The expected classes are:

```text
available
occupied
plate
```

The detector also accepts `license_plate` as the plate class name.

Check the model path before starting the camera:

```powershell
Test-Path .\models\best_combined.pt
```

Load the model and print its classes:

```powershell
python -c "from ultralytics import YOLO; from app.config import MODEL_PATH; model=YOLO(str(MODEL_PATH)); print(model.names)"
```

## Run the camera application

Set the Plate Recognizer token in the same PowerShell window:

```powershell
$env:PLATE_API_TOKEN="YOUR_ACTUAL_TOKEN"
python -m app.main
```

Press `Q` while the camera window is focused to exit.

The requested camera resolution is 1920 x 1080. The actual resolution depends
on the webcam. Change `CAMERA_INDEX`, `FRAME_WIDTH`, `FRAME_HEIGHT`,
`EXPECTED_SPACE_COUNT`, and `SPACE_IDS` in `app/config.py` when needed.

## Saved parking images

The small plate crop is sent to Plate Recognizer. The full parking-space crop
is saved locally in a structure such as:

```text
parking_lot/
└── camera_1/
    └── A1/
        ├── VALID/
        │   └── 5CMP686/
        │       └── 5CMP686.jpg
        ├── INVALID/
        │   └── 7ABC123/
        │       └── 7ABC123.jpg
        └── UNREADABLE/
            └── A1_20261105_120000.jpg
```

## Accounts and email verification

Users register with their first name, last name, email, and password. Email is
the login identity. Passwords are stored as salted hashes, never as plain
text. Users must verify their email before logging in.

One customer can register multiple vehicles. A customer has a default limit of
eight reservations per calendar month. A reservation cancelled before its
start time does not count toward that limit.

The email sender uses Brevo SMTP. Configure it in the same PowerShell window
used to start the backend:

```powershell
$env:SPARTAN_SMTP_HOST="smtp-relay.brevo.com"
$env:SPARTAN_SMTP_PORT="587"
$env:SPARTAN_SMTP_USERNAME="YOUR_BREVO_SMTP_LOGIN"
$env:SPARTAN_SMTP_PASSWORD="YOUR_BREVO_SMTP_KEY"
$env:SPARTAN_EMAIL_FROM="SpartanSpot <your-verified-sender@example.com>"
```

Use a Brevo SMTP key, not a Gmail password or ordinary Brevo account
password. Keep all credentials out of Git commits.

## Backend API

Start the FastAPI backend from the project root:

```powershell
python -m uvicorn app.api.main:app --host 0.0.0.0 --port 8000 --reload
```

Open the interactive API page at:

```text
http://127.0.0.1:8000/docs
```

Current account endpoints include:

```text
POST /api/auth/signup
GET  /api/auth/verify?token=...
POST /api/auth/login
```

The parking-status endpoint is:

```text
GET /api/spaces
```

The camera publishes current statuses to `data/live_status.json`. If the
status becomes older than the configured timeout, the API reports the camera
as offline and spaces as disconnected.

Do not run two servers on port 8000 at the same time. The legacy
`app/mobile_api.py` entry point exposes the same `/api/spaces` contract (and
the backwards-compatible `/api/lots` alias) and also reads the live-status
file.

## Mobile concept app

Run the concept app:

```powershell
cd mobile
npm ci
npm run web
```

To run on a phone:

```powershell
npm start
```

Scan the QR code with Expo Go. The project uses Expo SDK 58. Use a compatible
Expo Go version or build a development client if Expo reports an SDK mismatch.

The concept app currently contains sample screens and sample data for:

- Student parking search
- Availability counts and garage maps
- Reservation flow
- Vehicles and permits
- Parking Services dashboard
- Plate lookup
- Camera monitoring
- Occupancy reports
- Insights and campus events

The mobile app starts in sample-data mode. Its in-memory demo state resets when
the page reloads. Backend login, reservations, and live parking data are being
connected incrementally.

## Mobile API connection

For a physical phone, `localhost` refers to the phone itself. Run the API on a
computer reachable from the phone and enter the computer's local network URL,
for example:

```text
http://192.168.1.10:8000
```

The phone and computer must use the same network. The Android emulator usually
reaches the host computer through:

```text
http://10.0.2.2:8000
```

The API currently provides parking availability. Authentication and reservation
requests will be connected to the mobile screens after the session-token work
is complete.

## Test the backend modules

Run these from the project root after placing the tests in `tests/`:

```powershell
python -m tests.test_auth
python -m tests.test_vehicles
python -m tests.test_reservations
python -m tests.test_reservation_validation
```

If the practice files are still inside `app/`, use `app` instead of `tests`.
The practice tests use temporary databases, so their records are removed after
the test finishes.

Check syntax and imports:

```powershell
python -m compileall -q app
python -c "from app.main import main; from app.mobile_api import parking_feed; from app.api.main import app; print('All application imports work')"
```

## Concept-app validation

Run these commands from `mobile/` when the corresponding scripts exist:

```powershell
npm run typecheck
npm run lint
npm run test:map
npm run export:web
```

The app's screen documentation is in `docs/screens.md`. Map sources and
accuracy limits are described in `docs/map-sources.md`.

## Limitations and future work

- The current camera setup assumes one stationary camera and four spaces.
- Calibration assumes the four spaces are arranged in one row.
- API requests run in the camera loop and can pause the display.
- A vehicle swap cannot be identified while a space is disconnected.
- The mobile app still uses sample data on many screens.
- Login currently verifies credentials; session-token support is still needed
  for protected mobile requests.
- The legacy mobile API now reads the same live-status file as FastAPI.
- Payment processing, password recovery, push notifications, and a second
  camera are future work.
- Add HTTPS, authentication, and a production gateway before public deployment.

## Git and secrets

Do not commit any of the following:

```text
.venv/
database/*.db
parking_lot/
data/live_status.json
API tokens
SMTP keys
```

Keep the trained model in Git only if the repository and file size policy allow
it. Otherwise store it separately and document its expected path.
