import { Hono } from 'hono'
import { BookingRepository } from './repository.js'
import { validateBooking } from './validation.js'

type Bindings = { DB: D1Database }
const app = new Hono<{ Bindings: Bindings }>().basePath('/api')

app.get('/equipment', async (c) => c.json(await new BookingRepository(c.env.DB).listEquipment()))
app.get('/bookings', async (c) => c.json(await new BookingRepository(c.env.DB).list()))

app.get('/bookings/:id', async (c) => {
  const booking = await new BookingRepository(c.env.DB).find(c.req.param('id'))
  return booking ? c.json(booking) : c.json({ error: 'Booking not found' }, 404)
})

app.post('/bookings', async (c) => {
  let body: unknown
  try { body = await c.req.json() } catch { return c.json({ error: 'Request body must contain valid JSON' }, 400) }
  const parsed = validateBooking(body)
  if (!parsed.ok) return c.json({ error: parsed.error }, 400)
  const repository = new BookingRepository(c.env.DB)
  if (!await repository.equipmentExists(parsed.value.equipmentId)) return c.json({ error: 'Equipment not found' }, 404)
  const booking = await repository.createIfAvailable(crypto.randomUUID(), parsed.value, new Date().toISOString())
  return booking ? c.json(booking, 201) : c.json({ error: 'Booking conflicts with an existing booking' }, 409)
})

app.patch('/bookings/:id', async (c) => {
  const id = c.req.param('id')
  const repository = new BookingRepository(c.env.DB)
  const current = await repository.find(id)
  if (!current) return c.json({ error: 'Booking not found' }, 404)
  let body: unknown
  try { body = await c.req.json() } catch { return c.json({ error: 'Request body must contain valid JSON' }, 400) }
  const parsed = validateBooking(body, current)
  if (!parsed.ok) return c.json({ error: parsed.error }, 400)
  if (!await repository.equipmentExists(parsed.value.equipmentId)) return c.json({ error: 'Equipment not found' }, 404)
  const booking = await repository.updateIfAvailable(id, parsed.value, new Date().toISOString())
  return booking ? c.json(booking) : c.json({ error: 'Booking conflicts with an existing booking' }, 409)
})

app.delete('/bookings/:id', async (c) => await new BookingRepository(c.env.DB).delete(c.req.param('id')) ? c.body(null, 204) : c.json({ error: 'Booking not found' }, 404))
app.notFound((c) => c.json({ error: 'Route not found' }, 404))
app.onError((error, c) => { console.error(error); return c.json({ error: 'Internal server error' }, 500) })

export default app
