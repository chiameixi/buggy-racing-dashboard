/**
 * TelemetryDisplay.tsx
 * 
 * small thing to display telemetry data (speed, elevation, time, position) for the current point.
 * Uses currentPoint prop to show data.
 */
import type { GpxPoint } from '../types';
import './TelemetryDisplay.css';

type TelemetryDisplayProps = {
  currentPoint: GpxPoint | null;
};

export function TelemetryDisplay({ currentPoint }: TelemetryDisplayProps) {
  if (!currentPoint) {
    return (
      <div className="telemetry-display">
        <div className="telemetry-title">Telemetry</div>
        <div className="telemetry-empty">No data</div>
      </div>
    );
  }

  const speedMph = currentPoint.speed ? (currentPoint.speed * 2.237).toFixed(1) : 'N/A';
  const speedMs = currentPoint.speed ? currentPoint.speed.toFixed(2) : 'N/A';
  const elevation = currentPoint.elevation ? currentPoint.elevation.toFixed(1) : 'N/A';
  
  // Format timestamp
  const timeStr = currentPoint.time.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });

  return (
    <div className="telemetry-display">
      <div className="telemetry-title">Telemetry</div>
      
      <div className="telemetry-row">
        <span className="telemetry-label">Speed:</span>
        <span className="telemetry-value">{speedMph} mph</span>
      </div>
      
      <div className="telemetry-row secondary">
        <span className="telemetry-label"></span>
        <span className="telemetry-value">{speedMs} m/s</span>
      </div>
      
      <div className="telemetry-row">
        <span className="telemetry-label">Elevation:</span>
        <span className="telemetry-value">{elevation} m</span>
      </div>
      
      <div className="telemetry-row">
        <span className="telemetry-label">Time:</span>
        <span className="telemetry-value">{timeStr}</span>
      </div>
      
      <div className="telemetry-row">
        <span className="telemetry-label">Position:</span>
        <span className="telemetry-value coords">
          {currentPoint.lat.toFixed(5)}, {currentPoint.lon.toFixed(5)}
        </span>
      </div>
    </div>
  );
}
