-- Migração 005: Tabela de Artefatos/Boosters

CREATE TABLE IF NOT EXISTS artefatos (
  id         SERIAL PRIMARY KEY,
  quantidade INTEGER      NOT NULL UNIQUE,
  ativo      BOOLEAN      DEFAULT FALSE,
  tipo       VARCHAR(50)  DEFAULT 'Por tempo',
  updated_at TIMESTAMP    DEFAULT NOW()
);

INSERT INTO artefatos (quantidade) VALUES
  (2), (4), (5), (10), (20), (25), (50),
  (75), (100), (200), (500), (1000), (4000), (5000)
ON CONFLICT (quantidade) DO NOTHING;
