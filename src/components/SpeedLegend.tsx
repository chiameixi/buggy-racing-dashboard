import { formatSpeed } from '../utils/speedColor';
import './SpeedLegend.css';

interface SpeedLegendProps {
  minSpeed: number;
  maxSpeed: number;
};

export function SpeedLegend({ minSpeed, maxSpeed }: SpeedLegendProps) {
  return (
    <div className="speed-legend">
      <div className="legend-title">Speed</div>
      <div className="legend-gradient">
        <div className="gradient-bar" />
        <div className="legend-labels">
          <span>{formatSpeed(minSpeed)}</span>
          <span>{formatSpeed(maxSpeed)}</span>
        </div>
      </div>
    </div>
  );
}