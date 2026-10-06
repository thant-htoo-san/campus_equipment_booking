# API Contract

Base URL: `https://campus-equipment-booking-api.campus-event-manager.workers.dev/api`

All request and response bodies are JSON except a successful delete, which has no body. Every error has the form `{ "error": "message" }`.

| Method | Path | Success | Errors |
|---|---|---:|---|
| GET | `/equipment` | 200 equipment array | — |
| GET | `/bookings` | 200 booking array | — |
| GET | `/bookings/:id` | 200 booking | 404 |
| POST | `/bookings` | 201 booking | 400, 404, 409 |
| PATCH | `/bookings/:id` | 200 booking | 400, 404, 409 |
| DELETE | `/bookings/:id` | 204 empty | 404 |

## Booking input

POST requires every field. PATCH accepts one or more fields and merges them with the stored booking before validating the complete result.

```json
{
  "equipmentId": "eq-1",
  "borrowerName": "Somchai Jaidee",
  "startAt": "2026-10-20T09:00:00.000Z",
  "endAt": "2026-10-20T11:00:00.000Z",
  "purpose": "Class presentation"
}
```

Timestamps must be canonical UTC ISO-8601 strings such as `2026-10-20T09:00:00.000Z`. Strings must be non-empty, equipment must exist, start must precede end, and the interval must not overlap another booking for that equipment. Unknown properties are rejected to catch client mistakes.

## Status-code decisions

- `400 Bad Request`: malformed JSON, a missing/empty/unknown field, invalid timestamp, or invalid date order. The client can correct its request.
- `404 Not Found`: the requested booking or referenced equipment does not exist.
- `409 Conflict`: the request is valid by itself but conflicts with an existing booking's time range.
