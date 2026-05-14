import { Router, Request, Response } from 'express';
import { pool } from '../db';

const router = Router();

router.get('/', async (req: Request, res: Response) => {
  const { island_id, continent_id } = req.query;
  const params: unknown[] = [];
  const conditions: string[] = [];

  if (island_id) {
    params.push(island_id);
    conditions.push(`m.island_id = $${params.length}`);
  }
  if (continent_id) {
    params.push(continent_id);
    conditions.push(`i.continent_id = $${params.length}`);
  }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

  const { rows } = await pool.query(
    `SELECT m.*, i.nome AS island_nome
     FROM mines m
     LEFT JOIN islands i ON i.id = m.island_id
     ${where}
     ORDER BY i.ordem NULLS LAST, m.id`,
    params
  );
  res.json(rows);
});

router.post('/', async (req: Request, res: Response) => {
  const { nome, island_id } = req.body;
  if (!nome?.trim()) return res.status(400).json({ error: 'nome required' });
  const { rows: ins } = await pool.query(
    'INSERT INTO mines (nome, island_id) VALUES ($1, $2) RETURNING id',
    [nome.trim(), island_id ?? null]
  );
  const { rows } = await pool.query(
    `SELECT m.*, i.nome AS island_nome
     FROM mines m
     LEFT JOIN islands i ON i.id = m.island_id
     WHERE m.id = $1`,
    [ins[0].id]
  );
  res.status(201).json(rows[0]);
});

router.put('/:nome', async (req: Request, res: Response) => {
  const { nome } = req.params;
  const {
    nome: newNome,
    island_id,
    armazem_nivel, armazem_letra,
    elevador_nivel, elevador_letra,
    extracao_nivel, extracao_letra,
    prestigio_atual, prestigio_maximo,
    proximo_prestigio_valor, proximo_prestigio_letra,
  } = req.body;

  const update = await pool.query(
    `UPDATE mines SET
      nome                       = COALESCE($1,  nome),
      island_id                  = COALESCE($2,  island_id),
      armazem_nivel              = COALESCE($3,  armazem_nivel),
      armazem_letra              = COALESCE($4,  armazem_letra),
      elevador_nivel             = COALESCE($5,  elevador_nivel),
      elevador_letra             = COALESCE($6,  elevador_letra),
      extracao_nivel             = COALESCE($7,  extracao_nivel),
      extracao_letra             = COALESCE($8,  extracao_letra),
      prestigio_atual            = COALESCE($9,  prestigio_atual),
      prestigio_maximo           = COALESCE($10, prestigio_maximo),
      proximo_prestigio_valor    = COALESCE($11, proximo_prestigio_valor),
      proximo_prestigio_letra    = COALESCE($12, proximo_prestigio_letra),
      updated_at                 = NOW()
    WHERE nome = $13
    RETURNING id`,
    [newNome?.trim() || null, island_id,
     armazem_nivel, armazem_letra, elevador_nivel, elevador_letra,
     extracao_nivel, extracao_letra,
     prestigio_atual, prestigio_maximo,
     proximo_prestigio_valor, proximo_prestigio_letra,
     nome]
  );

  if (update.rows.length === 0) return res.status(404).json({ error: 'Mine not found' });

  const { rows } = await pool.query(
    `SELECT m.*, i.nome AS island_nome
     FROM mines m
     LEFT JOIN islands i ON i.id = m.island_id
     WHERE m.id = $1`,
    [update.rows[0].id]
  );
  res.json(rows[0]);
});

export default router;
