/*
  Main application component for the Buggy Racing Dashboard.
  It integrates the MapView and ControlPanel components,
  manages lap data loading, visibility toggling, and error handling.  
*/

/* Imports */
import { useState } from 'react';
import { MapView } from './components/MapView';
import { ControlPanel } from './components/ControlPanel';
import { Header } from './components/Header';
import { useLaps } from './hooks/useLaps';
import './App.css';


function App() {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const {
    laps,
    visibleLaps,
    visibleLapIds,
    isPlaying,
    currentTime,
    isDrawMode, 
    activeTool,
    setPencilTool,
    setEraseTool,
    setMarkerTool,
    selectedMarkerType,
    setSelectedMarkerType,
    drawingLayerRef,
    // drawnPaths,
    playbackSpeed,
    togglePlayback,
    setProgress,
    resetPlayback,
    loading,
    error,
    toggleLapVisibility,
    toggleDriverVisibility,
    toggleHeatmap,
    showHeatmap,

    // toggleDrawMode,
    // addDrawnPath,
    redoLastDrawing,
    clearAllDrawings,
    undoLastDrawing
  } = useLaps();

  return (
    <div className="app-container">
      <Header onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
      
      <div className="app-main">
        {sidebarOpen && (
          <aside className="sidebar">
            <ControlPanel 
              laps={laps}
              visibleLapIds={visibleLapIds}
              showHeatmap={showHeatmap}
              isPlaying={isPlaying} 
              currentTime={currentTime}
              isDrawMode={isDrawMode}
              activeTool={activeTool}
              selectedMarkerType={selectedMarkerType}
              // drawnPathsCount={drawnPaths.length}
              onSetPencilTool={setPencilTool}
              onSetEraseTool={setEraseTool}
              playbackSpeed={playbackSpeed}
              onToggleHeatmap={toggleHeatmap}
              onToggleLap={toggleLapVisibility}
              onToggleDriver={toggleDriverVisibility}
              onTogglePlay={togglePlayback}
              onSetMarkerTool={setMarkerTool}
              onSetMarkerType={setSelectedMarkerType}
              onSeek ={setProgress}
              onReset={resetPlayback}
              // onToggleDrawMode={toggleDrawMode}
              onClearDrawings={clearAllDrawings}
              onUndoDrawing={undoLastDrawing}
              onRedoDrawing={redoLastDrawing}
            />
          </aside>
        )}
        
        <main className="map-section">
          {loading && <div className="status">Loading GPX data...</div>}
          {error && <div className="status error">Error: {error}</div>}
          {!loading && !error && 
          <MapView 
            laps={visibleLaps} 
            visibleLapIds={visibleLapIds}
            showHeatmap={showHeatmap} 
            currentTime={currentTime} 
            isDrawMode={isDrawMode}
            activeTool={activeTool}
            drawingLayerRef={drawingLayerRef}
            sidebarOpen={sidebarOpen}
            selectedMarkerType={selectedMarkerType}
            // onSetMarkerType={setSelectedMarkerType}
            // onSetMarkerTool={setMarkerTool}
            // drawnPaths={drawnPaths}
            // onPathComplete={addDrawnPath}
          />}
        </main>
      </div>
    </div>
  );
}

export default App;
