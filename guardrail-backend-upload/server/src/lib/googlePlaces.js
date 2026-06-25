const GOOGLE_PLACES_AUTOCOMPLETE_URL = 'https://places.googleapis.com/v1/places:autocomplete';
const GOOGLE_PLACE_DETAILS_PREFIX = 'https://places.googleapis.com/v1/places/';

function categoryToGoogleTypes(category) {
  if (category === 'coffee') return ['coffee_shop'];
  if (category === 'big_box') return ['department_store', 'store'];
  if (category === 'fast_food') return ['restaurant', 'meal_takeaway'];
  return ['store'];
}

async function autocompletePlaces({ query, category = 'coffee' }) {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  if (!apiKey) {
    throw new Error('Missing GOOGLE_PLACES_API_KEY');
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
    throw new Error(`Autocomplete failed: ${text}`);
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

  return results.filter(Boolean);
}

module.exports = { autocompletePlaces };
