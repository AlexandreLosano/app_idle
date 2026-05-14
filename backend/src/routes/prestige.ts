import { Router, Request, Response } from 'express';
import { pool } from '../db';

const router = Router();

router.get('/', async (_req: Request, res: Response) => {
  const { rows } = await pool.query('SELECT * FROM prestige ORDER BY id');
  res.json(rows);
});

router.put('/:minaNome', async (req: Request, res: Response) => {
  const { minaNome } = req.params;
  const {
    prestigio_atual, gap, verificacao,
    valor_offline, valor_offline_letra, proximo_ordem,
  } = req.body;

  const { rows } = await pool.query(
    `UPDATE prestige SET
      prestigio_atual = COALESCE($1, prestigio_atual),
      gap = COALESCE($2, gap),
      verificacao = COALESCE($3, verificacao),
      valor_offline = COALESCE($4, valor_offline),
      valor_offline_letra = COALESCE($5, valor_offline_letra),
      proximo_ordem = COALESCE($6, proximo_ordem),
      updated_at = NOW()
    WHERE mina_nome = $7
    RETURNING *`,
    [prestigio_atual, gap, verificacao, valor_offline, valor_offline_letra, proximo_ordem, minaNome]
  );

  if (rows.length === 0) return res.status(404).json({ error: 'Prestige record not found' });
  res.json(rows[0]);
});

export default router;
