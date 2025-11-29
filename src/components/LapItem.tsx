import type { Lap } from '../types';
import './LapItem.css';

// Icon import
const imgCheckedCheckbox = "../../public/icons/checked-checkbox.png";

interface LapItemProps {
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
      <button
        className="lap-checkbox"
        onClick={(e) => {
          e.stopPropagation();
          onToggle();
        }}
        title={`Toggle visibility for ${lap.name}`}
      >
        {/* <img src={imgCheckedCheckbox} alt="checkbox" /> */}
      </button>
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
