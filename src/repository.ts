import type { Booking, BookingInput, Equipment } from './types.js'

type BookingRow = { id: string; equipment_id: string; borrower_name: string; start_at: string; end_at: string; purpose: string; created_at: string; updated_at: string }

function mapBooking(row: BookingRow): Booking {
  return { id: row.id, equipmentId: row.equipment_id, borrowerName: row.borrower_name, startAt: row.start_at, endAt: row.end_at, purpose: row.purpose, createdAt: row.created_at, updatedAt: row.updated_at }
}

const columns = 'id, equipment_id, borrower_name, start_at, end_at, purpose, created_at, updated_at'

export class BookingRepository {
  constructor(private readonly db: D1Database) {}

  async listEquipment(): Promise<Equipment[]> {
    return (await this.db.prepare('SELECT id, name, location FROM equipment ORDER BY id').all<Equipment>()).results
  }

  async equipmentExists(id: string): Promise<boolean> {
    return Boolean(await this.db.prepare('SELECT 1 FROM equipment WHERE id = ?').bind(id).first())
  }

  async list(): Promise<Booking[]> {
    const rows = (await this.db.prepare(`SELECT ${columns} FROM bookings ORDER BY start_at, id`).all<BookingRow>()).results
    return rows.map(mapBooking)
  }

  async find(id: string): Promise<Booking | null> {
    const row = await this.db.prepare(`SELECT ${columns} FROM bookings WHERE id = ?`).bind(id).first<BookingRow>()
    return row ? mapBooking(row) : null
  }

  async createIfAvailable(id: string, input: BookingInput, now: string): Promise<Booking | null> {
    // Atomic conflict-check + insert. Half-open ranges allow adjacent bookings.
    const result = await this.db.prepare(`
      INSERT INTO bookings (id, equipment_id, borrower_name, start_at, end_at, purpose, created_at, updated_at)
      SELECT ?, ?, ?, ?, ?, ?, ?, ?
      WHERE NOT EXISTS (
        SELECT 1 FROM bookings WHERE equipment_id = ? AND start_at < ? AND end_at > ?
      )
    `).bind(id, input.equipmentId, input.borrowerName, input.startAt, input.endAt, input.purpose, now, now, input.equipmentId, input.endAt, input.startAt).run()
    return result.meta.changes === 1 ? this.find(id) : null
  }

  async updateIfAvailable(id: string, input: BookingInput, now: string): Promise<Booking | null> {
    const result = await this.db.prepare(`
      UPDATE bookings
      SET equipment_id = ?, borrower_name = ?, start_at = ?, end_at = ?, purpose = ?, updated_at = ?
      WHERE id = ? AND NOT EXISTS (
        SELECT 1 FROM bookings AS other
        WHERE other.equipment_id = ? AND other.id <> ? AND other.start_at < ? AND other.end_at > ?
      )
    `).bind(input.equipmentId, input.borrowerName, input.startAt, input.endAt, input.purpose, now, id, input.equipmentId, id, input.endAt, input.startAt).run()
    return result.meta.changes === 1 ? this.find(id) : null
  }

  async delete(id: string): Promise<boolean> {
    return (await this.db.prepare('DELETE FROM bookings WHERE id = ?').bind(id).run()).meta.changes === 1
  }
}
