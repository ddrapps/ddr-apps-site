import { Router } from 'express';
import { env } from '../config/env';

const router = Router();

router.post('/', async (req, res) => {
  try {
    const { latitude, longitude } = req.body;

    if (typeof latitude !== 'number' || typeof longitude !== 'number') {
      res.status(400).json({
        ok: false,
        error: 'latitude and longitude (numbers) are required'
      });
      return;
    }

    if (!env.googlePlacesApiKey) {
      res.status(500).json({
        ok: false,
        error: 'Google Places API key is not configured on the server'
      });
      return;
    }

    const googleResponse = await fetch(
      'https://places.googleapis.com/v1/places:searchNearby',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Goog-Api-Key': env.googlePlacesApiKey,
          'X-Goog-FieldMask':
            'places.id,places.displayName,places.formattedAddress,places.location'
        },
        body: JSON.stringify({
          includedTypes: [
            'grocery_store',
            'supermarket',
            'convenience_store'
          ],
          maxResultCount: 10,
          locationRestriction: {
            circle: {
              center: { latitude, longitude },
              radius: 5000
            }
          }
        })
      }
    );

    const data = await googleResponse.json();

    if (!googleResponse.ok) {
      res.status(502).json({
        ok: false,
        error: 'Google Places API error',
        details: data
      });
      return;
    }

    const places = data.places ?? [];

    const stores = places.map((place: any) => ({
      placeId: place.id,
      chainName: place.displayName?.text ?? 'Unknown store',
      address: place.formattedAddress ?? 'No address available',
      latitude: place.location?.latitude ?? latitude,
      longitude: place.location?.longitude ?? longitude,
      category: 'store',
      defaultSpend: 0,
      riskLevel: 'low',
      score: 0
    }));

    res.json({
      ok: true,
      count: stores.length,
      stores
    });
  } catch (error) {
    console.error('Nearby stores error:', error);
    res.status(500).json({
      ok: false,
      error: 'Failed to search nearby stores'
    });
  }
});

export default router;
