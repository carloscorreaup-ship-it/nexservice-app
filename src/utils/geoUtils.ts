import { Coordinates } from '../types';
import { ALL_COLOMBIA_CITIES } from '../data/colombiaCities';

/**
 * Calculates distance between two coordinates in kilometers using Haversine formula
 */
export function calculateDistanceKm(coord1: Coordinates, coord2: Coordinates): number {
  const R = 6371; // Earth's radius in km
  const dLat = ((coord2.lat - coord1.lat) * Math.PI) / 180;
  const dLon = ((coord2.lng - coord1.lng) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((coord1.lat * Math.PI) / 180) *
      Math.cos((coord2.lat * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Number((R * c).toFixed(1));
}

/**
 * Formats distance in readable string (e.g. "450 m" or "2.3 km")
 */
export function formatDistance(distanceKm: number): string {
  if (distanceKm < 1) {
    return `${Math.round(distanceKm * 1000)} m`;
  }
  return `${distanceKm.toFixed(1)} km`;
}

/**
 * Known Colombia coordinates reference for major hubs
 */
export const DEFAULT_COLOMBIA_COORDS: Record<string, Coordinates> = {
  Pereira: { lat: 4.81333, lng: -75.69611 },
  Dosquebradas: { lat: 4.83889, lng: -75.68056 },
  'Santa Rosa de Cabal': { lat: 4.8694, lng: -75.6214 },
  Bogotá: { lat: 4.711, lng: -74.0721 },
  Medellín: { lat: 6.2442, lng: -75.5812 },
  Cali: { lat: 3.4516, lng: -76.532 },
  Barranquilla: { lat: 10.9685, lng: -74.7813 },
  Cartagena: { lat: 10.391, lng: -75.4794 },
  Bucaramanga: { lat: 7.1254, lng: -73.1198 },
  Manizales: { lat: 5.0689, lng: -75.5174 },
  Armenia: { lat: 4.5339, lng: -75.6811 },
  Cúcuta: { lat: 7.8939, lng: -72.5078 },
  Ibagué: { lat: 4.4389, lng: -75.2322 },
  'Santa Marta': { lat: 11.2408, lng: -74.199 },
  Villavicencio: { lat: 4.142, lng: -73.6266 },
  Pasto: { lat: 1.2136, lng: -77.2811 },
  Montería: { lat: 8.7479, lng: -75.8814 },
};

/**
 * Request device GPS coordinates asynchronously
 */
export function requestUserCoordinates(options?: PositionOptions): Promise<Coordinates | null> {
  return new Promise((resolve) => {
    if (!('geolocation' in navigator)) {
      resolve(null);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: Number(position.coords.latitude.toFixed(6)),
          lng: Number(position.coords.longitude.toFixed(6)),
        });
      },
      (error) => {
        console.warn('Geolocation permission not granted or error:', error.message);
        resolve(null);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000,
        ...options,
      }
    );
  });
}

/**
 * Finds the nearest Colombian city based on given coordinates
 */
export function findNearestCity(coords: Coordinates): { name: string; department: string; distanceKm: number } {
  let nearestCity = { name: 'Pereira', department: 'Risaralda', distanceKm: Infinity };

  // Check ALL_COLOMBIA_CITIES with coordinates
  for (const city of ALL_COLOMBIA_CITIES) {
    if (city.coordinates) {
      const dist = calculateDistanceKm(coords, city.coordinates);
      if (dist < nearestCity.distanceKm) {
        nearestCity = {
          name: city.name,
          department: city.department,
          distanceKm: dist,
        };
      }
    }
  }

  // Fallback check against DEFAULT_COLOMBIA_COORDS
  if (nearestCity.distanceKm === Infinity) {
    for (const [cityName, cityCoord] of Object.entries(DEFAULT_COLOMBIA_COORDS)) {
      const dist = calculateDistanceKm(coords, cityCoord);
      if (dist < nearestCity.distanceKm) {
        nearestCity = {
          name: cityName,
          department: 'Colombia',
          distanceKm: dist,
        };
      }
    }
  }

  return nearestCity;
}

/**
 * Reverse geocode coordinates to human-readable address with fast fallback
 */
export async function reverseGeocodeAddress(
  coords: Coordinates
): Promise<{ address: string; city: string; department: string } | null> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500);

    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${coords.lat}&lon=${coords.lng}&zoom=18&addressdetails=1`,
      {
        signal: controller.signal,
        headers: {
          'Accept-Language': 'es',
        },
      }
    );
    clearTimeout(timeoutId);

    if (response.ok) {
      const data = await response.json();
      const addr = data.address || {};
      const road = addr.road || addr.pedestrian || addr.street || addr.neighbourhood || '';
      const suburb = addr.suburb || addr.neighbourhood || addr.residential || '';
      const city = addr.city || addr.town || addr.municipality || addr.village || addr.county || '';
      const state = addr.state || '';

      const nearest = findNearestCity(coords);
      const finalCity = city || nearest.name;
      const finalDept = state || nearest.department;

      let formattedAddress = '';
      if (road) formattedAddress += road;
      if (suburb && suburb !== road) formattedAddress += formattedAddress ? `, Barrio ${suburb}` : suburb;
      if (!formattedAddress) formattedAddress = `${finalCity}, ${finalDept}`;

      return {
        address: formattedAddress,
        city: finalCity,
        department: finalDept,
      };
    }
  } catch (e) {
    // Network or timeout failure - fallback to nearest city
  }

  const nearest = findNearestCity(coords);
  return {
    address: `${nearest.name}, ${nearest.department}`,
    city: nearest.name,
    department: nearest.department,
  };
}

/**
 * Jitter coordinate slightly for realistic multi-marker display in map
 */
export function jitterCoordinate(coord: Coordinates, offsetIndex: number): Coordinates {
  const angles = [0, 45, 90, 135, 180, 225, 270, 315];
  const angle = (angles[offsetIndex % angles.length] * Math.PI) / 180;
  const radius = 0.005 + offsetIndex * 0.003; // ~500m to 1km radius jitter
  return {
    lat: coord.lat + Math.cos(angle) * radius,
    lng: coord.lng + Math.sin(angle) * radius * 1.2,
  };
}
