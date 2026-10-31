import { campusGeometry } from './campusGeometry';

export type Coordinate = { latitude: number; longitude: number };
export type CampusArea = keyof typeof campusGeometry;

// OSM footprint centers, cross-checked with SJSU Parking Services. IDs remain stable
// for saved garages and demo reservations. See docs/map-sources.md for provenance.
export const parkingLocations: Record<string, Coordinate & { area: CampusArea }> = {
  north: { longitude: -121.8810201, latitude: 37.3391884, area: 'main' },
  south: { longitude: -121.8807383, latitude: 37.3331340, area: 'main' },
  west: { longitude: -121.8831208, latitude: 37.3324582, area: 'main' },
  'south-campus': { longitude: -121.8652857, latitude: 37.3207650, area: 'south' },
};
export const studentUnion: Coordinate = { longitude: -121.8803890, latitude: 37.3366208 };

// Rotate local east/north meters 30° clockwise to match the campus street grid.
// Paths and pin overlays use this SAME projection and aspect ratio, without clipping
// or clamping a pin into the map when its coordinates are outside this campus.
export function projectCoordinate(coordinate: Coordinate, area: CampusArea) {
  const { center, width, height } = campusGeometry[area];
  const radians = Math.PI / 180;
  const east = (coordinate.longitude - center[0]) * 111319.49 * Math.cos(center[1] * radians);
  const north = (coordinate.latitude - center[1]) * 111319.49;
  const angle = 30 * radians;
  return {
    x: (east * Math.cos(angle) + north * Math.sin(angle) + width / 2) / width,
    y: (east * Math.sin(angle) - north * Math.cos(angle) + height / 2) / height,
  };
}

export function areaForCoordinate(coordinate: Coordinate): CampusArea | null {
  for (const area of ['main', 'south'] as const) {
    const { x, y } = projectCoordinate(coordinate, area);
    if (x >= 0 && x <= 1 && y >= 0 && y <= 1) return area;
  }
  return null;
}

export function estimatedWalkMinutes(from: Coordinate, to: Coordinate = studentUnion) {
  const rad = Math.PI / 180;
  const a = Math.sin((to.latitude - from.latitude) * rad / 2) ** 2
    + Math.cos(from.latitude * rad) * Math.cos(to.latitude * rad)
    * Math.sin((to.longitude - from.longitude) * rad / 2) ** 2;
  const meters = 6371000 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  // Rough detour allowance and 75 m/min walking speed; not a routed ETA.
  return Math.max(1, Math.round(meters * 1.25 / 75));
}
