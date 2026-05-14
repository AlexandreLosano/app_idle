-- Migração 002: FK de minas para ilhas + reseed completo

-- Limpa dados anteriores e reseta sequences
TRUNCATE prestige, mines, islands RESTART IDENTITY CASCADE;

-- Reseed ilhas com IDs fixos
INSERT INTO islands (id, nome, ordem) VALUES
  (1, 'Principal',  1),
  (2, 'Gelo',       2),
  (3, 'Fogo',       3),
  (4, 'Aurora',     4),
  (5, 'Crepúsculo', 5),
  (6, 'Antigo',     6),
  (7, 'Misterio',   7),
  (8, 'Oceano',     8)
ON CONFLICT (id) DO NOTHING;

SELECT setval('islands_id_seq', 8);

-- Adiciona coluna island_id em mines (se não existir)
ALTER TABLE mines ADD COLUMN IF NOT EXISTS island_id INTEGER REFERENCES islands(id);

-- Reseed minas com FK para ilhas (baseado na planilha Transformação-Normal)
INSERT INTO mines (nome, ordem, island_id) VALUES
  -- Principal (ilha 1)
  ('Carvão',      1, 1),
  ('Ouro',        2, 1),
  ('Rubi',        3, 1),
  ('Diamante',    4, 1),
  ('Esmeralda',   5, 1),
  -- Gelo (ilha 2)
  ('Seletina',    1, 2),
  ('Ametista',    2, 2),
  ('Safira',      3, 2),
  ('Cristal',     4, 2),
  ('Jade',        5, 2),
  -- Fogo (ilha 3)
  ('Ambar',           1, 3),
  ('Pedra do Sol',    2, 3),
  ('Topázio',         3, 3),
  ('Platina',         4, 3),
  ('Obsidiana',       5, 3),
  -- Aurora (ilha 4)
  ('Heliodoro',    1, 4),
  ('Realgar',      2, 4),
  ('Alexandrita',  3, 4),
  ('Celestina',    4, 4),
  ('Titanita',     5, 4),
  -- Crepúsculo (ilha 5)
  ('Fluorita',  1, 5),
  ('Quartzo',   2, 5),
  ('Argonita',  3, 5),
  ('Berilo',    4, 5),
  ('Calcita',   5, 5),
  -- Antigo (ilha 6)
  ('Água-Marinha', 1, 6),
  ('Amolita',      2, 6),
  ('Azurita',      3, 6),
  ('Pérola',       4, 6),
  ('Turquesa',     5, 6),
  -- Misterio (ilha 7)
  ('Crisoberílio',  1, 7),
  ('Labradorita',   2, 7),
  ('Aventurina',    3, 7),
  ('Jaspe',         4, 7),
  ('Cornalina',     5, 7),
  -- Oceano (ilha 8)
  ('Nautilus',  1, 8),
  ('Atlatis',   2, 8),
  ('Bermudas',  3, 8),
  ('Sereias',   4, 8)
ON CONFLICT (nome) DO NOTHING;

-- Reseed prestígio (uma entrada por mina da ilha Principal)
INSERT INTO prestige (mina_nome) VALUES
  ('Carvão'),
  ('Ouro'),
  ('Rubi'),
  ('Diamante'),
  ('Esmeralda')
ON CONFLICT (mina_nome) DO NOTHING;
