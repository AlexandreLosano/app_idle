-- Migração 008: Move buster_anuncio e total_comprado para a tabela artefatos

ALTER TABLE artefatos ALTER COLUMN quantidade DROP NOT NULL;
ALTER TABLE artefatos ADD COLUMN IF NOT EXISTS valor NUMERIC;

DELETE FROM artefatos WHERE tipo IN ('buster_anuncio', 'total_comprado');

INSERT INTO artefatos (tipo, valor, ativo)
SELECT 'buster_anuncio', buster_anuncio, false FROM boosters_config WHERE id = 1;

INSERT INTO artefatos (tipo, valor, ativo)
SELECT 'total_comprado', total_comprado, false FROM boosters_config WHERE id = 1;
