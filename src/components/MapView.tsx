/**
 * MapView.tsx
 * 
 * Leaflet map view displaying GPS laps with options for heatmap and drawing.
 * Shows playback marker and telemetry overlay.
 * 
 */
import { MapContainer, TileLayer, Polyline, CircleMarker, useMap } from 'react-leaflet';
import { useEffect } from 'react';
import type { Lap, GpxPoint } from '../types';
import { getSpeedRange, getSpeedColor } from '../utils/speedColor';
import { SpeedLegend } from './SpeedLegend';
import { TelemetryDisplay } from './TelemetryDisplay';
import { DrawingLayer, type DrawingLayerHandle } from './DrawingLayer';
import 'leaflet/dist/leaflet.css';
import './MapView.css';

interface MapViewProps {
  laps: Lap[];
  visibleLapIds: Set<string>;
  showHeatmap?: boolean;
  currentTime: number; // percentage of playback progress 0-100
  isDrawMode: boolean;
  activeTool: 'pencil' | 'erase' | 'marker' | null;
  selectedMarkerType: 'tree' | 'flag' | 'stop' |'generic';
  drawingLayerRef: React.RefObject<DrawingLayerHandle| null>;
  sidebarOpen?: boolean;
  // drawnPaths: Array<{ id: string; points: [number, number][] }>; // array of drawn paths
  // onPathComplete: (points: [number, number][]) => void;
};


// get point at specific time percentage in lap
// take in lap + certain time percentage, return the GpxPoint at that time
function getPointAtTime(lap: Lap, timePercentage: number): GpxPoint | null {
  // If lap has no points, return null
  // Calculate the index based on percentage
  // Return the point at that index
  if (lap.points.length === 0) return null //check
  const index = Math.floor((timePercentage / 100) * (lap.points.length - 1));
  console.log(`Getting point at ${timePercentage}% for lap ${lap.id}, index: ${index}`);
  return lap.points[index];
}

// Component that handles map resizing when container changes
// take in sidebarOpen to trigger resize on change
function MapResizeHandler({sidebarOpen}: {sidebarOpen?: boolean}) {
  const map = useMap();

  useEffect(() => {
    // Small delay to ensure DOM has settled if not stuff might carsh
    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 80);

    // handle window resize events
    const handleResize = () => {
      map.invalidateSize();
    };

    window.addEventListener('resize', handleResize);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', handleResize);
    };
  }, [map,sidebarOpen]);

  return null;
}

export function MapView({ 
  laps, 
  visibleLapIds, 
  showHeatmap, 
  currentTime, 
  isDrawMode, 
  activeTool,
  drawingLayerRef,
  sidebarOpen,
  selectedMarkerType
  // drawnPaths, 
  // onPathComplete 
}: MapViewProps) {
  if (laps.length === 0) {
    return <div className="map-loading">No data to display</div>;
  }

  // Get center from first lap's first point - edit later to be center of the lap
  const firstLap = laps[0];
  const center = [firstLap.points[0].lat, firstLap.points[0].lon] as [number, number];

  const {min, max} = getSpeedRange(laps);

  console.log(`Speed range across all laps: min=${min?.toFixed(2)} m/s, max=${max?.toFixed(2)} m/s`);

    return (
      <div style={{ position: 'relative', height: '100%', width: '100%' }}>
        <MapContainer center={center} zoom={16} className="map-container">
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          />
          <MapResizeHandler sidebarOpen = {sidebarOpen}/>
          
          {laps.map(lap => {
            if (showHeatmap) {
              return lap.points.slice(1).map((point, index) => {
                const prevPoint = lap.points[index];
                const segment = [
                  [prevPoint.lat, prevPoint.lon],
                  [point.lat, point.lon]
                ] as [number, number][];
                
                const color = getSpeedColor(point.speed, min, max);
                
                return (
                  <Polyline
                    key={`${lap.id}-${index}`}
                    positions={segment}
                    color={color}
                    weight={4}
                    opacity={0.8}
                  />
                );
              });
            } else {
              const positions = lap.points.map(p => [p.lat, p.lon] as [number, number]);
              
              return (
                <Polyline 
                  key={lap.id}
                  positions={positions} 
                  color={lap.color} 
                  weight={3}
                />
              );
            }
          })}


          {/* ]Drawing layer */}
          <DrawingLayer 
            ref={drawingLayerRef}
            activeTool={activeTool}
            selectedMarkerType={selectedMarkerType}
            isDrawMode={isDrawMode}
            // drawnPaths={drawnPaths}
            // onPathComplete={onPathComplete}
          />

          {/* Playback marker */}
          {
            laps.map(lap => {
              const currPoint = getPointAtTime(lap, currentTime);
              if (!currPoint) return null;
              
              return (<CircleMarker
                key={`marker-${lap.id}`}
                center={[currPoint.lat, currPoint.lon]}
                radius={6}
                color="white"
                weight={2}
                fillColor={lap.color}
                fillOpacity={1}
              />);
            })
          }
        </MapContainer>

        <TelemetryDisplay visibleLaps={laps} visibleLapIds={visibleLapIds} currentTime={currentTime} />
        
        {showHeatmap && <SpeedLegend minSpeed={min} maxSpeed={max} />}
      </div>
    );
  }

