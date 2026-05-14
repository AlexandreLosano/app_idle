-- Migração 004: Valor do próximo prestígio por mina

ALTER TABLE mines
  ADD COLUMN IF NOT EXISTS proximo_prestigio_valor NUMERIC,
  ADD COLUMN IF NOT EXISTS proximo_prestigio_letra VARCHAR(5);
