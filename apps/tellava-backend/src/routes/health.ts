import { Router } from 'express';
import { env } from '../config/env';

const router = Router();

router.get('/', (_req, res) => {
  res.json({
    ok: true,
    service: 'tellava-backend',
    environment: env.nodeEnv,
    hasGooglePlacesKey: Boolean(env.googlePlacesApiKey),
    timestamp: new Date().toISOString()
  });
});

export default router;
