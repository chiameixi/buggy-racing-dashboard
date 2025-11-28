/**
 * Groups laps by driver.
 * @param laps Array of Lap objects to be grouped.
 * @returns An object where keys are driver names and values are arrays of laps for that driver.
 * 
 */
import type { Lap } from '../types';

/**
 * @brief Group laps by driver
 * 
 * This function takes an array of Lap objects and organizes 
 * them into a record (object) where each key is a driver's name 
 * and the corresponding value is an array of Lap objects associated with that driver.
 * 
 * @param laps - Array of Lap objects
 * @returns Record where keys are driver names and values are arrays of Lap objects
 */
export function groupByDriver(laps: Lap[]): Record<string, Lap[]> {
  return laps.reduce((acc, lap) => {
    if (!acc[lap.driver]) {
      acc[lap.driver] = [];
    }
    acc[lap.driver].push(lap);
    return acc;
  }, {} as Record<string, Lap[]>);
}
