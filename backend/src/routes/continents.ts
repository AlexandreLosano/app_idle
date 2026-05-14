import { Router, Request, Response } from 'express';
import { pool } from '../db';

const router = Router();

router.get('/', async (_req: Request, res: Response) => {
  const { rows } = await pool.query('SELECT * FROM continents ORDER BY id');
  res.json(rows);
});

router.post('/', async (req: Request, res: Response) => {
  const { nome } = req.body;
  if (!nome?.trim()) return res.status(400).json({ error: 'nome required' });
  const { rows } = await pool.query(
    'INSERT INTO continents (nome) VALUES ($1) RETURNING *',
    [nome.trim()]
  );
  res.status(201).json(rows[0]);
});

router.put('/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  const { nome } = req.body;
  if (!nome?.trim()) return res.status(400).json({ error: 'nome required' });
  const { rows } = await pool.query(
    'UPDATE continents SET nome = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
    [nome.trim(), id]
  );
  if (rows.length === 0) return res.status(404).json({ error: 'not found' });
  res.json(rows[0]);
});

export default router;
