import { Router, Request, Response } from 'express';
import { pool } from '../db';

const router = Router();

router.get('/', async (req: Request, res: Response) => {
  try {
    const { continent_id, game_mode_id } = req.query;
    const params: unknown[] = [];
    const conditions: string[] = [];

    if (continent_id) {
      params.push(continent_id);
      conditions.push(`m.continent_id = $${params.length}`);
    }
    if (game_mode_id) {
      params.push(game_mode_id);
      conditions.push(`c.game_mode_id = $${params.length}`);
    }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

    const { rows } = await pool.query(
      `SELECT m.*, c.nome AS continent_nome
       FROM mines m
       LEFT JOIN continents c ON c.id = m.continent_id
       ${where}
       ORDER BY c.id NULLS LAST, m.id`,
      params
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

router.post('/', async (req: Request, res: Response) => {
  const { nome, continent_id } = req.body;
  if (!nome?.trim()) return res.status(400).json({ error: 'nome required' });
  try {
    const { rows: ins } = await pool.query(
      'INSERT INTO mines (nome, continent_id) VALUES ($1, $2) RETURNING id',
      [nome.trim(), continent_id ?? null]
    );
    const { rows } = await pool.query(
      `SELECT m.*, c.nome AS continent_nome
       FROM mines m
       LEFT JOIN continents c ON c.id = m.continent_id
       WHERE m.id = $1`,
      [ins[0].id]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

router.put('/:nome', async (req: Request, res: Response) => {
  const { nome } = req.params;
  const {
    nome: newNome,
    continent_id,
    armazem_nivel, armazem_letra,
    elevador_nivel, elevador_letra,
    extracao_nivel, extracao_letra,
    prestigio_atual, prestigio_maximo,
    proximo_prestigio_valor, proximo_prestigio_letra,
    fator_rendimento,
  } = req.body;

  try {
    const update = await pool.query(
      `UPDATE mines SET
        nome                       = COALESCE($1,  nome),
        continent_id               = COALESCE($2,  continent_id),
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
        fator_rendimento           = COALESCE($13, fator_rendimento),
        updated_at                 = NOW()
      WHERE nome = $14
      RETURNING id`,
      [newNome?.trim() || null, continent_id,
       armazem_nivel, armazem_letra, elevador_nivel, elevador_letra,
       extracao_nivel, extracao_letra,
       prestigio_atual, prestigio_maximo,
       proximo_prestigio_valor, proximo_prestigio_letra,
       fator_rendimento ?? null,
       nome]
    );

    if (update.rows.length === 0) return res.status(404).json({ error: 'Mine not found' });

    const { rows } = await pool.query(
      `SELECT m.*, c.nome AS continent_nome
       FROM mines m
       LEFT JOIN continents c ON c.id = m.continent_id
       WHERE m.id = $1`,
      [update.rows[0].id]
    );
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

export default router;
