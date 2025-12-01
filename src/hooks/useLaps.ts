/**
 * Custom hook to parse data and manage laps from GPX files.
 * It handles loading, error states, and visibility toggling for laps.
 *  
 * @return An object containing laps, visible laps, loading state, error state,
 *         and functions to toggle visibility of laps and drivers. 
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import type { Lap } from '../types';
import { parseGpxFile } from '../utils/gpxParser';
import type { DrawingLayerHandle } from '../components/DrawingLayer';

type GpxFileConfig = {
  name: string;
  file: string;
  color: string;
  driver: string;
  date: string;
};

export function useLaps() {
  const [laps, setLaps] = useState<Lap[]>([]);
  const [visibleLapIds, setVisibleLapIds] = useState<Set<string>>(new Set()); //set for faster lookup
  const [showHeatmap, setShowHeatmap] = useState(false);  // toggle heatmap

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0); // in seconds
  const [playbackSpeed, setPlaybackSpeed] = useState(1); // 1x speed

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isDrawMode, setIsDrawMode] = useState(false);
  const [activeTool, setActiveTool] = useState<'pencil' | 'erase' | 'marker' | null>(null);
  const [selectedMarkerType, setSelectedMarkerType] = useState<'tree' | 'flag' | 'stop' |  'generic'>('generic');

  const drawingLayerRef = useRef<DrawingLayerHandle>(null);

  // for now, hardcode GPX file configs here. future improvement: could be dynamic or from server.
  useEffect(() => {
    const gpxFiles: GpxFileConfig[] = [
      { 
        name: 'Roll 3', 
        file: '2025_09_21_Meixi_Inviscid_roll_3.gpx', 
        color: '#3b82f6',
        driver: 'Meixi',
        date: '2025-09-21'
      },
      { 
        name: 'Roll 4', 
        file: '2025_09_21_Meixi_Inviscid_roll_4.gpx', 
        color: '#60a5fa',
        driver: 'Meixi',
        date: '2025-09-21'
      },
    ];

    const loadPromises = gpxFiles.map(({ name, file, color, driver, date }) => {
      return fetch(`/${file}`)
        .then(res => {
          if (!res.ok) {
            throw new Error(`Failed to load ${file}`);
          }
          return res.text();
        })
        .then(data => ({
          id: file,
          name,
          driver,
          date,
          points: parseGpxFile(data),
          color
        }));
    });

  Promise.all(loadPromises)
  .then(loadedLaps => {
    // Log the loaded data
    console.log('=== LOADED LAPS ===');
    loadedLaps.forEach(lap => {
      console.log(`\n${lap.name} (${lap.driver}):`);
      console.log(`- Total points: ${lap.points.length}`);
      console.log(`- First point:`, lap.points[0]);
      console.log(`- Sample speeds (first 10 points):`);
      lap.points.slice(0, 10).forEach((pt, i) => {
        console.log(`  Point ${i}: ${pt.speed?.toFixed(2)} m/s (${(pt.speed || 0) * 2.237}mph)`);
      });
      
      // Stats
      const speeds = lap.points.map(p => p.speed).filter(s => s !== undefined) as number[];
      const minSpeed = Math.min(...speeds);
      const maxSpeed = Math.max(...speeds);
      const avgSpeed = speeds.reduce((a, b) => a + b, 0) / speeds.length;
      
      console.log(`- Speed range: ${minSpeed.toFixed(2)} - ${maxSpeed.toFixed(2)} m/s`);
      console.log(`- Average speed: ${avgSpeed.toFixed(2)} m/s (${(avgSpeed * 2.237).toFixed(1)} mph)`);
    });
    
    setLaps(loadedLaps);
    setVisibleLapIds(new Set(loadedLaps.map(lap => lap.id)));
    setLoading(false);
  })
  .catch(err => {
    setError(err.message);
    setLoading(false);
  });
  }, []);

  // Toggle visibility of a single lap
  const toggleLapVisibility = (lapId: string) => {
    setVisibleLapIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(lapId)) {
        newSet.delete(lapId);
      } else {
        newSet.add(lapId);
      }
      return newSet;
    });
  };

  // Toggle visibility of all laps for a given driver
  const toggleDriverVisibility = (driver: string) => {
    // get all lap IDs + current visibility state for the driver
    const driverLapIds = laps.filter(lap => lap.driver === driver).map(lap => lap.id);
    const allVisible = driverLapIds.every(id => visibleLapIds.has(id));
    
    // update visibilities to show/hide all laps for the driver
    setVisibleLapIds(prev => {
      const newSet = new Set(prev);
      if (allVisible) {
        driverLapIds.forEach(id => newSet.delete(id));
      } else {
        driverLapIds.forEach(id => newSet.add(id));
      }
      return newSet;
    });
  };

  // toggle heatmap display
  const toggleHeatmap = () => { 
    setShowHeatmap(prev => !prev);
  };

  // TogglePlayback function
  const togglePlayback = () => {
    setIsPlaying(prev => !prev);
  }

  // set progress to update the current time to a percentage of total time
  const setProgress = (percentage: number) => {
    setCurrentTime(percentage);
  }

  const resetPlayback = () => {
    setIsPlaying(false);
    setCurrentTime(0);
  }


  const setPencilTool = useCallback(() => {
    console.log('setPencilTool called, current activeTool:', activeTool);
    setActiveTool(prev => prev === 'pencil' ? null : 'pencil');
    if (activeTool !== 'pencil') {
      setIsDrawMode(true);
    } else {
      setIsDrawMode(false);
    }
  }, [activeTool]);

  const setEraseTool = useCallback(() => {
    console.log('setEraseTool called, current activeTool:', activeTool);
    setActiveTool(prev => prev === 'erase' ? null : 'erase');
    if (activeTool !== 'erase') {
      setIsDrawMode(true);
    } else {
      setIsDrawMode(false);
    }
  }, [activeTool]);

  const setMarkerTool = useCallback(() => {
    console.log('setMarkerTool called, current activeTool:', activeTool);
    const newTool = activeTool === 'marker' ? null : 'marker';
    setActiveTool(newTool);
    setIsDrawMode(newTool !== null);
  }, [activeTool]);

  // drawing layer interactions
  const undoLastDrawing = useCallback(() => {
    drawingLayerRef.current?.undo();
  }, []);

  const redoLastDrawing = useCallback(() => {
    console.log('redoLastDrawing called');
    drawingLayerRef.current?.redo();
  }, []);

  const clearAllDrawings = useCallback(() => {
    drawingLayerRef.current?.clearAll();
  }, []);

  // animation loop to update current time based on playback speed
  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      setCurrentTime(prevTime => {
        const newTime = prevTime + (0.5 * playbackSpeed); // update every 50ms
        if (newTime >= 100) { //max percentage
          setIsPlaying(false);
          return 100;
        } 
        else {
          return newTime;
        }
      });
    }, 50); // update every 50ms

    return () => clearInterval(interval);
  }, [isPlaying, playbackSpeed]);


  // Get currently visible laps
  const visibleLaps = laps.filter(lap => visibleLapIds.has(lap.id));

  return {
    laps,
    visibleLaps,
    visibleLapIds,
    showHeatmap,
    isPlaying,
    currentTime,
    playbackSpeed,
    isDrawMode,
    activeTool,
    setPencilTool,
    setEraseTool,
    setMarkerTool,
    selectedMarkerType,
    setSelectedMarkerType,
    drawingLayerRef,
    // drawnPaths,
    // toggleDrawMode,
    // addDrawnPath,
    clearAllDrawings,
    undoLastDrawing,
    redoLastDrawing,
    togglePlayback,
    setProgress,
    resetPlayback,
    loading,
    error,
    toggleLapVisibility,
    toggleDriverVisibility, 
    toggleHeatmap
  };
}
