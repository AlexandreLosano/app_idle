import { Router, Request, Response } from 'express';
import { pool } from '../db';

const router = Router();

router.get('/', async (req: Request, res: Response) => {
  try {
    const { game_mode_id } = req.query;
    const params: unknown[] = [];
    let where = '';
    if (game_mode_id) {
      params.push(game_mode_id);
      where = 'WHERE game_mode_id = $1';
    }
    const { rows } = await pool.query(
      `SELECT * FROM continents ${where} ORDER BY id`,
      params
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

router.post('/', async (req: Request, res: Response) => {
  const { nome, game_mode_id } = req.body;
  if (!nome?.trim() || !game_mode_id) {
    return res.status(400).json({ error: 'nome and game_mode_id required' });
  }
  try {
    const { rows } = await pool.query(
      'INSERT INTO continents (nome, game_mode_id) VALUES ($1, $2) RETURNING *',
      [nome.trim(), game_mode_id]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

router.put('/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  const { nome, game_mode_id } = req.body;
  try {
    const { rows } = await pool.query(
      `UPDATE continents SET
        nome         = COALESCE($1, nome),
        game_mode_id = COALESCE($2, game_mode_id),
        updated_at   = NOW()
      WHERE id = $3
      RETURNING *`,
      [nome?.trim() || null, game_mode_id ?? null, id]
    );
    if (rows.length === 0) return res.status(404).json({ error: 'not found' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

export default router;
