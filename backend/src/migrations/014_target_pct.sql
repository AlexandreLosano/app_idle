-- Migração 014: Adiciona target_pct como config em artefatos

INSERT INTO artefatos (tipo, valor, ativo)
VALUES ('target_pct', 10, false)
ON CONFLICT DO NOTHING;
