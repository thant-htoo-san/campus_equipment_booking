# Test Evidence

**Date:** 2026-10-06  
**Base API URL:** `https://campus-equipment-booking-api.campus-event-manager.workers.dev/api`  
**Runtime:** Deployed Cloudflare Worker with remote D1

The commands from `curl_test_guide.md` were executed against the public Cloudflare deployment after applying `migrations/0001_initial.sql` to remote D1.

| # | Case | Expected | Actual | Result |
|---:|---|---:|---:|---|
| 1 | List equipment | 200 | 200 | PASS — `eq-1` and `eq-2` returned |
| 2 | List bookings | 200 | 200 | PASS — empty array returned initially |
| 3 | Create booking | 201 | 201 | PASS — booking ID created |
| 4 | Get created booking | 200 | 200 | PASS — stored fields returned correctly |
| 5 | Update booking | 200 | 200 | PASS — time and purpose changed |
| 6 | Invalid time range | 400 | 400 | PASS — JSON error returned |
| 7 | Overlapping booking | 409 | 409 | PASS — JSON conflict error returned |
| 8 | Missing booking | 404 | 404 | PASS — JSON not-found error returned |
| 9 | Delete booking | 204 | 204 | PASS — empty response body |

## Error-response evidence

```json
{ "error": "startAt must be before endAt" }
```

```json
{ "error": "Booking conflicts with an existing booking" }
```

```json
{ "error": "Booking not found" }
```

All nine requests returned the expected statuses from the public HTTPS endpoint. The created booking was deleted at the end, leaving the remote test database clean.
