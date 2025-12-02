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
// const imgCheckedCheckbox = "../../public/icons/Checked Checkbox.png";
const imgPlay = "../../icons/Play.png";
const imgReset = "../../icons/Reset.png";
const imgPencil = "../../icons/Pencil.png";
const imgErase = "../../icons/Erase.png";
const imgTrash = "../../icons/Trash.png";
const imgUndo = "../../icons/Undo.png";
const imgPause = "../../icons/Pause.png";
const imgMarker = "../../buggy.svg";
const imgTree = "../../icons/Tree.png";
const imgFlag = "../../icons/Flag.svg";
const imgStop = "../../icons/Stop.png";

interface ControlPanelProps {
  laps: Lap[];
  visibleLapIds: Set<string>;
  showHeatmap: boolean;
  isPlaying: boolean;
  currentTime: number;
  playbackSpeed: number;
  isDrawMode: boolean;
  activeTool: 'pencil' | 'erase' | 'marker' | null;
  selectedMarkerType: 'tree' | 'flag' | 'stop'| 'generic';
  // drawnPathsCount: number;
  onToggleLap: (lapId: string) => void;
  onToggleDriver: (driver: string) => void;
  onToggleHeatmap: () => void;
  onTogglePlay: () => void;
  onSeek: (time: number) => void;
  onReset: () => void;
  onSetPencilTool: () => void;
  onSetEraseTool: () => void;
  onSetMarkerTool: () => void;
  onSetMarkerType: (markerType: 'tree' | 'flag' | 'stop' | 'generic') => void;
  // onToggleDrawMode: () => void;
  onClearDrawings: () => void;
  onUndoDrawing: () => void;
  onRedoDrawing: () => void;
};

export function ControlPanel({ 
  laps, 
  visibleLapIds, 
  showHeatmap,
  isPlaying,
  currentTime,
  isDrawMode,
  activeTool,
  onToggleLap, 
  onToggleDriver,
  onToggleHeatmap,
  onTogglePlay,
  onSeek,
  onReset,
  // onToggleDrawMode,
  onSetPencilTool,
  onSetEraseTool,
  onSetMarkerTool,
  onSetMarkerType,
  selectedMarkerType,
  onClearDrawings,
  onUndoDrawing,
  onRedoDrawing
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
              <img 
                src={isPlaying? imgPause : imgPlay} 
                alt={isPlaying ? "Pause" : "Play"} 
                className="btn-icon" 
              />
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
      <div 
        className="control-section annotations-section"
        onMouseLeave={() => setHoveredTool(null)}
      >
        <h2 className="section-title">Annotations</h2>

        {/* Main tools */}
        <div className="annotations-content">
          <button 
            className={`tool-btn pencil-btn ${activeTool === 'pencil' ? 'active': ''} ${hoveredTool === 'pencil' ? 'hovered' : ''}`}
            onClick={onSetPencilTool}
            onMouseEnter={() => setHoveredTool('pencil')}
            onMouseLeave={() => setHoveredTool(null)}
            title="Draw on map"
          >
            <img src={imgPencil} alt="Pencil" />
          </button>
          <button 
            className={`tool-btn erase-btn ${activeTool === 'erase' ? 'active': ''} ${hoveredTool === 'erase' ? 'hovered' : ''}`}
            onClick={onSetEraseTool}
            onMouseEnter={() => setHoveredTool('erase')}
            onMouseLeave={() => setHoveredTool(null)}
            title="Erase drawings"
          >
            <img src={imgErase} alt="Erase" />
          </button>
          <button 
            className={`tool-btn trash-btn ${hoveredTool === 'trash' ? 'hovered' : ''}`}
            onClick={onClearDrawings}
            onMouseEnter={() => setHoveredTool('trash')}
            onMouseLeave={() => setHoveredTool(null)}
            title="Clear all drawings"
          >
            <img src={imgTrash} alt="Trash" />
          </button>
          <button 
            className={`tool-btn undo-btn ${hoveredTool === 'undo' ? 'hovered' : ''}`}
            onClick={onUndoDrawing}
            onMouseEnter={() => setHoveredTool('undo')}
            onMouseLeave={() => setHoveredTool(null)}
            title="Undo last drawing"
          >
            <img src={imgUndo} alt="Undo" />
          </button>
          <button 
            className={`tool-btn redo-btn ${hoveredTool === 'redo' ? 'hovered' : ''}`}
            onClick={onRedoDrawing}
            onMouseEnter={() => setHoveredTool('redo')}
            onMouseLeave={() => setHoveredTool(null)}
            title="Redo last undo"
          >
            <img src={imgUndo} alt="Redo" style={{ transform: 'scaleX(-1)' }} />
          </button>
        </div>

       {/* Marker tools row */}
        <div className="annotations-content marker-row">
          <button 
            className={`tool-btn ${activeTool === 'marker' && selectedMarkerType === 'tree' ? 'active' : ''} ${hoveredTool === 'tree' ? 'hovered' : ''}`}
            onClick={() => {
              onSetMarkerTool();
              onSetMarkerType('tree');
            }}
            onMouseEnter={() => setHoveredTool('tree')}
            onMouseLeave={() => setHoveredTool(null)}
            title="Add tree marker"
          >
            <img src={imgTree} alt="Tree" />
          </button>

          <button 
            className={`tool-btn ${activeTool === 'marker' && selectedMarkerType === 'flag' ? 'active' : ''} ${hoveredTool === 'flag' ? 'hovered' : ''}`}
            onClick={() => {
              onSetMarkerTool();
              onSetMarkerType('flag');
            }}
            onMouseEnter={() => setHoveredTool('flag')}
            onMouseLeave={() => setHoveredTool(null)}
            title="Add flag marker"
          >
            <img src={imgFlag} alt="Flag" />
          </button>

          <button 
            className={`tool-btn ${activeTool === 'marker' && selectedMarkerType === 'stop' ? 'active' : ''} ${hoveredTool === 'stop' ? 'hovered' : ''}`}
            onClick={() => {
              onSetMarkerTool();
              onSetMarkerType('stop');
            }}
            onMouseEnter={() => setHoveredTool('stop')}
            onMouseLeave={() => setHoveredTool(null)}
            title="Add stop marker"
          >
            <img src={imgStop} alt="Stop" />
          </button>
          <button 
            className={`tool-btn ${activeTool === 'marker' && selectedMarkerType === 'generic' ? 'active' : ''} ${hoveredTool === 'generic' ? 'hovered' : ''}`}
            onClick={() => {
              onSetMarkerTool();
              onSetMarkerType('generic');
            }}
            onMouseEnter={() => setHoveredTool('generic')}
            onMouseLeave={() => setHoveredTool(null)}
            title="Add marker"
          >
            <img src={imgMarker} alt="Marker" />
          </button>
      </div>
      </div>
    </div>
  );
}