import { Router, Request, Response } from 'express';
import { pool } from '../db';

const router = Router();

router.get('/', async (_req: Request, res: Response) => {
  try {
    const { rows } = await pool.query(
      'SELECT continent_id, valor, letra, unidade, updated_at FROM metas ORDER BY continent_id'
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

router.put('/:continent_id', async (req: Request, res: Response) => {
  const continent_id = Number(req.params.continent_id);
  const { valor, letra, unidade = 's' } = req.body;
  if (!continent_id || valor == null || !letra) {
    return res.status(400).json({ error: 'continent_id, valor e letra são obrigatórios' });
  }
  const validUnidades = ['s', 'min', 'd'];
  if (!validUnidades.includes(unidade)) {
    return res.status(400).json({ error: 'unidade deve ser s, min ou d' });
  }
  try {
    const { rows } = await pool.query(
      `INSERT INTO metas (continent_id, valor, letra, unidade, updated_at)
       VALUES ($1, $2, $3, $4, now())
       ON CONFLICT (continent_id)
       DO UPDATE SET valor = EXCLUDED.valor, letra = EXCLUDED.letra, unidade = EXCLUDED.unidade, updated_at = now()
       RETURNING continent_id, valor, letra, unidade, updated_at`,
      [continent_id, valor, letra, unidade]
    );
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

export default router;
