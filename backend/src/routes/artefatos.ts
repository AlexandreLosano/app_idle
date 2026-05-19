import { Router, Request, Response } from 'express';
import { pool } from '../db';

const router = Router();

const CONFIG_TIPOS = ['buster_anuncio', 'total_comprado', 'target_pct', 'mult_off', 'horas_sono'];

router.get('/config', async (_req: Request, res: Response) => {
  const { rows } = await pool.query(
    `SELECT tipo, valor FROM artefatos WHERE tipo = ANY($1)`,
    [CONFIG_TIPOS]
  );
  const result: Record<string, number | null> = { buster_anuncio: null, total_comprado: null, target_pct: null, mult_off: null, horas_sono: null };
  for (const r of rows) result[r.tipo] = r.valor !== null ? parseFloat(r.valor) : null;
  res.json(result);
});

router.put('/config', async (req: Request, res: Response) => {
  const { buster_anuncio, total_comprado, target_pct, mult_off, horas_sono } = req.body;

  if (buster_anuncio !== undefined) {
    await pool.query(
      `UPDATE artefatos SET valor = $1, updated_at = NOW() WHERE tipo = 'buster_anuncio'`,
      [buster_anuncio]
    );
  }
  if (total_comprado !== undefined) {
    await pool.query(
      `UPDATE artefatos SET valor = $1, updated_at = NOW() WHERE tipo = 'total_comprado'`,
      [total_comprado]
    );
  }
  if (target_pct !== undefined) {
    await pool.query(
      `UPDATE artefatos SET valor = $1, updated_at = NOW() WHERE tipo = 'target_pct'`,
      [target_pct]
    );
  }
  if (mult_off !== undefined) {
    await pool.query(
      `UPDATE artefatos SET valor = $1, updated_at = NOW() WHERE tipo = 'mult_off'`,
      [mult_off]
    );
  }
  if (horas_sono !== undefined) {
    await pool.query(
      `UPDATE artefatos SET valor = $1, updated_at = NOW() WHERE tipo = 'horas_sono'`,
      [horas_sono]
    );
  }

  const { rows } = await pool.query(
    `SELECT tipo, valor FROM artefatos WHERE tipo = ANY($1)`,
    [CONFIG_TIPOS]
  );
  const result: Record<string, number | null> = { buster_anuncio: null, total_comprado: null, target_pct: null, mult_off: null, horas_sono: null };
  for (const r of rows) result[r.tipo] = r.valor !== null ? parseFloat(r.valor) : null;
  res.json(result);
});

router.post('/', async (req: Request, res: Response) => {
  const { quantidade, tipo } = req.body;
  if (!quantidade || isNaN(Number(quantidade))) {
    return res.status(400).json({ error: 'quantidade obrigatória' });
  }
  const { rows } = await pool.query(
    `INSERT INTO artefatos (quantidade, tipo, ativo) VALUES ($1, $2, false) RETURNING *`,
    [Number(quantidade), tipo || 'Por tempo']
  );
  res.status(201).json(rows[0]);
});

router.get('/', async (_req: Request, res: Response) => {
  const { rows } = await pool.query(
    `SELECT * FROM artefatos WHERE quantidade IS NOT NULL ORDER BY quantidade`
  );
  res.json(rows);
});

router.put('/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  const { ativo, tipo } = req.body;

  const { rows } = await pool.query(
    `UPDATE artefatos SET
      ativo = COALESCE($1, ativo),
      tipo  = COALESCE($2, tipo),
      updated_at = NOW()
    WHERE id = $3 AND quantidade IS NOT NULL
    RETURNING *`,
    [ativo, tipo, id]
  );

  if (rows.length === 0) return res.status(404).json({ error: 'Not found' });
  res.json(rows[0]);
});

export default router;
