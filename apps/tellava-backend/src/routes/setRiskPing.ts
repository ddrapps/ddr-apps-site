
import { Router } from 'express';
import { setRisk } from '../store';

const valid = new Set(['low', 'medium', 'high']);
const router = Router();

router.post('/', (req, res) => {
  const { placeId, riskLevel, chainName, address, latitude, longitude, category, defaultSpend, score, visitCount } = req.body;
  if (!placeId || !valid.has(riskLevel)) {
    res.status(400).json({ ok: false, error: 'placeId and valid riskLevel are required' });
    return;
  }
  const store = setRisk(placeId, riskLevel, {
    chainName,
    address,
    latitude,
    longitude,
    category,
    defaultSpend,
    score,
    visitCount,
  });
  res.json({ ok: true, placeId: store.placeId, riskLevel: store.riskLevel, score: store.score, visitCount: store.visitCount, store });
});

export default router;
