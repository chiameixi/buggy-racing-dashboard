/**
 * @brief ControlPanel component
 * 
 * This component serves as the control panel for the Buggy Racing Dashboard.
 * It organizes laps by driver and renders a DriverSection for each driver,
 * allowing users to toggle the visibility of individual laps or all laps for a driver.
 * 
 * @param laps - Array of Lap objects
 * @param visibleLapIds - Set of currently visible lap IDs
 * @param onToggleLap - Callback function to toggle visibility of a single lap
 * @param onToggleDriver - Callback function to toggle visibility of all laps for a driver
 * 
 * @returns JSX.Element representing the control panel
 */

import type { Lap } from '../types';
import { DriverSection } from './DriverSection';
import { groupByDriver } from '../utils/groupByDriver';
import './ControlPanel.css';

type ControlPanelProps = {
  laps: Lap[];
  visibleLapIds: Set<string>;
  showHeatmap: boolean;
  onToggleLap: (lapId: string) => void;
  onToggleDriver: (driver: string) => void;
  onToggleHeatmap: () => void;
};

export function ControlPanel({ 
  laps, 
  visibleLapIds, 
  showHeatmap,
  onToggleLap, 
  onToggleDriver,
  onToggleHeatmap
}: ControlPanelProps) {
  const lapsByDriver = groupByDriver(laps);

  return (
    <div className="control-panel">
      <h2>Drivers</h2>
      
      {Object.entries(lapsByDriver).map(([driver, driverLaps]) => (
        <DriverSection
          key={driver}
          driver={driver}
          laps={driverLaps}
          visibleLapIds={visibleLapIds}
          onToggleLap={onToggleLap}
          onToggleDriver={onToggleDriver}
        />
      ))}

      <div className="control-section">
        <h2>Visualization</h2>
        <label className="toggle-option">
          <input
            type="checkbox"
            checked={showHeatmap}
            onChange={onToggleHeatmap}
          />
          <span> Speed Heatmap</span>
        </label>
      </div>


    </div>
  );
}