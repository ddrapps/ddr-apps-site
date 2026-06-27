import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { env } from './config/env';
import healthRouter from './routes/health';

const app = express();

app.use(cors({ origin: env.appOrigin === '*' ? true : env.appOrigin }));
app.use(express.json());
app.use(morgan('dev'));

app.get('/', (_req, res) => {
  res.json({
    message: 'Tellava backend is running',
    health: '/api/health'
  });
});

app.use('/api/health', healthRouter);

app.use((_req, res) => {
  res.status(404).json({ error: 'Not found' });
});

app.listen(env.port, () => {
  console.log(`Tellava backend listening on port ${env.port}`);
});
