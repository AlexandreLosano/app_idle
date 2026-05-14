-- Migração 001: Schema inicial

CREATE TABLE IF NOT EXISTS factors (
  letra    VARCHAR(5)   PRIMARY KEY,
  cont     INTEGER      NOT NULL,
  valor    TEXT         NOT NULL,
  dgts     INTEGER      NOT NULL
);

CREATE TABLE IF NOT EXISTS game_state (
  id           SERIAL PRIMARY KEY,
  fator_mult   NUMERIC(10,4),
  nivel_atual  INTEGER,
  meta         INTEGER,
  updated_at   TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS mines (
  id                   SERIAL PRIMARY KEY,
  nome                 VARCHAR(50)  NOT NULL UNIQUE,
  ordem                INTEGER,
  armazem_nivel        NUMERIC,
  armazem_letra        VARCHAR(5),
  elevador_nivel       NUMERIC,
  elevador_letra       VARCHAR(5),
  extracao_nivel       NUMERIC,
  extracao_letra       VARCHAR(5),
  valor_minimo         NUMERIC,
  valor_minimo_letra   VARCHAR(5),
  verificacao          VARCHAR(50),
  updated_at           TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS prestige (
  id                       SERIAL PRIMARY KEY,
  mina_nome                VARCHAR(50) NOT NULL UNIQUE,
  prestigio_atual          INTEGER     DEFAULT 0,
  gap                      INTEGER     DEFAULT 0,
  verificacao              VARCHAR(50),
  valor_offline            NUMERIC,
  valor_offline_letra      VARCHAR(5),
  proximo_ordem            INTEGER,
  updated_at               TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS islands (
  id                SERIAL PRIMARY KEY,
  nome              VARCHAR(50)  NOT NULL UNIQUE,
  ordem             INTEGER,
  proximo_gem       VARCHAR(50),
  valor             NUMERIC,
  valor_letra       VARCHAR(5),
  falta_horas       VARCHAR(100),
  falta_letras      INTEGER,
  updated_at        TIMESTAMP DEFAULT NOW()
);

-- Seed: sistema de fatores (notação do jogo)
INSERT INTO factors (letra, cont, valor, dgts) VALUES
  ('-',  1,  '1',                  1),
  ('k',  2,  '1000',               4),
  ('m',  3,  '1000000',            7),
  ('b',  4,  '1000000000',         10),
  ('t',  5,  '1000000000000',      13),
  ('aa', 6,  '1000000000000000',   16),
  ('ab', 7,  '1e18',               19),
  ('ac', 8,  '1e21',               22),
  ('ad', 9,  '1e24',               25),
  ('ae', 10, '1e27',               28),
  ('af', 11, '1e30',               31),
  ('ag', 12, '1e33',               34),
  ('ah', 13, '1e36',               37),
  ('ai', 14, '1e39',               40),
  ('aj', 15, '1e42',               43),
  ('ak', 16, '1e45',               46),
  ('al', 17, '1e48',               49),
  ('am', 18, '1e51',               52),
  ('an', 19, '1e54',               55),
  ('ao', 20, '1e57',               58),
  ('ap', 21, '1e60',               61),
  ('aq', 22, '1e63',               64),
  ('ar', 23, '1e66',               67),
  ('as', 24, '1e69',               70),
  ('at', 25, '1e72',               73),
  ('au', 26, '1e75',               76),
  ('av', 27, '1e78',               79),
  ('aw', 28, '1e81',               82),
  ('ax', 29, '1e84',               85),
  ('ay', 30, '1e87',               88),
  ('az', 31, '1e90',               91),
  ('ba', 32, '1e93',               94),
  ('bb', 33, '1e96',               97),
  ('bc', 34, '1e99',               100),
  ('bd', 35, '1e102',              103),
  ('be', 36, '1e105',              106),
  ('bf', 37, '1e108',              109),
  ('bg', 38, '1e111',              112),
  ('bh', 39, '1e114',              115),
  ('bi', 40, '1e117',              118),
  ('bj', 41, '1e120',              121),
  ('bk', 42, '1e123',              124),
  ('bl', 43, '1e126',              127),
  ('bm', 44, '1e129',              130),
  ('bn', 45, '1e132',              133),
  ('bo', 46, '1e135',              136),
  ('bp', 47, '1e138',              139),
  ('bq', 48, '1e141',              142),
  ('br', 49, '1e144',              145),
  ('bs', 50, '1e147',              148),
  ('bt', 51, '1e150',              151),
  ('bu', 52, '1e153',              154),
  ('bv', 53, '1e156',              157),
  ('bw', 54, '1e159',              160),
  ('bx', 55, '1e162',              163),
  ('by', 56, '1e165',              166),
  ('bz', 57, '1e168',              169)
ON CONFLICT (letra) DO NOTHING;

-- Seed: estado inicial do jogo
INSERT INTO game_state (fator_mult, nivel_atual, meta)
VALUES (53.1, 151, 170)
ON CONFLICT DO NOTHING;

-- Seed: minas (ordem conforme planilha)
INSERT INTO mines (nome, ordem) VALUES
  ('Carvão',    2),
  ('Ouro',      3),
  ('Rubi',      1),
  ('Diamante',  5),
  ('Esmeralda', 4)
ON CONFLICT (nome) DO NOTHING;

-- Seed: prestígio por mina
INSERT INTO prestige (mina_nome) VALUES
  ('Carvão'),
  ('Ouro'),
  ('Rubi'),
  ('Diamante'),
  ('Esmeralda')
ON CONFLICT (mina_nome) DO NOTHING;

-- Seed: ilhas
INSERT INTO islands (nome, ordem) VALUES
  ('Principal',  1),
  ('Gelo',       2),
  ('Fogo',       3),
  ('Aurora',     4),
  ('Crepúsculo', 5),
  ('Antigo',     6)
ON CONFLICT (nome) DO NOTHING;
