import type { BookingInput } from './types.js'

const fields = ['equipmentId', 'borrowerName', 'startAt', 'endAt', 'purpose'] as const
type Field = (typeof fields)[number]

export type ValidationResult =
  | { ok: true; value: BookingInput }
  | { ok: false; error: string }

function isIsoDate(value: string): boolean {
  const timestamp = Date.parse(value)
  return Number.isFinite(timestamp) && new Date(timestamp).toISOString() === value
}

export function validateBooking(body: unknown, current?: BookingInput): ValidationResult {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return { ok: false, error: 'Request body must be a JSON object' }
  }

  const record = body as Record<string, unknown>
  const unknown = Object.keys(record).find((key) => !fields.includes(key as Field))
  if (unknown) return { ok: false, error: `Unknown field: ${unknown}` }

  const value = { ...current, ...record } as Partial<BookingInput>
  for (const field of fields) {
    if (typeof value[field] !== 'string' || value[field]!.trim() === '') {
      return { ok: false, error: `${field} is required and must be a non-empty string` }
    }
  }

  if (!isIsoDate(value.startAt!)) {
    return { ok: false, error: 'startAt must be a valid UTC ISO-8601 timestamp' }
  }
  if (!isIsoDate(value.endAt!)) {
    return { ok: false, error: 'endAt must be a valid UTC ISO-8601 timestamp' }
  }
  if (value.startAt! >= value.endAt!) {
    return { ok: false, error: 'startAt must be before endAt' }
  }

  return {
    ok: true,
    value: {
      equipmentId: value.equipmentId!.trim(),
      borrowerName: value.borrowerName!.trim(),
      startAt: value.startAt!,
      endAt: value.endAt!,
      purpose: value.purpose!.trim(),
    },
  }
}
