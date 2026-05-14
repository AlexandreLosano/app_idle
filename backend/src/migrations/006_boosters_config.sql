-- Migração 006: Config de boosters (Buster Anuncio)

CREATE TABLE IF NOT EXISTS boosters_config (
  id             SERIAL PRIMARY KEY,
  buster_anuncio NUMERIC,
  updated_at     TIMESTAMP DEFAULT NOW()
);

INSERT INTO boosters_config DEFAULT VALUES ON CONFLICT DO NOTHING;
