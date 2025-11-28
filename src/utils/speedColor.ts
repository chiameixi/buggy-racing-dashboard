// convert to color based on speed

// export function speedToColor(speed: number, minSpeed: number, maxSpeed: number): string {
//   const ratio = (speed - minSpeed) / (maxSpeed - minSpeed);
//   const r = Math.min(255, Math.max(0, Math.floor(255 * ratio)));
//   const g = Math.min(255, Math.max(0, Math.floor(255 * (1 - ratio))));
//   return `rgb(${r},${g},0)`;
// }

// get min/max speeds from all laps
export function getSpeedRange(laps: { points: { speed?: number }[] }[]): { min: number; max: number } {
  const allSpeeds: number[] = [];
  
  laps.forEach(lap => {
    lap.points.forEach(point => {
      if (point.speed !== undefined && point.speed > 0) {
        allSpeeds.push(point.speed);
      }
    });
  });
  
  if (allSpeeds.length === 0) {
    return { min: 0, max: 15 }; // Fallback
  }
  
  // destruct into a list to get min/max
  return {
    min: Math.min(...allSpeeds),
    max: Math.max(...allSpeeds)
  };
}

// Convert speed (m/s) to color based on actual min/max
export function getSpeedColor(speed: number | undefined, minSpeed: number, maxSpeed: number): string {
  if (speed === undefined) return '#3b82f6'; // Default blue

  const range = maxSpeed - minSpeed;
  if (range <= 0) return '#3b82f6'; // Avoid division by zero, return default blue
  
  // normalize to 0-1 based on actual range
  const normalized = (speed - minSpeed) / (maxSpeed - minSpeed);
  const clamped = Math.max(0, Math.min(1, normalized)); // clamp to [0,1]
  
  // Color gradient: red (slow) → yellow (medium) → green (fast)
  if (clamped < 0.5) {
    // Red to Yellow
    const t = clamped * 2;
    return `rgb(${255}, ${Math.round(t * 255)}, 0)`;
  } else {
    // Yellow to Green
    const t = (clamped - 0.5) * 2;
    return `rgb(${Math.round(255 * (1 - t))}, ${255}, 0)`;
  }
}

// For legend display
export function formatSpeed(speedMs: number): string {
  const mph = speedMs * 2.237; // Convert m/s to mph
  return `${mph.toFixed(1)} mph`;
}