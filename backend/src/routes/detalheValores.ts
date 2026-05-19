import { Router } from 'express';
import { pool } from '../db';

const router = Router();

// GET /api/detalhe-valores?mine_ids=1,2,3
router.get('/', async (req, res) => {
  const raw = String(req.query.mine_ids ?? '');
  const ids = raw.split(',').map(Number).filter(n => Number.isInteger(n) && n > 0);
  if (ids.length === 0) return res.json([]);
  const { rows } = await pool.query(
    `SELECT mine_id, col_key, valor FROM detalhe_valores WHERE mine_id = ANY($1)`,
    [ids]
  );
  res.json(rows);
});

// PUT /api/detalhe-valores/:mine_id/:col_key
router.put('/:mine_id/:col_key', async (req, res) => {
  const mineId = Number(req.params.mine_id);
  const colKey = req.params.col_key;
  const valor  = String(req.body.valor ?? '');
  await pool.query(
    `INSERT INTO detalhe_valores (mine_id, col_key, valor, updated_at)
     VALUES ($1, $2, $3, now())
     ON CONFLICT (mine_id, col_key)
     DO UPDATE SET valor = EXCLUDED.valor, updated_at = now()`,
    [mineId, colKey, valor]
  );
  res.json({ mine_id: mineId, col_key: colKey, valor });
});

export default router;
