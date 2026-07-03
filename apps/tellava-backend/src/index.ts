import cors from 'cors';
import express from 'express';
import enableMonitoringRoute from './routes/enableMonitoring';
import healthRoute from './routes/health';
import locationPingRoute from './routes/locationPing';
import monitorStoreRoute from './routes/monitorStore';
import nearbyStoresRoute from './routes/nearbyStores';
import setRiskPingRoute from './routes/setRiskPing';

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/health', healthRoute);
app.use('/api/enable-monitoring', enableMonitoringRoute);
app.use('/api/location-ping', locationPingRoute);
app.use('/api/monitor-store', monitorStoreRoute);
app.use('/api/nearby-stores', nearbyStoresRoute);
app.use('/api/set-risk-ping', setRiskPingRoute);

const port = Number(process.env.PORT || 3000);

app.listen(port, () => {
  console.log(`Tellava backend listening on port ${port}`);
});
