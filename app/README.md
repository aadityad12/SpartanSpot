# SpartanSpot

SpartanSpot is a Python parking-monitoring prototype. A webcam and a trained
YOLO model monitor four spaces: A1, A2, A3, and A4. Plate Recognizer reads
license plates, and SQLite stores accounts, permits, reservations, parking
events, and occupancy summaries.

This README describes the modular project layout developed in our current
refactor. Older copies with files directly under `app/` need their imports
and test commands adjusted to match.

## Camera workflow

1. Observe the lot for at least five seconds to learn four space locations.
2. Assign fixed IDs from left to right. Keep the camera stationary afterward.
3. Confirm available/occupied status changes over one second.
4. Mark a space `DISCONNECTED` after five seconds without a matching detection.
5. After ten seconds of confirmed continuous occupancy, attempt plate reading.
6. Send the detected plate crop to Plate Recognizer and save the full space
   image locally. No plate box means no API request for that attempt.
7. Allow three attempts, with three seconds between attempts. After the last
   failure, save the space image under `UNREADABLE` for manual review.
8. Save aggregate occupancy statistics every 60 seconds while calibrated.

An empty reserved space displays `RESERVED`. A readable plate needs an active
paid permit; if the space has a reservation, the plate must also match its
assigned vehicle. Readable results are classified as `VALID` or `INVALID`.

## Project layout

| Location | Purpose |
| --- | --- |
| `app/main.py` | Coordinate the camera application |
| `app/config.py` | Paths, timing settings, camera settings, and colors |
| `app/parking/` | Camera, detector, tracker, display, and parking services |
| `app/plates/` | Plate API client and image storage |
| `app/accounts/` | Registration, authentication, and verification email |
| `app/database/database.py` | SQLite schema and database operations |
| `tests/` | Practice scripts using temporary databases |
| `models/` | Trained YOLO weights |
| `parking_lot/` | Generated parking-space images |

Include an `__init__.py` file inside `app/` and each Python package folder.
The database file location is controlled by `DATABASE_PATH` in `app/config.py`.

## Installation on Windows

Use Python 3.11 for the project environment. Run these commands from the
project root: the folder containing `app/` and `requirements.txt`.

```powershell
py -3.11 -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install --upgrade pip
python -m pip install -r requirements.txt
```

If PowerShell blocks activation, use the environment's Python directly:

```powershell
.\.venv\Scripts\python.exe -m pip install -r requirements.txt
```

Place the combined model at `models/best_combined.pt`, or update `MODEL_PATH`.
Expected class labels are `available`, `occupied`, and `plate`.
The detector also accepts `license_plate`.

## Start the camera application

Set your Plate Recognizer token locally in the same PowerShell window:

```powershell
$env:PLATE_API_TOKEN="YOUR_ACTUAL_TOKEN"
python -m app.main
```

Press Q while the camera window is focused to close the application.
These environment settings last for the current PowerShell session.

In `app/config.py`, adjust `CAMERA_INDEX`, `FRAME_WIDTH`, `FRAME_HEIGHT`,
`SPACE_IDS`, and `EXPECTED_SPACE_COUNT` as needed. The requested resolution
is 1920 x 1080; the webcam must support it.

Plate reading uploads the plate crop to an external service. API access
requires a Plate Recognizer account and available request allowance.
Tesseract is not required by this version.

## Saved images and database

Example image paths:

```text
parking_lot/camera_1/A1/VALID/5CMP686/5CMP686.jpg
parking_lot/camera_1/A1/INVALID/7ABC123/7ABC123.jpg
parking_lot/camera_1/A1/UNREADABLE/A1_20261104_120000.jpg
```

The files contain the full parking-space crop. The recognized plate is used
in the folder/file name. With the current storage function, another saved
image for the same plate, spot, and category replaces the earlier image.

SQLite tables are created automatically. A newly created database has no
customer, vehicle, permit, or reservation records. The camera application
does not create paid permits; those must be added separately.

## Accounts and verification email

Account modules support email login, password hashing, verification tokens,
and user/admin roles. A customer can register multiple vehicles. The default
reservation allowance is eight per calendar month; cancellation before the
start time releases that reservation's allowance.

To configure the existing STARTTLS email sender, set the following before
starting a program that sends email:

```powershell
$env:SPARTAN_SMTP_HOST="YOUR_SMTP_HOST"
$env:SPARTAN_SMTP_PORT="587"
$env:SPARTAN_SMTP_USERNAME="YOUR_SMTP_USERNAME"
$env:SPARTAN_SMTP_PASSWORD="YOUR_SMTP_PASSWORD"
$env:SPARTAN_EMAIL_FROM="YOUR_SENDER_EMAIL"
$env:SPARTAN_EMAIL_VERIFICATION_URL="http://127.0.0.1:8000/api/auth/verify"
```

The verification URL needs a running web route that calls `verify_account()`.
The current camera application does not provide that route or a login UI.
An `.env` file is not loaded automatically by the current configuration.

## Practice tests

After moving the practice scripts into `tests/`, run:

```powershell
python -m tests.test_auth
python -m tests.test_vehicles
python -m tests.test_reservations
python -m tests.test_reservation_validation
```

If your scripts remain directly under `app/`, replace `tests.` with `app.`.
The authentication test uses a fake email sender. Practice records are stored
in temporary databases and disappear afterward.

Check syntax with `python -m compileall -q app tests`. This checks syntax,
not successful imports or application behavior.

## Current limitations

- Calibration learns locations from detections and assumes one row of four
  spaces. Incorrect calibration requires restarting with a clear view.
- API requests run in the camera loop and can pause the display.
- The camera cannot identify a vehicle swap while its view is disconnected.
- Database reservation creation still needs a live availability check from
  the application. The monthly count currently uses UTC calendar boundaries.
- Reservation timing, account permissions, and concurrent requests need
  further review before public deployment.
- A second camera, web UI, and password recovery are future work.

## Dependencies and credentials

`requirements.txt` lists direct external packages. Python already includes
SQLite, SMTP, password-hashing utilities, and the practice-test utilities.
Package versions are currently unpinned. Once the full application works in
a clean environment, record that environment with:

```powershell
python -m pip freeze > requirements-lock.txt
```

Keep API tokens, SMTP credentials, databases, and captured images out of
public Git commits.
