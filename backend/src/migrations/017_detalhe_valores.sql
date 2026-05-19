CREATE TABLE IF NOT EXISTS detalhe_valores (
  mine_id  INTEGER NOT NULL REFERENCES mines(id) ON DELETE CASCADE,
  col_key  TEXT    NOT NULL,
  valor    TEXT    NOT NULL DEFAULT '',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (mine_id, col_key)
);
