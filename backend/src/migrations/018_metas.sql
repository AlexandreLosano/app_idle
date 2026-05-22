CREATE TABLE IF NOT EXISTS metas (
  continent_id INTEGER PRIMARY KEY REFERENCES continents(id) ON DELETE CASCADE,
  valor        NUMERIC,
  letra        VARCHAR(5),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);
