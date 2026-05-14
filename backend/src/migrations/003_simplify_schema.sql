-- Migração 003: Simplificação do schema

-- Remove tabelas desnecessárias
DROP TABLE IF EXISTS game_state;
DROP TABLE IF EXISTS prestige;

-- mines: remove colunas desnecessárias, adiciona prestígio
ALTER TABLE mines
  DROP COLUMN IF EXISTS ordem,
  DROP COLUMN IF EXISTS verificacao,
  ADD COLUMN IF NOT EXISTS prestigio_atual  INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS prestigio_maximo INTEGER DEFAULT 0;

-- islands: simplifica para lookup (só id, nome, ordem)
ALTER TABLE islands
  DROP COLUMN IF EXISTS proximo_gem,
  DROP COLUMN IF EXISTS valor,
  DROP COLUMN IF EXISTS valor_letra,
  DROP COLUMN IF EXISTS falta_horas,
  DROP COLUMN IF EXISTS falta_letras;
