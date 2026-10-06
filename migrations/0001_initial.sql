PRAGMA foreign_keys = ON;

CREATE TABLE equipment (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  location TEXT NOT NULL
) STRICT;

CREATE TABLE bookings (
  id TEXT PRIMARY KEY,
  equipment_id TEXT NOT NULL REFERENCES equipment(id) ON DELETE RESTRICT,
  borrower_name TEXT NOT NULL,
  start_at TEXT NOT NULL,
  end_at TEXT NOT NULL,
  purpose TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  CHECK (start_at < end_at)
) STRICT;

CREATE INDEX idx_bookings_equipment_time ON bookings(equipment_id, start_at, end_at);

INSERT INTO equipment (id, name, location) VALUES
  ('eq-1', 'Projector A', 'Building 1'),
  ('eq-2', 'Camera Kit A', 'Media Lab');
