const GOOGLE_PLACES_AUTOCOMPLETE_URL = 'https://places.googleapis.com/v1/places:autocomplete';
const GOOGLE_PLACE_DETAILS_PREFIX = 'https://places.googleapis.com/v1/places/';

const categoryToGoogleTypes = (category) => {
  if (category === 'coffee') return ['coffee_shop'];
  if (category === 'big_box') return ['department_store', 'store'];
  if (category === 'fast_food') return ['restaurant', 'meal_takeaway'];
  return ['store'];
};

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  if (!apiKey) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Missing GOOGLE_PLACES_API_KEY' })
    };
  }

  try {
    const { query = '', category = 'coffee' } = JSON.parse(event.body || '{}');
    if (query.trim().length < 2) {
      return { statusCode: 200, body: JSON.stringify({ results: [] }) };
    }

    const body = {
      input: query,
      includedRegionCodes: ['ca'],
      includedPrimaryTypes: categoryToGoogleTypes(category),
      locationBias: {
        circle: {
          center: { latitude: 51.0447, longitude: -114.0719 },
          radius: 50000
        }
      }
    };

    const auto = await fetch(GOOGLE_PLACES_AUTOCOMPLETE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': apiKey,
        'X-Goog-FieldMask': 'suggestions.placePrediction.place,suggestions.placePrediction.text'
      },
      body: JSON.stringify(body)
    });

    if (!auto.ok) {
      const text = await auto.text();
      return { statusCode: auto.status, body: JSON.stringify({ error: text }) };
    }

    const autoJson = await auto.json();
    const predictions = autoJson?.suggestions ?? [];

    const results = await Promise.all(predictions.slice(0, 5).map(async (item) => {
      const placeName = item?.placePrediction?.place;
      const text = item?.placePrediction?.text?.text ?? 'Unknown place';
      if (!placeName) return null;
      const placeId = placeName.split('/').pop();
      const details = await fetch(`${GOOGLE_PLACE_DETAILS_PREFIX}${placeId}`, {
        headers: {
          'X-Goog-Api-Key': apiKey,
          'X-Goog-FieldMask': 'id,displayName,formattedAddress,location'
        }
      });
      if (!details.ok) return null;
      const detailJson = await details.json();
      return {
        id: detailJson.id,
        label: detailJson.displayName?.text ?? text,
        address: detailJson.formattedAddress ?? '',
        category,
        latitude: detailJson.location?.latitude,
        longitude: detailJson.location?.longitude,
        radiusMeters: category === 'big_box' ? 150 : 120
      };
    }));

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store'
      },
      body: JSON.stringify({ results: results.filter(Boolean) })
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message || 'Unknown error' })
    };
  }
};
