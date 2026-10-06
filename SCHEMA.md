# Data Model

```text
equipment                         bookings
-------------------------         --------------------------------
id TEXT PK              1 ─────<  equipment_id TEXT FK, NOT NULL
name TEXT NOT NULL                id TEXT PK
location TEXT NOT NULL            borrower_name TEXT NOT NULL
                                  start_at TEXT NOT NULL
                                  end_at TEXT NOT NULL
                                  purpose TEXT NOT NULL
                                  created_at TEXT NOT NULL
                                  updated_at TEXT NOT NULL
                                  CHECK (start_at < end_at)
```

One equipment item has zero or more bookings. UTC ISO timestamps sort lexicographically, enabling the indexed overlap query on `(equipment_id, start_at, end_at)`. The D1 migration enables foreign keys. Equipment deletion is restricted while bookings reference it.
