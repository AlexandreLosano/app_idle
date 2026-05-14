import { Router, Request, Response } from 'express';
import { pool } from '../db';

const router = Router();

router.get('/', async (req: Request, res: Response) => {
  const { island_id } = req.query;
  const params: unknown[] = [];
  let where = '';
  if (island_id) {
    params.push(island_id);
    where = 'WHERE m.island_id = $1';
  }

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

router.put('/:nome', async (req: Request, res: Response) => {
  const { nome } = req.params;
  const {
    island_id,
    armazem_nivel, armazem_letra,
    elevador_nivel, elevador_letra,
    extracao_nivel, extracao_letra,
    prestigio_atual, prestigio_maximo,
  } = req.body;

  const update = await pool.query(
    `UPDATE mines SET
      island_id        = COALESCE($1,  island_id),
      armazem_nivel    = COALESCE($2,  armazem_nivel),
      armazem_letra    = COALESCE($3,  armazem_letra),
      elevador_nivel   = COALESCE($4,  elevador_nivel),
      elevador_letra   = COALESCE($5,  elevador_letra),
      extracao_nivel   = COALESCE($6,  extracao_nivel),
      extracao_letra   = COALESCE($7,  extracao_letra),
      prestigio_atual            = COALESCE($8,  prestigio_atual),
      prestigio_maximo           = COALESCE($9,  prestigio_maximo),
      proximo_prestigio_valor    = COALESCE($10, proximo_prestigio_valor),
      proximo_prestigio_letra    = COALESCE($11, proximo_prestigio_letra),
      updated_at                 = NOW()
    WHERE nome = $12
    RETURNING id`,
    [island_id, armazem_nivel, armazem_letra, elevador_nivel, elevador_letra,
     extracao_nivel, extracao_letra,
     prestigio_atual, prestigio_maximo,
     req.body.proximo_prestigio_valor, req.body.proximo_prestigio_letra,
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
