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
import { PlaybackControls } from './PlaybackControls';
import './ControlPanel.css';

type ControlPanelProps = {
  laps: Lap[];
  visibleLapIds: Set<string>;
  showHeatmap: boolean;
  isPlaying: boolean;
  currentTime: number;
  playbackSpeed: number;
  onToggleLap: (lapId: string) => void;
  onToggleDriver: (driver: string) => void;
  onToggleHeatmap: () => void;
  onTogglePlay: () => void;
  onSeek: (time: number) => void;
  onReset: () => void;
};

export function ControlPanel({ 
  laps, 
  visibleLapIds, 
  showHeatmap,
  isPlaying,
  currentTime,
  onToggleLap, 
  onToggleDriver,
  onToggleHeatmap,
  onTogglePlay,
  onSeek,
  onReset
}: ControlPanelProps) {
  const lapsByDriver = groupByDriver(laps);

  return (
    <div className="control-panel">
      <div className="control-section">
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
      </div>

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

      <div className = "control-section">
        <h2>Playback Controls</h2>
        <PlaybackControls
          isPlaying={isPlaying}
          currentTime={currentTime}
          onTogglePlay={onTogglePlay}
          onSeek={onSeek}
          onReset={onReset}
        />
      </div>
    </div>
  );
}