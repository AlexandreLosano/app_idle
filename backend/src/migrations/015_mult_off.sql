-- Migração 015: Adiciona mult_off como config em artefatos

INSERT INTO artefatos (tipo, valor, ativo)
VALUES ('mult_off', 3, false)
ON CONFLICT DO NOTHING;
