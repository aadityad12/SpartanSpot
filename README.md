# SpartanSpot

SpartanSpot is a smart-parking project for SJSU CMPE 131. It tells students which parking spaces are open right now, lets them reserve one, and gives Parking Services a way to check permits and watch the system.

This repository holds two things:

- **The concept app** in `mobile/`: a clickable Expo / React Native app (iOS, Android, and web) that shows every screen a student and a Parking Services admin would use. All of it runs on built-in sample data, with no backend, camera, payment processor, or login.
- **The detector and API** in `app/`: the Python / OpenCV pipeline that finds spaces in camera frames and a small read-only API that serves counts to the app. See [Connect the real parking detector](#connect-the-real-parking-detector).

## How SpartanSpot works

The system has four layers:

1. **Camera**: a camera watches a garage level.
2. **Computer vision**: a YOLO model finds parking spaces and marks each one occupied (red box) or available (green box).
3. **Database**: detections are stored with timestamps in a SQLite database (`database/parking.db`).
4. **App**: students and Parking Services see the results as availability counts, level maps, reservations, and reports.

The concept app shows all four layers. Layers 1 to 3 are drawn with sample data (for example, the Cameras screen draws detection boxes in SVG). Only the detector and API in `app/` are real, and they feed the Find tab when you connect them.

## Run the concept app

```sh
cd mobile
npm ci
npm run web
```

This opens the app in a browser. To use a phone instead, run `npm start` and scan the QR code with Expo Go (the project uses Expo SDK 58; see [Run on a device](#run-on-a-device) if Expo Go reports a version mismatch). On the sign-in screen, pick **Student** or **Parking Services**.

Demo state lives in memory, so reloading the page returns to sign-in and resets reservations, holds, rules, and permits.

## Demo walkthrough

1. **Sign in as a student.** On the sign-in screen choose **Student**.
2. **See green and red spaces and the available count.** The Find tab shows the total open-spot count and the four garages (North, South, West, and South Campus Lot) on a map. Tap a pin or a garage card to open its details. Use the level chips to see that level's live map: green is available, red is occupied, gold is reserved.
3. **Reserve a spot.** In the garage details tap **Reserve a spot here**, or use **New** on the Reservations tab. Pick a green spot, choose a start time and length, then pick a vehicle and payment method and confirm. Tapping a red or gold spot shows why it cannot be reserved.
4. **See the code.** The confirmation shows a reservation code and QR code, and the reservation appears under the Reservations tab, and the garage's open-spot count on Find drops by one.
5. **Switch to Parking Services.** Open the Account tab and tap **Switch to Parking Services view**. (Use this instead of reloading, which would reset the demo.)
6. **See the reservation.** On **Spots**, open the garage and level you booked and find the gold spot. **Active and upcoming reservations** on the same screen lists your booking, and the Dashboard activity feed shows it too.
7. **Check plates.** On **Lookup**, enter `8ABC123` (permit paid) and then `7XYZ889` (permit unpaid, with an open violation). You can also tap the sample plates under the search box.
8. **Cameras.** On **Cameras**, pick a camera to see the live view with green "empty" and red "car" detection boxes, the detection log, and the camera, vision, database, app pipeline. One camera is shown offline and one degraded.
9. **Report.** On **Reports**, view the daily report (totals, hourly chart, per-garage table, violations) and try the PDF export, which completes with a demo confirmation.

The Student tabs not used above are worth a look too: **Insights** (today vs. last week, best times for your class schedule, campus events) and **Permits** (plans, vehicles, checkout, payment history).

### Demo deep links

Open any of these in the browser to sign in and land on a screen directly. They reload the app, so use them to start a section, not to move between steps of the walkthrough.

| Link | Lands on |
| --- | --- |
| `/sign-in?as=student&next=/` | Find parking |
| `/sign-in?as=student&next=/lot/south` | A garage's details and level map (`north`, `south`, `west`, `south-campus`) |
| `/sign-in?as=student&next=/reserve/south` | The reservation flow for a garage |
| `/sign-in?as=student&next=/insights` | Insights |
| `/sign-in?as=student&next=/permits` | Permits and vehicles |
| `/sign-in?as=admin&next=/admin` | Admin dashboard |
| `/sign-in?as=admin&next=/admin/lookup` | Plate lookup |
| `/sign-in?as=admin&next=/admin/spots` | Spots and reservation rules |
| `/sign-in?as=admin&next=/admin/cameras` | Camera detection |
| `/sign-in?as=admin&next=/admin/reports` | Daily report |

Every route is listed in [docs/screens.md](docs/screens.md), with the requirement it demonstrates.

## Sample data vs. real

**Sample data (the default, and everything outside the Find tab's optional live feed):**

- Garages, levels, spot status, occupancy, and walking times.
- Reservations, reservation codes, and fees. Payment is a UI step; no card is charged.
- Permits, plans, prices, vehicles, payment history, and plate records (the plates in the walkthrough are made up).
- Camera health, detection boxes and logs, daily reports, trends, forecasts, class schedule, and campus events.
- Citations, report exports, and other "(demo)" actions complete with a success message but send nothing anywhere.
- Shared state, such as reservations, admin holds, and rules, is kept in memory so a change made in one role shows up in the other. The Find tab counts update when you reserve a spot or an admin holds one.

**Real:**

- The Python detector (`app/main.py`) and the read-only API (`app/api.py`).
- If you connect the API under Account, Server connection, the Find tab shows its live counts instead of sample counts. The other screens still use sample data.
- Saved garages, the "where I parked" reminder, and the server address are stored on the device.

Reservations, payments, permits, authentication, and push notifications are UI concepts only. No payment, login, or vehicle-registration service is implemented.

## What else is in the app

- Campus-style parking diagram, map/list switch, search, amenity filters, and sorting on the Find tab.
- Garage details with capacity, permit guidance, and saved garages.
- On-device parking reminders with optional level/space notes and elapsed time.
- Persistent preferences and favorites, and a configurable server connection (Account, then Server connection).
- Camera API polling every 15 seconds when a server is connected, pull-to-refresh, connection errors, and stale-data handling.

The campus map is an illustrative diagram, not a geographic navigation map. Walking times and amenities are examples.

## Run on a device

```sh
cd mobile
npm ci
npm start
```

Use `npm run android` or `npm run ios` with a compatible simulator or development client, and `npm run web` for a browser.

This project uses Expo SDK 58. Install a matching Expo Go version if available for your device; during the SDK transition, the app-store Expo Go may support only SDK 57. If Expo Go reports an SDK mismatch, build a development client with `npx expo run:android` or `npx expo run:ios` rather than ignoring the mismatch. Local iOS builds require full Xcode (Command Line Tools alone are not enough); local Android builds require the Android SDK and a suitable JDK.

The app starts in sample-data mode without any Python, camera, account, or API key. Saved lots and parking reminders are stored unencrypted on the device, so do not put personal information in notes.

## Connect the real parking detector

The API only supplies parking counts to the Find tab. Reservations, payments, permits, and the admin screens stay on sample data either way.

Run the detector using its existing Python environment and model dependencies:

```sh
python -m app.main
```

In another terminal, from the repository root:

```sh
python3 -m app.api --host 0.0.0.0 --port 8000
```

The API itself uses only the Python standard library and does not load models or require OpenCV. Keep it on a trusted local network; it has no authentication and is not a public production server. Do not port-forward it onto the internet. Use HTTPS and an authenticated gateway before external deployment.

Open **Server connection** in the app (Account tab) and enter your computer’s LAN address, such as `http://192.168.1.10:8000`. The phone and computer must share a network. `localhost` on a physical phone refers to that phone, not the computer. The Android Emulator normally reaches its host at `http://10.0.2.2:8000`. HTTP access depends on the native client’s network policy; use an HTTPS endpoint for signed production builds. You can also set `EXPO_PUBLIC_API_URL` in `mobile/.env` before starting Metro. This value is public client configuration, never a place for secrets.

For the browser preview, allow its exact origin:

```sh
python3 -m app.api --cors-origin http://localhost:8081
```

Optional environment configuration:

```sh
export PARKING_LOT_NAME='Your monitored garage'
export PARKING_PERMIT_LABEL='Your actual permit requirements'
export PARKING_DESTINATION='Your actual garage address or latitude,longitude'
python3 -m app.api --host 0.0.0.0
```

### Data contract and limits

- `GET /api/health`: server liveness; does not assert that a camera is connected.
- `GET /api/lots`: mobile parking feed with one configured monitored location.
- Reads the existing `database/parking.db` in SQLite read-only mode, per request.
- Returns only aggregate parking information; no license plates, vehicle records, permits, or user records leave the API.
- A detection older than 60 seconds (or the stricter `--max-age`) is unknown, not available. Missing databases return an empty monitored lot; unreadable schemas return HTTP 503.
- `total` is the count of stored spot IDs, **not a surveyed garage capacity**. The detector’s current spot IDs are frame-derived, not a calibrated stable-space registry. Treat live counts as experimental until stable bay IDs, camera-to-lot assignment, and capacity calibration are implemented. Old IDs become unknown, not free spaces.
- Legacy database timestamps have no timezone. The API interprets them in the server’s local timezone; run the API and detector with the same timezone.

## Validate and build

```sh
cd mobile
npm run typecheck
npm run lint
npm run export:web
npm run smoke -- "/sign-in?as=student&next=/ => open spots" "/sign-in?as=admin&next=/admin/cameras => Camera detection"
```

`npm run smoke` loads each route in headless Chrome (set `CHROME_PATH` if Chrome is not in the default macOS location) and fails if the expected text does not render. Run `npm run export:web` first. `npx expo export --platform all` checks the native bundles too.

Build installable packages with your own Expo and platform signing accounts:

```sh
cd mobile
npx eas-cli@latest build:configure
npx eas-cli@latest build --platform android --profile preview
npx eas-cli@latest build --platform ios --profile preview
```

The Android preview profile produces an APK. iOS internal distribution requires Apple signing and registered devices. Production profiles build store packages; store listing, developer accounts, distribution certificates, privacy disclosures, and store submission are separate setup tasks. Replace `com.spartanspot.mobile` with your own identifiers before distribution. Custom store icons and splash branding remain release preparation work.

## Layout

- `mobile/src/app/`: Expo Router routes. `(tabs)` holds the student screens, `admin/` the Parking Services screens, and `lot/`, `reserve/`, `reservation/`, `checkout/` the detail flows.
- `mobile/src/components/`: shared UI (`ui.tsx`, `kit.tsx`) and per-area components.
- `mobile/src/mock/`: all sample data (garages, reservations, permits, plates, cameras, reports, trends, events).
- `mobile/src/demo.tsx`: in-memory demo state shared by both roles (role, reservations, rules, admin holds, permit, vehicles).
- `mobile/src/store.tsx` and `mobile/src/data.ts`: persisted preferences, the Find tab feed, and runtime API response validation.
- `docs/screens.md`: every route, its role, and the requirement it demonstrates.
- `app/api.py`: dependency-free aggregate parking API.
- `app/main.py`: camera detection entry point.

The existing `requirements.txt` is a UTF-16, platform-specific environment snapshot. Use a compatible Python/model environment for the detector; the mobile app and API do not require installing that snapshot. `notes.txt` contains what appears to be an existing API credential: rotate it if real, and do not include it in mobile configuration or builds.
