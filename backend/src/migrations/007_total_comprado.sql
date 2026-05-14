-- Migração 007: Campo Total Comprado em boosters_config

ALTER TABLE boosters_config
  ADD COLUMN IF NOT EXISTS total_comprado NUMERIC;
