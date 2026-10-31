# Spartan Spot

A campus parking companion for **iOS and Android**, built with Expo and React Native. The existing Python/OpenCV detection pipeline remains intact; a new read-only API connects it to the phone app.

## What works

- Campus-style parking diagram, map/list switch, search, amenity filters, and sorting.
- Parking lot details, capacity, permit guidance, and saved lots.
- On-device parking reminders with optional level/space notes and elapsed time.
- Persistent preferences and favorites, demo mode, configurable server connection.
- Camera API polling every 15 seconds, pull-to-refresh, connection errors, and stale-data handling.
- External map directions when a real destination is configured on the server.

The default experience uses clearly labeled **sample lots and counts**. The map is an illustrative diagram, not a geographic navigation map. Walking times and amenities in demo mode are examples. No reservation, payment, authentication, push notification, or vehicle-registration service is claimed or implemented.

## Run the mobile app

```sh
cd mobile
npm ci
npm start
```

Use `npm run android` or `npm run ios` with a compatible simulator/development client. Use `npm run web` for a browser preview of the same React Native screens.

This project currently uses Expo SDK 58. Install a matching Expo Go version if available for your device; during the SDK transition, the app-store Expo Go may support only SDK 57. If Expo Go reports an SDK mismatch, build a development client with `npx expo run:android` or `npx expo run:ios`, rather than ignoring the mismatch. Local iOS builds require full Xcode (Command Line Tools alone are not enough); local Android builds require the Android SDK and a suitable JDK.

The app starts in demo mode without any Python, camera, account, or API key. Saved lots and parking reminders are stored unencrypted on the device, so do not put personal information in notes.

## Connect the real parking detector

Run the detector using its existing Python environment and model dependencies:

```sh
python -m app.main
```

In another terminal, from the repository root:

```sh
python3 -m app.api --host 0.0.0.0 --port 8000
```

The API itself uses only the Python standard library and does not load models or require OpenCV. Keep it on a trusted local network; it has no authentication and is not a public production server. Do not port-forward it onto the internet. Use HTTPS and an authenticated gateway before external deployment.

Open **Settings** in the app and enter your computer’s LAN address, such as `http://192.168.1.10:8000`. The phone and computer must share a network. `localhost` on a physical phone refers to that phone, not the computer. The Android Emulator normally reaches its host at `http://10.0.2.2:8000`. HTTP access depends on the native client’s network policy; use an HTTPS endpoint for signed production builds. You can also set `EXPO_PUBLIC_API_URL` in `mobile/.env` before starting Metro. This value is public client configuration, never a place for secrets.

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
npx expo export --platform all
```

Build installable packages with your own Expo and platform signing accounts:

```sh
cd mobile
npx eas-cli@latest build:configure
npx eas-cli@latest build --platform android --profile preview
npx eas-cli@latest build --platform ios --profile preview
```

The Android preview profile produces an APK. iOS internal distribution requires Apple signing and registered devices. Production profiles build store packages; store listing, developer accounts, distribution certificates, privacy disclosures, and store submission are separate setup tasks. Replace `com.spartanspot.mobile` with your own identifiers before distribution. Custom store icons and splash branding remain release preparation work.

## Layout

- `mobile/src/app/`: Expo Router screens and native tabs.
- `mobile/src/components/`: shared UI and campus diagram.
- `mobile/src/store.tsx`: persisted preferences and feed lifecycle.
- `mobile/src/data.ts`: sample data and runtime API response validation.
- `app/api.py`: dependency-free aggregate parking API.
- `app/main.py`: existing camera detection entry point.

The existing `requirements.txt` is a UTF-16, platform-specific environment snapshot. Use a compatible Python/model environment for the detector; the mobile app and API do not require installing that snapshot. `notes.txt` contains what appears to be an existing API credential: rotate it if real, and do not include it in mobile configuration or builds.
