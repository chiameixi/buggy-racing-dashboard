/**
 * useCanvasInitialization.ts
 * 
 * Custom hook for initializing canvas and handling resize/pan/zoom
 */

import { useEffect } from 'react';
import { useMap } from 'react-leaflet';

export function useCanvasInitialization(
  canvasRef: React.RefObject<HTMLCanvasElement>,
  containerRef: React.RefObject<HTMLDivElement>,
  redrawCanvas: () => void
) {
  const map = useMap();

  useEffect(() => {
    if (!canvasRef.current || !containerRef.current) return;

    const canvas = canvasRef.current;
    const container = map.getContainer();
    
    // Set canvas size to match map container
    canvas.width = container.clientWidth;
    canvas.height = container.clientHeight;
    
    // Initial draw
    redrawCanvas();

    // Handle map resize
    const handleResize = () => {
      canvas.width = container.clientWidth;
      canvas.height = container.clientHeight;
      redrawCanvas();
    };

    map.on('resize', handleResize);
    window.addEventListener('resize', handleResize);

    // Handle map pan/zoom - redraw canvas to maintain position
    const handleMove = () => {
      redrawCanvas();
    };
    
    map.on('move zoom', handleMove);

    return () => {
      map.off('resize', handleResize);
      map.off('move zoom', handleMove);
      window.removeEventListener('resize', handleResize);
    };
  }, [map, canvasRef, containerRef, redrawCanvas]);
}
