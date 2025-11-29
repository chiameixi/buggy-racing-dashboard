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
import { useState } from 'react';
import { DriverSection } from './DriverSection';
import { groupByDriver } from '../utils/groupByDriver';
import { PlaybackControls } from './PlaybackControls';
import './ControlPanel.css';

// Icon imports
const imgCheckedCheckbox = "../../public/icons/Checked Checkbox.png";
const imgPlay = "../../public/icons/Play.png";
const imgReset = "../../public/icons/Reset.png";
const imgPencil = "../../public/icons/Pencil.png";
const imgErase = "../../public/icons/Erase.png";
const imgTrash = "../../public/icons/Trash.png";
const imgUndo = "../../public/icons/Undo.png";

interface ControlPanelProps {
  laps: Lap[];
  visibleLapIds: Set<string>;
  showHeatmap: boolean;
  isPlaying: boolean;
  currentTime: number;
  playbackSpeed: number;
  isDrawMode: boolean;
  drawnPathsCount: number;
  onToggleLap: (lapId: string) => void;
  onToggleDriver: (driver: string) => void;
  onToggleHeatmap: () => void;
  onTogglePlay: () => void;
  onSeek: (time: number) => void;
  onReset: () => void;
  onToggleDrawMode: () => void;
  onClearDrawings: () => void;
  onUndoDrawing: () => void;
};

export function ControlPanel({ 
  laps, 
  visibleLapIds, 
  showHeatmap,
  isPlaying,
  currentTime,
  isDrawMode,
  onToggleLap, 
  onToggleDriver,
  onToggleHeatmap,
  onTogglePlay,
  onSeek,
  onReset,
  onToggleDrawMode,
  onClearDrawings,
  onUndoDrawing
}: ControlPanelProps) {
  const lapsByDriver = groupByDriver(laps);
  const [hoveredTool, setHoveredTool] = useState<string | null>(null);

  return (
    <div className="control-panel">
      {/* Data Section */}
      <div className="control-section data-section">
        <h2 className="section-title">Data</h2>
        <div className="data-content">
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
      </div>

      {/* Visualisation Section */}
      <div className="control-section visualization-section">
        <h2 className="section-title">Visualisation</h2>
        <div className="visualization-content">
          <button 
            className={`heatmap-toggle ${showHeatmap ? 'active' : ''}`}
            onClick={onToggleHeatmap}
            title="Toggle speed heatmap"
          >
            <div className={`toggle-slider ${showHeatmap ? 'on' : 'off'}`}></div>
          </button>
          <span>Speed Heatmap</span>
        </div>
      </div>

      {/* Playback Controls Section */}
      <div className="control-section playback-section">
        <h2 className="section-title">Playback Controls</h2>
        <div className="playback-content">
          <div className="playback-buttons">
            <button 
              className="playback-btn reset-btn"
              onClick={onReset}
              title="Reset playback"
            >
              <img src={imgReset} alt="Reset" className="btn-icon" />
              <span>reset</span>
            </button>
            <button 
              className="playback-btn play-btn"
              onClick={onTogglePlay}
              title={isPlaying ? "Pause" : "Play"}
            >
              <img src={imgPlay} alt={isPlaying ? "Pause" : "Play"} className="btn-icon" />
              <span>{isPlaying ? 'pause' : 'play'}</span>
            </button>
          </div>
          <PlaybackControls
            isPlaying={isPlaying}
            currentTime={currentTime}
            onTogglePlay={onTogglePlay}
            onSeek={onSeek}
            onReset={onReset}
          />
        </div>
      </div>

      {/* Annotations Section */}
      <div className="control-section annotations-section">
        <h2 className="section-title">Annotations</h2>
        <div className="annotations-content">
          <button 
            className={`tool-btn pencil-btn ${isDrawMode || hoveredTool === 'pencil' ? 'active' : ''}`}
            onClick={onToggleDrawMode}
            onMouseEnter={() => setHoveredTool('pencil')}
            onMouseLeave={() => setHoveredTool(null)}
            title="Draw on map"
          >
            <img src={imgPencil} alt="Pencil" />
          </button>
          <button 
            className={`tool-btn erase-btn ${hoveredTool === 'erase' ? 'active' : ''}`}
            onMouseEnter={() => setHoveredTool('erase')}
            onMouseLeave={() => setHoveredTool(null)}
            title="Erase drawings"
          >
            <img src={imgErase} alt="Erase" />
          </button>
          <button 
            className={`tool-btn trash-btn ${hoveredTool === 'trash' ? 'active' : ''}`}
            onClick={onClearDrawings}
            onMouseEnter={() => setHoveredTool('trash')}
            onMouseLeave={() => setHoveredTool(null)}
            title="Clear all drawings"
          >
            <img src={imgTrash} alt="Trash" />
          </button>
          <button 
            className={`tool-btn undo-btn ${hoveredTool === 'undo' ? 'active' : ''}`}
            onClick={onUndoDrawing}
            onMouseEnter={() => setHoveredTool('undo')}
            onMouseLeave={() => setHoveredTool(null)}
            title="Undo last drawing"
          >
            <img src={imgUndo} alt="Undo" />
          </button>
          <button 
            className={`tool-btn redo-btn ${hoveredTool === 'redo' ? 'active' : ''}`}
            onMouseEnter={() => setHoveredTool('redo')}
            onMouseLeave={() => setHoveredTool(null)}
            title="Redo last undo"
          >
            <img src={imgUndo} alt="Redo" style={{ transform: 'scaleX(-1)' }} />
          </button>
        </div>
      </div>
    </div>
  );
}