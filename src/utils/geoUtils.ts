import { Coordinates } from '../types';

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
 * Jitter coordinate slightly for realistic multi-marker display in map
 */
export function jitterCoordinate(coord: Coordinates, offsetIndex: number): Coordinates {
  const angles = [0, 45, 90, 135, 180, 225, 270, 315];
  const angle = (angles[offsetIndex % angles.length] * Math.PI) / 180;
  const radius = 0.005 + (offsetIndex * 0.003); // ~500m to 1km radius jitter
  return {
    lat: coord.lat + Math.cos(angle) * radius,
    lng: coord.lng + Math.sin(angle) * radius * 1.2,
  };
}
