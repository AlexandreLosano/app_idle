import express from 'express';
import cors from 'cors';
import { runMigrations } from './db';
import minesRouter from './routes/mines';
import islandsRouter from './routes/islands';
import gameStateRouter from './routes/gameState';
import artefatosRouter from './routes/artefatos';
import continentsRouter from './routes/continents';

const app = express();
const PORT = parseInt(process.env.PORT ?? '3000', 10);

app.use(cors());
app.use(express.json());

app.use('/api/mines', minesRouter);
app.use('/api/islands', islandsRouter);
app.use('/api/game', gameStateRouter);
app.use('/api/artefatos', artefatosRouter);
app.use('/api/continents', continentsRouter);

app.get('/health', (_req, res) => res.json({ status: 'ok' }));

async function start() {
  await runMigrations();
  app.listen(PORT, () => console.log(`Backend running on port ${PORT}`));
}

start().catch(err => {
  console.error('Failed to start:', err);
  process.exit(1);
});
