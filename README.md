# Campus Equipment Booking API

A TypeScript/Hono REST API for Cloudflare Workers backed by D1. It prevents overlapping reservations for the same equipment and implements the contract in `exam_brief_en.md`.

## About the project

This backend API helps a faculty manage reservations for shared campus equipment such as projectors, cameras, and meeting-room resources. Users can view available equipment and create, read, update, or delete bookings. The system validates booking details, confirms that the selected equipment exists, and prevents the same equipment from being reserved for overlapping time periods. It is built with TypeScript and Hono, runs as a Cloudflare Worker, and stores data in Cloudflare D1.

## Requirements and setup

- Node.js 20 or newer
- npm

```bash
npm install
npm run db:migrate:local
npm run typecheck
npm run dev
```

The Base API URL is `http://localhost:8787/api`. Wrangler runs the Worker with a local D1 database. The migration in `migrations/0001_initial.sql` creates the tables and seeds:

- `eq-1` — Projector A, Building 1
- `eq-2` — Camera Kit A, Media Lab

Run the local migration once before starting a fresh local environment. Re-running the command after it has been applied is safe because Wrangler tracks migration history.

## API endpoints

| Method | Path | Success | Purpose |
|---|---|---:|---|
| GET | `/api/equipment` | 200 | List equipment |
| GET | `/api/bookings` | 200 | List bookings |
| GET | `/api/bookings/:id` | 200 | Get one booking |
| POST | `/api/bookings` | 201 | Create a booking |
| PATCH | `/api/bookings/:id` | 200 | Partially update a booking |
| DELETE | `/api/bookings/:id` | 204 | Delete a booking |

Errors are JSON objects in the form `{ "error": "message" }`. The API uses `400` for invalid input, `404` for missing resources, and `409` for booking conflicts.

## Design

The HTTP layer handles parsing and status codes, validation owns input rules, the repository contains parameterized D1 SQL, and the schema enforces the foreign key and date-order invariant. Create and update perform conflict detection and persistence atomically in conditional SQL statements.

Bookings use half-open time ranges `[startAt, endAt)`. Therefore `09:00–10:00` and `10:00–11:00` are adjacent and valid. A conflict exists when an existing row satisfies `existing.startAt < requested.endAt AND existing.endAt > requested.startAt`.

See [API_CONTRACT.md](API_CONTRACT.md) for the full contract and [SCHEMA.md](SCHEMA.md) for the data model.

## Testing with cURL

```bash
curl -i http://localhost:8787/api/equipment

curl -i -X POST http://localhost:8787/api/bookings \
  -H 'Content-Type: application/json' \
  -d '{"equipmentId":"eq-1","borrowerName":"Somchai Jaidee","startAt":"2026-10-20T09:00:00.000Z","endAt":"2026-10-20T11:00:00.000Z","purpose":"Class presentation"}'
```

Use the returned booking `id` for GET, PATCH, and DELETE requests, then record the output in `TEST_EVIDENCE.md`.

The complete command sequence is in [curl_test_guide.md](curl_test_guide.md). Recorded results for nine successful and error cases are in [TEST_EVIDENCE.md](TEST_EVIDENCE.md).

## Testing with Postman

1. Start the local API with `npm run dev`.
2. Import [test/Campus_Equipment_Booking_API.postman_collection.json](test/Campus_Equipment_Booking_API.postman_collection.json) into Postman.
3. Run the collection in its existing order.

The collection uses `http://localhost:8787/api` by default. It creates a booking, stores its ID in the collection variable `bookingId`, exercises read/update/error cases, and deletes the booking at the end. It contains ten requests with automatic status-code and response assertions.

## Verification commands

```bash
npm run typecheck
npm test
```

At present, `npm test` runs the TypeScript check. Runtime API verification is supplied by the cURL evidence and Postman collection.

## Remote D1 deployment

The remote `campus-equipment-booking` D1 database is configured in `wrangler.jsonc`, and its initial migration has been applied. To deploy the Worker from an authenticated machine:

```bash
npx wrangler login
npm run db:migrate:remote
npm run deploy
```

The remote migration command is safe to repeat because Wrangler applies only pending migrations.

## Project structure

```text
src/app.ts             Hono routes and HTTP responses
src/repository.ts      Parameter-bound D1 queries
src/validation.ts      Booking request validation
src/types.ts           Domain types
migrations/            Versioned D1 schema and seed data
wrangler.jsonc         Worker and D1 binding configuration
API_CONTRACT.md        Detailed API contract
SCHEMA.md              Schema and ERD
TEST_EVIDENCE.md       Recorded cURL results
QUALITY_GATE_REVIEW.md Quality Gate findings, fixes, and evidence
AI_LOG.md              AI assistance and verification record
test/                  Postman collection
```
