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

export function parseGpxFile(fileContent: string): GpxPoint[] {
  const gpx = new GPXParser();
  gpx.parse(fileContent);
  
  if (!gpx.tracks || gpx.tracks.length === 0) {
    throw new Error('No tracks found in GPX file');
  }
  
  const track = gpx.tracks[0];
  
  return track.points.map((pt: any) => ({
    lat: pt.lat,
    lon: pt.lon,
    time: new Date(pt.time),
    elevation: pt.ele,
    speed: pt.speed || undefined
  }));
}