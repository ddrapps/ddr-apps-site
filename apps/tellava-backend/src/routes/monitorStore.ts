import { Router } from 'express';
import { removeMonitoredStore, saveMonitoredStore, getMonitoredStores } from '../store';
import type { StoreProxy } from '../types';

const router = Router();

router.post('/', (req, res) => {
  const store = req.body as StoreProxy;

  if (!store?.placeId || !store?.chainName) {
    return res.status(400).json({
      error: 'placeId and chainName are required.',
    });
  }

  const saved = saveMonitoredStore({
    ...store,
    monitored: true,
  });

  return res.json({
    ok: true,
    store: saved,
    monitoredCount: getMonitoredStores().length,
  });
});

router.delete('/:placeId', (req, res) => {
  const placeId = req.params.placeId?.trim();

  if (!placeId) {
    return res.status(400).json({
      error: 'placeId is required.',
    });
  }

  const removed = removeMonitoredStore(placeId);

  if (!removed) {
    return res.status(404).json({
      error: 'Monitored store not found.',
    });
  }

  return res.json({
    ok: true,
    removed,
    monitoredCount: getMonitoredStores().length,
  });
});

export default router;
