import { MapContainer, TileLayer, Polyline, CircleMarker } from 'react-leaflet';
import type { Lap, GpxPoint } from '../types';
import { getSpeedRange, getSpeedColor } from '../utils/speedColor';
import { SpeedLegend } from './SpeedLegend';
import { TelemetryDisplay } from './TelemetryDisplay';
import 'leaflet/dist/leaflet.css';
import './MapView.css';

type MapViewProps = {
  laps: Lap[];
  showHeatmap?: boolean;
  currentTime: number; // percentage of playback progress 0-100
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

export function MapView({ laps, showHeatmap, currentTime }: MapViewProps) {
  if (laps.length === 0) {
    return <div className="map-loading">No data to display</div>;
  }

  // Get center from first lap's first point - edit later to be center of the lap
  const firstLap = laps[0];
  const center = [firstLap.points[0].lat, firstLap.points[0].lon] as [number, number];

  const {min, max} = getSpeedRange(laps);
  const currentPoint = getPointAtTime(firstLap, currentTime);

  console.log(`Speed range across all laps: min=${min?.toFixed(2)} m/s, max=${max?.toFixed(2)} m/s`);

    return (
      <div style={{ position: 'relative', height: '100%', width: '100%' }}>
        <MapContainer center={center} zoom={16} className="map-container">
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          />
          
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

        <TelemetryDisplay currentPoint={currentPoint} />
        
        {showHeatmap && <SpeedLegend minSpeed={min} maxSpeed={max} />}
      </div>
    );
  }
  // return (
  //   <MapContainer center={center} zoom={16} className="map-container">
  //     <TileLayer
  //       url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
  //       attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
  //     />
      
  //     {laps.map(lap => {
  //       const positions = lap.points.map(p => [p.lat, p.lon] as [number, number]);


  //       return (
  //         <Polyline 
  //           key={lap.id}
  //           positions={positions} 
  //           color={lap.color} 
  //           weight={3}
  //         />
  //       );
  //     })}
  //   </MapContainer>
  // );

