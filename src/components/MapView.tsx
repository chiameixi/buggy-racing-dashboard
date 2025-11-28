import { MapContainer, TileLayer, Polyline } from 'react-leaflet';
import type { Lap } from '../types';
import { getSpeedRange, getSpeedColor } from '../utils/speedColor';
import { SpeedLegend } from './SpeedLegend';
import 'leaflet/dist/leaflet.css';
import './MapView.css';

type MapViewProps = {
  laps: Lap[];
  showHeatmap?: boolean;
};

export function MapView({ laps, showHeatmap }: MapViewProps) {
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
        </MapContainer>
        
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

