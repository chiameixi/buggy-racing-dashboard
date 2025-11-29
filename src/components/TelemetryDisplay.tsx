/**
 * TelemetryDisplay.tsx
 * 
 * Displays real-time telemetry data (speed, elevation, time) for the current playback point.
 * Shows data from the first visible lap, updating as playback progresses.
 */
import type { Lap } from '../types';
import './TelemetryDisplay.css';

interface TelemetryDisplayProps {
  visibleLaps: Lap[];
  visibleLapIds: Set<string>;
  currentTime: number; // percentage 0-100
}

export function TelemetryDisplay({ visibleLaps, visibleLapIds, currentTime }: TelemetryDisplayProps) {
  if (visibleLaps.length === 0) {
    return (
      <div className="telemetry-display">
        <div className="telemetry-empty">No visible laps</div>
      </div>
    );
  }

  const firstLap = visibleLaps[0];
  
  // Check for consistency between visibleLapIds and rendered laps
  if (!visibleLapIds.has(firstLap.id)) {
    console.warn(`Discrepancy: Lap ${firstLap.id} is rendered but not in visibleLapIds`);
  }

  // Get the current point based on currentTime percentage
  const pointIndex = Math.floor((currentTime / 100) * firstLap.points.length);
  const currentPoint = firstLap.points[Math.min(pointIndex, firstLap.points.length - 1)];

  if (!currentPoint) {
    return (
      <div className="telemetry-display">
        <div className="telemetry-empty">No data</div>
      </div>
    );
  }

  const speedMph = currentPoint.speed ? (currentPoint.speed * 2.237).toFixed(1) : 'N/A';
  const elevation = currentPoint.elevation ? currentPoint.elevation.toFixed(1) : 'N/A';
  
  // Calculate max speed in the lap
  const maxSpeed = firstLap.points.reduce((max, point) => {
    return point.speed ? Math.max(max, point.speed) : max;
  }, 0);
  const maxSpeedMph = (maxSpeed * 2.237).toFixed(1);
  
  // Format timestamp as HH:MM:SS AM/PM
  const timeStr = currentPoint.time.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });

  return (
    <div className="telemetry-display">
      <div className="telemetry-heading">
        <span className="lap-name">{firstLap.name}</span>
        <span className="lap-date">{firstLap.date}</span>
      </div>
      <div className="telemetry-divider"></div>
      
      <div className="telemetry-row">
        <span className="telemetry-label">Speed</span>
        <span className="telemetry-value">{speedMph} mph</span>
      </div>
      
      <div className="telemetry-row">
        <span className="telemetry-label">Max Speed</span>
        <span className="telemetry-value">{maxSpeedMph} mph</span>
      </div>
      
      <div className="telemetry-row">
        <span className="telemetry-label">Elevation</span>
        <span className="telemetry-value">{elevation} m</span>
      </div>
      
      <div className="telemetry-row">
        <span className="telemetry-label">Time</span>
        <span className="telemetry-value">{timeStr}</span>
      </div>
    </div>
  );
}
