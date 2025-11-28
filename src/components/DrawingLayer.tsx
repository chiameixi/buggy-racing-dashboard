import { useEffect, useRef } from 'react';
import { useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';

type DrawingLayerProps = {
  isDrawMode: boolean;
  drawnPaths: Array<{ id: string; points: [number, number][] }>;
  onPathComplete: (points: [number, number][]) => void;
};

export function DrawingLayer({ isDrawMode, drawnPaths, onPathComplete }: DrawingLayerProps) {
  const map = useMap();
  const isDrawingRef = useRef(false);
  const currentPathRef = useRef<[number, number][]>([]);
  const drawnLayersRef = useRef<L.Polyline[]>([]);

  // Handle mouse events for drawing
  useMapEvents({
    mousedown: (e) => {
      if (!isDrawMode) return;
      
      isDrawingRef.current = true;
      currentPathRef.current = [[e.latlng.lat, e.latlng.lng]];
    },
    mousemove: (e) => {
      if (!isDrawMode || !isDrawingRef.current) return;
      
      currentPathRef.current.push([e.latlng.lat, e.latlng.lng]);
      
      // Draw temporary line as user draws
      const tempLayer = L.polyline(currentPathRef.current, {
        color: '#ff6b00',
        weight: 3,
        opacity: 0.8
      }).addTo(map);
      
      // Remove it immediately (we'll redraw constantly for smoothness)
      setTimeout(() => tempLayer.remove(), 50);
    },
    mouseup: () => {
      if (!isDrawMode || !isDrawingRef.current) return;
      
      isDrawingRef.current = false;
      
      if (currentPathRef.current.length > 1) {
        onPathComplete([...currentPathRef.current]);
      }
      
      currentPathRef.current = [];
    }
  });

  // Render all drawn paths
  useEffect(() => {
    // Clear previous layers
    drawnLayersRef.current.forEach(layer => layer.remove());
    drawnLayersRef.current = [];

    // Draw all paths
    drawnPaths.forEach(path => {
      const polyline = L.polyline(path.points, {
        color: '#ff6b00',
        weight: 3,
        opacity: 0.8
      }).addTo(map);
      
      drawnLayersRef.current.push(polyline);
    });

    return () => {
      drawnLayersRef.current.forEach(layer => layer.remove());
    };
  }, [drawnPaths, map]);

  // Change cursor when in draw mode
  useEffect(() => {
    if (isDrawMode) {
      map.getContainer().style.cursor = 'crosshair';
      map.dragging.disable();
    } else {
      map.getContainer().style.cursor = '';
      map.dragging.enable();
    }
  }, [isDrawMode, map]);

  return null;
}
