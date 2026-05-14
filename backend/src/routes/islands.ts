import { Router, Request, Response } from 'express';
import { pool } from '../db';

const router = Router();

router.get('/', async (req: Request, res: Response) => {
  const { continent_id } = req.query;
  const params: unknown[] = [];
  let where = '';
  if (continent_id) {
    params.push(continent_id);
    where = 'WHERE continent_id = $1';
  }
  const { rows } = await pool.query(
    `SELECT * FROM islands ${where} ORDER BY id`,
    params
  );
  res.json(rows);
});

router.post('/', async (req: Request, res: Response) => {
  const { nome, continent_id } = req.body;
  if (!nome?.trim() || !continent_id) {
    return res.status(400).json({ error: 'nome and continent_id required' });
  }
  const { rows } = await pool.query(
    'INSERT INTO islands (nome, continent_id) VALUES ($1, $2) RETURNING *',
    [nome.trim(), continent_id]
  );
  res.status(201).json(rows[0]);
});

router.put('/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  const { nome, continent_id } = req.body;
  const { rows } = await pool.query(
    `UPDATE islands SET
      nome         = COALESCE($1, nome),
      continent_id = COALESCE($2, continent_id),
      updated_at   = NOW()
    WHERE id = $3
    RETURNING *`,
    [nome?.trim() || null, continent_id ?? null, id]
  );
  if (rows.length === 0) return res.status(404).json({ error: 'not found' });
  res.json(rows[0]);
});

export default router;
