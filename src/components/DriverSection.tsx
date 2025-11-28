/**
 * @brief DriverSection component
 * 
 * This component represents a section in the control panel for a specific driver.
 * It displays the driver's name along with a list of their laps, each with a checkbox
 * to toggle visibility on the map. It also includes a master checkbox to toggle all
 * laps for that driver.
 * 
 * @param driver - Name of the driver
 * @param laps - Array of Lap objects associated with the driver
 * @param visibleLapIds - Set of currently visible lap IDs
 * @param onToggleLap - Callback function to toggle visibility of a single lap
 * @param onToggleDriver - Callback function to toggle visibility of all laps for the driver
 * 
 * @returns JSX.Element representing the driver section
 */

import type { Lap } from '../types';
import { LapItem } from './LapItem';
import './DriverSection.css';

type DriverSectionProps = {
  driver: string;
  laps: Lap[];
  visibleLapIds: Set<string>;
  onToggleLap: (lapId: string) => void;
  onToggleDriver: (driver: string) => void;
};

export function DriverSection({ 
  driver, 
  laps, 
  visibleLapIds, 
  onToggleLap, 
  onToggleDriver 
}: DriverSectionProps) {
  const allVisible = laps.every(lap => visibleLapIds.has(lap.id));
  const someVisible = laps.some(lap => visibleLapIds.has(lap.id));

  return (
    <div className="driver-section">
      <div className="driver-header">
        <input
          type="checkbox"
          checked={allVisible}
          ref={input => {
            if (input) input.indeterminate = someVisible && !allVisible;
          }}
          onChange={() => onToggleDriver(driver)}
        />
        <h3 className="driver-name">{driver}</h3>
      </div>
      
      <div className="lap-list">
        {laps.map(lap => (
          <LapItem
            key={lap.id}
            lap={lap}
            isVisible={visibleLapIds.has(lap.id)}
            onToggle={() => onToggleLap(lap.id)}
          />
        ))}
      </div>
    </div>
  );
}
