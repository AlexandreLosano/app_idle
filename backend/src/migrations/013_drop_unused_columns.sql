-- Migração 013: Remove colunas sem uso

-- factors: valor (nunca lido no código; matemática usa Math.pow(1000, cont-1))
--          dgts  (definido no tipo mas jamais acessado)
ALTER TABLE factors DROP COLUMN IF EXISTS valor;
ALTER TABLE factors DROP COLUMN IF EXISTS dgts;

-- islands: ordem (nunca exibida, nunca editável via API; ORDER BY id é equivalente)
ALTER TABLE islands DROP COLUMN IF EXISTS ordem;
