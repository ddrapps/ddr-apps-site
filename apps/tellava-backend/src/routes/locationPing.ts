import { Router } from 'express';
import { env } from '../config/env';
import {
  bumpVisit,
  getDwellState,
  getMonitoringState,
  listMonitoredStores,
  markAlerted,
  markEntered,
  markExited,
  clearAllDwellState
} from '../store';
import { haversineMeters } from '../utils';

const router = Router();

const DWELL_MS = 3 * 60 * 1000;

router.post('/', (req, res) => {
  const { latitude, longitude, timestamp } = req.body || {};
  if (typeof latitude !== 'number' || typeof longitude !== 'number') {
    res.status(400).json({ ok: false, error: 'latitude and longitude (numbers) are required' });
    return;
  }

  const nowIso =
    typeof timestamp === 'string' && !Number.isNaN(Date.parse(timestamp))
      ? timestamp
      : new Date().toISOString();

  const nowMs = Date.parse(nowIso);
  const monitoring = getMonitoringState();
  const stores = listMonitoredStores();

  const allMatches = stores
    .map((store) => ({
      store,
      distanceMeters: haversineMeters(latitude, longitude, store.latitude, store.longitude)
    }))
    .sort((a, b) => a.distanceMeters - b.distanceMeters);

  const nearbyMatches = allMatches.filter(
    (item) => item.distanceMeters <= env.visitTriggerMeters
  );

  if (nearbyMatches.length === 0) {
  clearAllDwellState();

  res.json({
    ok: true,
    monitoringEnabled: monitoring.enabled,
    monitoredCount: stores.length,
    visits: [],
    alerts: []
  });
  return;
}

  const insidePlaceIds = new Set(nearbyMatches.map((item) => item.store.placeId));

  for (const store of stores) {
    if (!insidePlaceIds.has(store.placeId)) {
      markExited(store.placeId);
    }
  }

  const visits = [];
  const alerts = [];

  for (const match of nearbyMatches.slice(0, 3)) {
    const placeId = match.store.placeId;
    let dwell = getDwellState(placeId);

    if (!dwell || !dwell.enteredAt) {
      markEntered(placeId, nowIso);
      continue;
    }

    if (dwell.alertedAt) {
      continue;
    }

    const enteredAtMs = Date.parse(dwell.enteredAt);
    if (Number.isNaN(enteredAtMs)) {
      markEntered(placeId, nowIso);
      continue;
    }

    const dwellMs = nowMs - enteredAtMs;
    if (dwellMs < DWELL_MS) {
      continue;
    }

    const updated = bumpVisit(placeId);
    if (!updated) continue;

    markAlerted(placeId, nowIso);

    visits.push({
      placeId: updated.placeId,
      chainName: updated.chainName,
      visitCount: updated.visitCount,
      distanceMeters: Math.round(match.distanceMeters),
      dwellSeconds: Math.round(dwellMs / 1000),
      timestamp: nowIso,
    });

    alerts.push({
      title: `${updated.chainName} nearby`,
      message: `Visits: ${updated.visitCount}.`,
      placeId: updated.placeId,
    });
  }

  res.json({
    ok: true,
    monitoringEnabled: monitoring.enabled,
    monitoredCount: stores.length,
    visits,
    alerts
  });
});

export default router;
