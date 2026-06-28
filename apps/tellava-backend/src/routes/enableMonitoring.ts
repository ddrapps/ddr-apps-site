
import { Router } from 'express';
import { getMonitoringState, setMonitoringEnabled } from '../store';

const router = Router();

router.get('/', (_req, res) => {
  res.json({ ok: true, monitoring: getMonitoringState() });
});

router.post('/', (req, res) => {
  const { enabled = true, notificationToken = null } = req.body || {};
  const monitoring = setMonitoringEnabled(Boolean(enabled), notificationToken);
  res.json({ ok: true, monitoring });
});

export default router;
