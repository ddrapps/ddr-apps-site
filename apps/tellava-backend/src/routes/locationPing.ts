
import { Router } from 'express';
import { env } from '../config/env';
import { bumpVisit, getMonitoringState, listMonitoredStores } from '../store';
import { haversineMeters } from '../utils';

const router = Router();

router.post('/', (req, res) => {
  const { latitude, longitude, timestamp } = req.body || {};
  if (typeof latitude !== 'number' || typeof longitude !== 'number') {
    res.status(400).json({ ok: false, error: 'latitude and longitude (numbers) are required' });
    return;
  }

  const monitoring = getMonitoringState();
  const stores = listMonitoredStores();
  const nearbyMatches = stores
    .map((store) => ({ store, distanceMeters: haversineMeters(latitude, longitude, store.latitude, store.longitude) }))
    .filter((item) => item.distanceMeters <= env.visitTriggerMeters)
    .sort((a, b) => a.distanceMeters - b.distanceMeters);

  const visits = [];
  const alerts = [];

  for (const match of nearbyMatches.slice(0, 3)) {
    const updated = bumpVisit(match.store.placeId);
    if (!updated) continue;
    visits.push({
      placeId: updated.placeId,
      chainName: updated.chainName,
      visitCount: updated.visitCount,
      distanceMeters: Math.round(match.distanceMeters),
      timestamp: timestamp || new Date().toISOString(),
    });
    alerts.push({
      title: `${updated.chainName} nearby`,
      message: `Visits: ${updated.visitCount}.`,
      placeId: updated.placeId,
    });
  }

  res.json({ ok: true, monitoringEnabled: monitoring.enabled, monitoredCount: stores.length, visits, alerts });
});

export default router;
