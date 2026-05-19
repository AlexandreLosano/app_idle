-- Migração 016: Adiciona horas_sono como config em artefatos

INSERT INTO artefatos (tipo, valor, ativo)
VALUES ('horas_sono', 8, false)
ON CONFLICT DO NOTHING;
