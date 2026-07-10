
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { env } from './config/env';
import healthRouter from './routes/health';
import nearbyStoresRouter from './routes/nearbyStores';
import monitorStoreRouter from './routes/monitorStore';
import locationPingRouter from './routes/locationPing';
import enableMonitoringRouter from './routes/enableMonitoring';

const app = express();

app.use(cors({ origin: env.appOrigin === '*' ? true : env.appOrigin }));
app.use(express.json());
app.use(morgan('dev'));

app.get('/', (_req, res) => {
  res.json({
    message: 'Tellava backend is running',
    health: '/api/health',
    routes: ['/api/nearby-stores','/api/monitor-store','/api/location-ping','/api/enable-monitoring']
  });
});

app.use('/api/health', healthRouter);
app.use('/api/nearby-stores', nearbyStoresRouter);
app.use('/api/monitor-store', monitorStoreRouter);
app.use('/api/location-ping', locationPingRouter);
app.use('/api/enable-monitoring', enableMonitoringRouter);

app.use((_req, res) => {
  res.status(404).json({ error: 'Not found' });
});

app.listen(env.port, () => {
  console.log(`Tellava backend listening on port ${env.port}`);
});
