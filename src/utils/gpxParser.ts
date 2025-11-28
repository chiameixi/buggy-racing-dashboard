/**
 * @brief GPX File Parser
 * Parses GPX file content and extracts track points (lat, lon, time, elevation, speed).
 * 
 * @param fileContent The content of the GPX file as a string.
 * @returns An array of GpxPoint objects representing the track points.
 * @throws Will throw an error if no tracks are found in the GPX file.  
 */
import GPXParser from 'gpxparser';
import type { GpxPoint } from '../types';

// use Haversine formula to calculate distance between two lat/lon points
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371e3; // earth radius in meters
  const φ1 = lat1 * Math.PI / 180;
  const φ2 = lat2 * Math.PI / 180;
  const Δφ = (lat2 - lat1) * Math.PI / 180;
  const Δλ = (lon2 - lon1) * Math.PI / 180;

  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // in meters
}

export function parseGpxFile(fileContent: string): GpxPoint[] {
  const gpx = new GPXParser();
  gpx.parse(fileContent);
  
  if (!gpx.tracks || gpx.tracks.length === 0) {
    throw new Error('No tracks found in GPX file');
  }
  
  const track = gpx.tracks[0];

  const points: GpxPoint[] = track.points.map((pt: any) => ({
    lat: pt.lat,
    lon: pt.lon,
    time: new Date(pt.time),
    elevation: pt.ele,
    speed: pt.speed || undefined //speed not present in current data
  }));

  // calculate speed if not provided
  for (let i = 1; i < points.length; i++) {
    if (points[i].speed === undefined) {
      const p1 = points[i-1];
      const p2 = points[i];

      const distance = calculateDistance(p1.lat, p1.lon, p2.lat, p2.lon); // in meters
      const timeDiff = (p2.time.getTime() - p1.time.getTime()) / 1000; // in seconds

      if (timeDiff > 0) {
        p2.speed = distance / timeDiff; // speed in m/s
      } 
      //else: error case: same timestamp, set speed to undefined to avoid div by zero

    }
  }

  // for the first point, set speed equal to the second point's speed if available
  if (points.length > 1 && points[1].speed !== undefined) {
    points[0].speed = points[1].speed;
  }
  
  return points;
}