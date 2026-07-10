import { Router } from 'express';
import { env } from '../config/env';
import { listMonitoredStores } from '../store';

const router = Router();

router.post('/', async (req, res) => {
  try {
    const { latitude, longitude, query } = req.body;

    if (typeof latitude !== 'number' || typeof longitude !== 'number') {
      res.status(400).json({ ok: false, error: 'latitude and longitude (numbers) are required' });
      return;
    }

    if (!env.googlePlacesApiKey) {
      res.status(500).json({ ok: false, error: 'Google Places API key is not configured on the server' });
      return;
    }

    const fieldMask =
      'places.id,places.displayName,places.formattedAddress,places.location,places.primaryType,places.types';

    const hasQuery = Boolean(query && String(query).trim());

    const body = hasQuery
      ? {
          textQuery: String(query).trim(),
          maxResultCount: 20,
          locationBias: {
            circle: {
              center: { latitude, longitude },
              radius: env.storeSearchRadiusMeters,
            },
          },
        }
      : {
          maxResultCount: 20,
          locationRestriction: {
            circle: {
              center: { latitude, longitude },
              radius: env.storeSearchRadiusMeters,
            },
          },
        };

    const endpoint = hasQuery
      ? 'https://places.googleapis.com/v1/places:searchText'
      : 'https://places.googleapis.com/v1/places:searchNearby';

    const googleResponse = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': env.googlePlacesApiKey,
        'X-Goog-FieldMask': fieldMask,
      },
      body: JSON.stringify(body),
    });

    const data = await googleResponse.json();

    if (!googleResponse.ok) {
      res.status(502).json({ ok: false, error: 'Google Places API error', details: data });
      return;
    }

    const monitored = new Map(listMonitoredStores().map((store) => [store.placeId, store]));
    const places = Array.isArray(data.places) ? data.places : [];

    const stores = places.map((place: any) => {
      const existing = monitored.get(place.id);

      return {
        placeId: place.id,
        chainName: place.displayName?.text ?? 'Unknown store',
        address: place.formattedAddress ?? 'No address available',
        latitude: place.location?.latitude ?? latitude,
        longitude: place.location?.longitude ?? longitude,
        category: place.primaryType || place.types?.[0] || 'store',
        defaultSpend: existing?.defaultSpend ?? 0,
        visitCount: existing?.visitCount ?? 0,
        monitored: Boolean(existing),
        lastVisitAt: existing?.lastVisitAt ?? null,
      };
    });

    res.json({ ok: true, count: stores.length, stores });
  } catch (error) {
    console.error('Nearby stores error:', error);
    res.status(500).json({ ok: false, error: 'Failed to search nearby stores' });
  }
});

export default router;

