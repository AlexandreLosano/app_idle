-- Migração 012: Tabela de continentes e FK em islands

CREATE TABLE IF NOT EXISTS continents (
  id         SERIAL PRIMARY KEY,
  nome       VARCHAR(50) NOT NULL UNIQUE,
  updated_at TIMESTAMP DEFAULT NOW()
);

INSERT INTO continents (nome) VALUES ('Normal') ON CONFLICT (nome) DO NOTHING;

ALTER TABLE islands ADD COLUMN IF NOT EXISTS continent_id INTEGER REFERENCES continents(id);

UPDATE islands
SET continent_id = (SELECT id FROM continents WHERE nome = 'Normal')
WHERE continent_id IS NULL;

ALTER TABLE islands ALTER COLUMN continent_id SET NOT NULL;
