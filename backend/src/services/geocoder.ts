import axios from 'axios';
import { Coordinates } from '../types';
import { getCachedGeocode, cacheGeocode } from '../db/database';
import { CAMPUS_CENTER, DELAYS } from '../config/sources';

const NOMINATIM_URL = 'https://nominatim.openstreetmap.org/search';

// User-Agent is required by Nominatim
const HEADERS = {
  'User-Agent': 'UW-Madison-Events-Map/1.0 (Educational Project)'
};

// Sleep utility for rate limiting
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Create a location key for caching
function createLocationKey(locationName: string, locationAddress?: string): string {
  const parts = [locationName];
  if (locationAddress) {
    parts.push(locationAddress);
  }
  parts.push('Madison', 'WI', 'USA');
  return parts.join(', ').toLowerCase();
}

// Geocode a location using Nominatim API
export async function geocodeLocation(
  locationName: string | null,
  locationAddress?: string | null
): Promise<Coordinates | null> {
  // If no location info provided, return null
  if (!locationName) {
    return null;
  }

  const locationKey = createLocationKey(locationName, locationAddress || undefined);

  // Check cache first
  const cached = getCachedGeocode(locationKey);
  if (cached) {
    console.log(`📍 Using cached coordinates for "${locationName}"`);
    return cached;
  }

  // Rate limit: wait before making request
  await sleep(DELAYS.BETWEEN_REQUESTS);

  try {
    console.log(`🗺️  Geocoding "${locationName}"...`);

    const query = `${locationName}, ${locationAddress || ''}, Madison, WI, USA`;
    const response = await axios.get(NOMINATIM_URL, {
      params: {
        q: query,
        format: 'json',
        limit: 1,
        bounded: 1,
        viewbox: '-89.5,43.0,-89.3,43.1' // Madison area bounding box
      },
      headers: HEADERS,
      timeout: 10000
    });

    if (response.data && response.data.length > 0) {
      const result = response.data[0];
      const coords: Coordinates = {
        lat: parseFloat(result.lat),
        lng: parseFloat(result.lon)
      };

      console.log(`✅ Geocoded "${locationName}" to (${coords.lat}, ${coords.lng})`);

      // Cache the result
      cacheGeocode(locationKey, coords);

      return coords;
    } else {
      console.log(`⚠️  No geocoding results for "${locationName}"`);
      return null;
    }

  } catch (error: any) {
    console.error(`❌ Geocoding error for "${locationName}":`, error.message);
    return null;
  }
}

// Geocode multiple locations with rate limiting
export async function geocodeLocations(
  locations: Array<{ name: string | null; address: string | null }>
): Promise<Array<Coordinates | null>> {
  const results: Array<Coordinates | null> = [];

  for (const location of locations) {
    const coords = await geocodeLocation(location.name, location.address);
    results.push(coords);
  }

  return results;
}

// Get coordinates or fallback to campus center
export function getCoordsOrFallback(coords: Coordinates | null): Coordinates {
  return coords || CAMPUS_CENTER;
}
