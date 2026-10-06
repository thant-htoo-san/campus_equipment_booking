# AI Use Log

This file records the significant AI assistance used for the Campus Equipment Booking API and separates AI-executed checks from verification that the student must perform personally.

## Important prompts and assistance used

### 1. Initial system design

**Prompt:** “You are a senior backend engineer. Design the system according to `exam_brief_en.md`; there is a scenario, task, and tech stack.”

**AI output used:**

- Designed the API contract, equipment-to-bookings relationship, schema, and project structure.
- Implemented the first TypeScript/Hono API version with booking CRUD, validation, JSON errors, and parameter-bound SQL.
- Documented half-open booking intervals and the overlap rule.
- Created the initial README, API contract, schema/ERD, test evidence template, and Quality Gate review template.

### 2. Requirement review and explanation

**Prompts:** Asked how many of the eight requirements were complete and requested an explanation of each implementation.

**AI output used:**

- Compared the implementation with each task in the exam brief.
- Explained routes, validation, status codes, overlap detection, parameter binding, and the schema.
- Identified that actual command-line test evidence was still incomplete at that stage.

### 3. Cloudflare D1 migration

**Prompt:** “Let’s use Cloudflare D1.”

**AI output used:**

- Replaced the original Node local-SQLite adapter with the Cloudflare D1 `DB` binding.
- Added `wrangler.jsonc` and the versioned migration `migrations/0001_initial.sql`.
- Converted repository operations to asynchronous D1 prepared statements using `.prepare(...).bind(...)`.
- Reworked create and update so overlap detection and persistence occur in one conditional SQL statement.
- Added two seed records: `eq-1` and `eq-2`.
- Updated the README and supporting documentation for the D1 workflow.

### 4. Wrangler configuration and Quality Gate

**Prompts:** Asked how to answer Wrangler’s setup questions and later asked the AI to finish the project.

**AI output used:**

- Recommended local D1 for development and remote D1 for deployment.
- Found that Wrangler had added a second binding while the application expected `DB`.
- Consolidated the configuration to one `DB` binding using the created D1 database ID.
- Applied the initial migration to both local and remote D1.
- Reviewed the project against `quality_gate.md` and recorded findings, actions, and evidence in `QUALITY_GATE_REVIEW.md`.

### 5. API tests and Postman collection

**Prompts:** Requested completion of the test evidence and an importable Postman collection.

**AI output used:**

- Executed the nine requests from `curl_test_guide.md` against the local Wrangler/D1 environment.
- Recorded successful and error results in `TEST_EVIDENCE.md`.
- Created `test/Campus_Equipment_Booking_API.postman_collection.json` with ten ordered requests, assertions, automatic booking-ID storage, and cleanup.
- Updated `README.md` with cURL, Postman, D1, endpoint, and project-structure instructions.

## Important technical decisions accepted

- Booking intervals are treated as half-open ranges: `[startAt, endAt)`. Adjacent bookings are allowed.
- Two ranges conflict when `existing.startAt < requested.endAt` and `existing.endAt > requested.startAt`.
- An update excludes its own booking ID when checking other bookings.
- `400` represents invalid request data, `404` represents a missing booking or equipment record, and `409` represents a valid request that conflicts with an existing booking.
- All external SQL values use D1 parameter binding; request data is never concatenated into SQL text.
- Database constraints provide additional protection for foreign keys and `start_at < end_at`.

## Checks executed with AI assistance

On 2026-10-06, the AI-assisted session performed these checks:

- `npm install` completed with no reported vulnerabilities.
- `npm run typecheck` passed.
- The local D1 migration completed successfully.
- The remote D1 migration completed successfully.
- All nine cURL guide cases returned their expected statuses: `200`, `200`, `201`, `200`, `200`, `400`, `409`, `404`, and `204`.
- The Postman collection was parsed as valid JSON and contains ten requests.

## Student verification and ownership

Before submission, the student should personally confirm and be able to explain:

- How to install dependencies, apply the local migration, and start the API.
- How each route in `src/app.ts` maps to the API contract.
- How validation in `src/validation.ts` rejects missing data, invalid timestamps, and incorrect date order.
- How the parameter-bound queries in `src/repository.ts` work.
- Why the overlap predicate detects containment and partial overlap while allowing adjacent bookings.
- Why create and update combine the overlap check and write into one D1 statement.
- How to run the cURL guide and Postman collection and interpret the results.
- What was changed after the Quality Gate review and why.

The student should add a short confirmation below only after personally repeating the checks:

> **Student confirmation:** [Write what you personally ran, checked, and can explain before submission.]
