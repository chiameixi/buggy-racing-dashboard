import type { Lap } from '../types';
import './LapItem.css';

type LapItemProps = {
  lap: Lap;
  isVisible: boolean;
  onToggle: () => void;
};

export function LapItem({ lap, isVisible, onToggle }: LapItemProps) {
  return (
    <div 
      className={`lap-item ${!isVisible ? 'lap-hidden' : ''}`}
      onClick={onToggle}
    >
      <input
        type="checkbox"
        checked={isVisible}
        onChange={onToggle}
        onClick={(e) => e.stopPropagation()}
      />
      <div 
        className="lap-color" 
        style={{ backgroundColor: lap.color }}
      />
      <div className="lap-info">
        <span className="lap-name">{lap.name}</span>
        <span className="lap-date">{lap.date}</span>
      </div>
    </div>
  );
}
