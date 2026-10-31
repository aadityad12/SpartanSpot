# Screen inventory

Every route in the concept app, the role that uses it, and the requirement it demonstrates. All screens run on sample data (see the README).

Requirement codes come from the Sprint 01 plan: Student US01-US04, Admin US01-US03, System US01-US04.

To open any route directly, use a sign-in deep link, for example `/sign-in?as=student&next=/lot/south` or `/sign-in?as=admin&next=/admin/cameras`. Routes reload the app, which resets the in-memory demo state.

## Student

| Route | Screen | Requirement demonstrated |
| --- | --- | --- |
| `/sign-in` | Sign-in and role picker (Student or Parking Services). Also handles the `?as=&next=` demo links. | Demo entry point |
| `/` | Find parking: total open-spot count, campus map with a pin per garage, searchable and filterable garage list. | Student US01 (real-time available spaces), System US01 (totals) |
| `/lot/[id]` | Garage details with a live level map. Green is available, red is occupied, gold is reserved. Per-level counts, selected-spot details, and the reason an occupied spot cannot be reserved. IDs: `north`, `south`, `west`, `south-campus`. | Student US01, System US01, System US04 |
| `/reserve/[lotId]` | Four-step reservation flow (spot, time, payment and vehicle, review) with the daily and monthly limits and rejections for unavailable spots. | Student US04 (book, pay, reservation code), System US04 |
| `/reservation/[id]` | Reservation details: confirmation code, QR code, time remaining, cancel. | Student US04 (code and time tracking) |
| `/reservations` | My Reservations: active, upcoming, and past bookings, the limits card, and a New button. | Student US04 |
| `/insights` | Today vs. last week, best times for the student's class schedule, 7-day forecast, and campus events that may fill a garage. | Student US02, Student US03, System US02, System US03 |
| `/permits` | Current permit, parking plans, vehicles, and payment history. | Student US04 (easy payment), parking plans and permit status |
| `/checkout/[planId]` | Plan checkout: term, vehicles to cover, payment method, success state. IDs: `daily`, `monthly`, `semester`, `annual`. | Student US04, parking plans |
| `/account` | Profile, notification toggles, links to the screens below, and the switch to Parking Services. | Supports Student US04 (vehicles, payment) |
| `/saved` | Saved garages (reached from Account). | Supports Student US01 |
| `/activity` | "Where I parked" reminder (reached from Account). | Supports Student US01 |
| `/settings` | Server connection for the real detector API (reached from Account). | System US01 (live data path) |

## Parking Services (admin)

| Route | Screen | Requirement demonstrated |
| --- | --- | --- |
| `/admin` | Dashboard: campus totals, per-garage availability, alerts, and a recent activity feed that includes student reservations. | Admin overview, System US01 |
| `/admin/lookup` | Permit check: enter a license plate (try `8ABC123`, paid, or `7XYZ889`, unpaid) to see permit status, owner, vehicle, reservation, sightings, and violations, and issue a citation. | Admin US01 |
| `/admin/spots` | Spot map with Hold mode, the holds list (including pre-assigned spots), active and upcoming reservations, and the reservation rules that drive the student limits. | Admin US03, reservation rules |
| `/admin/cameras` | Camera list and health, a live view with green and red detection boxes, the detection log, and the camera, vision, database, app pipeline. | System US01 (camera and computer-vision layers) |
| `/admin/reports` | Daily report: totals, hourly chart, per-garage table, violations, and a demo PDF export. | Admin US02 |

## Other

| Route | Screen | Notes |
| --- | --- | --- |
| `+not-found` (any unknown path) | "Let's get you back on campus" with a way back home. | Fallback |
| `/` while signed out, or `/admin` as a student | Redirects to `/sign-in`. | Role guards |
