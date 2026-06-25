import { DangerZone, DangerZoneCategory, PlaceResult } from '../types/app';
import { config } from './config';

type PlaceSeed = PlaceResult;

const PLACE_SEEDS: PlaceSeed[] = [
  {
    id: 'sbux-17ave',
    label: 'Starbucks',
    address: '17 Ave SW, Calgary, AB',
    category: 'coffee',
    latitude: 51.0372,
    longitude: -114.0852,
    radiusMeters: 120
  },
  {
    id: 'sbux-kensington',
    label: 'Starbucks Kensington',
    address: '10 St NW, Calgary, AB',
    category: 'coffee',
    latitude: 51.051,
    longitude: -114.0858,
    radiusMeters: 120
  },
  {
    id: 'bigbox-demo',
    label: 'Big Box Demo Store',
    address: 'Macleod Trail, Calgary, AB',
    category: 'big_box',
    latitude: 50.9995,
    longitude: -114.0737,
    radiusMeters: 150
  },
  {
    id: 'fastfood-demo',
    label: 'Fast Food Demo',
    address: '4 St SW, Calgary, AB',
    category: 'fast_food',
    latitude: 51.0499,
    longitude: -114.0708,
    radiusMeters: 100
  }
];

export function searchPlaces(query: string, category?: DangerZoneCategory) {
  const q = query.trim().toLowerCase();
  return PLACE_SEEDS.filter((place) => {
    const categoryMatch = category ? place.category === category : true;
    const textMatch = q.length === 0 ? true : [place.label, place.address, place.category].some((value) => value.toLowerCase().includes(q));
    return categoryMatch && textMatch;
  });
}

export function placeToDangerZone(place: PlaceResult): DangerZone {
  return {
    id: place.id,
    category: place.category,
    label: place.label,
    address: place.address,
    latitude: place.latitude,
    longitude: place.longitude,
    radiusMeters: place.radiusMeters,
    enabled: true,
    identifier: `${place.label}-${place.id}`
  };
}

export async function searchPlacesViaBackend(query: string, category?: DangerZoneCategory): Promise<PlaceResult[]> {
  if (!config.apiBaseUrl) {
    return searchPlaces(query, category);
  }

  try {
    const response = await fetch(`${config.apiBaseUrl}/api/places/autocomplete`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, category })
    });

    if (!response.ok) {
      return searchPlaces(query, category);
    }

    const json = await response.json();
    const results = Array.isArray(json?.results) ? json.results : [];
    return results.length ? results : searchPlaces(query, category);
  } catch {
    return searchPlaces(query, category);
  }
}
