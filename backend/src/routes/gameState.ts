import { Router, Request, Response } from 'express';
import { pool } from '../db';

const router = Router();

router.get('/factors', async (_req: Request, res: Response) => {
  const { rows } = await pool.query('SELECT * FROM factors ORDER BY cont');
  res.json(rows);
});

export default router;
