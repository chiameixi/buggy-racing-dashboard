import { MapContainer, TileLayer, Polyline } from 'react-leaflet';
import type { Lap } from '../types';
import 'leaflet/dist/leaflet.css';
import './MapView.css';

type MapViewProps = {
  laps: Lap[];
};

export function MapView({ laps }: MapViewProps) {
  if (laps.length === 0) {
    return <div className="map-loading">No data to display</div>;
  }

  // Get center from first lap's first point
  const firstLap = laps[0];
  const center = [firstLap.points[0].lat, firstLap.points[0].lon] as [number, number];

  return (
    <MapContainer center={center} zoom={16} className="map-container">
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
      />
      
      {laps.map(lap => {
        const positions = lap.points.map(p => [p.lat, p.lon] as [number, number]);
        return (
          <Polyline 
            key={lap.id}
            positions={positions} 
            color={lap.color} 
            weight={3}
          />
        );
      })}
    </MapContainer>
  );
}