/**
 * Custom hook to parse data and manage laps from GPX files.
 * It handles loading, error states, and visibility toggling for laps.
 *  
 * @return An object containing laps, visible laps, loading state, error state,
 *         and functions to toggle visibility of laps and drivers. 
 */

import { useState, useEffect } from 'react';
import type { Lap } from '../types';
import { parseGpxFile } from '../utils/gpxParser';

type GpxFileConfig = {
  name: string;
  file: string;
  color: string;
  driver: string;
  date: string;
};

export function useLaps() {
  const [laps, setLaps] = useState<Lap[]>([]);
  const [visibleLapIds, setVisibleLapIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
        setLaps(loadedLaps);
        // Make all laps visible by default
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

  // Get currently visible laps
  const visibleLaps = laps.filter(lap => visibleLapIds.has(lap.id));

  return {
    laps,
    visibleLaps,
    visibleLapIds,
    loading,
    error,
    toggleLapVisibility,
    toggleDriverVisibility
  };
}
