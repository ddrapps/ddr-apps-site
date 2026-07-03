
import { upsertMonitoredStore, listMonitoredStores, removeMonitoredStore } from '../store';

const router = Router();

router.post('/', (req, res) => {
  const { placeId, chainName, address, latitude, longitude, category, defaultSpend, riskLevel, score, visitCount } = req.body;
  if (!placeId || !chainName) {
    res.status(400).json({ ok: false, error: 'placeId and chainName are required' });
    return;
  }
  const store = upsertMonitoredStore({
    placeId,
    chainName,
    address: address || 'No address available',
    latitude: typeof latitude === 'number' ? latitude : 0,
    longitude: typeof longitude === 'number' ? longitude : 0,
    category: category || 'store',
    defaultSpend: typeof defaultSpend === 'number' ? defaultSpend : 0,
    riskLevel: riskLevel || 'low',
    score: typeof score === 'number' ? score : 0,
    visitCount: typeof visitCount === 'number' ? visitCount : 0,
    monitored: true,
  });
  res.json({ ok: true, store, monitoredCount: listMonitoredStores().length });
});
router.delete('/:placeId', (req, res) => {
  const placeId = req.params.placeId?.trim();

  if (!placeId) {
    return res.status(400).json({ error: 'placeId is required.' });
  }

  const removed = removeMonitoredStore(placeId);

  if (!removed) {
    return res.status(404).json({ error: 'Monitored store not found.' });
  }

  return res.json({
    ok: true,
    removed,
    monitoredCount: listMonitoredStores().length,
  });
}

export default router;
