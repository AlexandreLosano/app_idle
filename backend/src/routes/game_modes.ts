import { Router, Request, Response } from 'express';
import { pool } from '../db';

const router = Router();

router.get('/', async (_req: Request, res: Response) => {
  try {
    const { rows } = await pool.query('SELECT * FROM game_modes ORDER BY id');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

router.post('/', async (req: Request, res: Response) => {
  const { nome } = req.body;
  if (!nome?.trim()) return res.status(400).json({ error: 'nome required' });
  try {
    const { rows } = await pool.query(
      'INSERT INTO game_modes (nome) VALUES ($1) RETURNING *',
      [nome.trim()]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

router.put('/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  const { nome } = req.body;
  if (!nome?.trim()) return res.status(400).json({ error: 'nome required' });
  try {
    const { rows } = await pool.query(
      'UPDATE game_modes SET nome = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
      [nome.trim(), id]
    );
    if (rows.length === 0) return res.status(404).json({ error: 'not found' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

export default router;
