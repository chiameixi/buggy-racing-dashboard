/**
 * DrawingLayer.tsx
 * 
 * A React component that provides drawing capabilities on a Leaflet map.
 * Users can draw polylines by clicking and dragging the mouse.
 * The component supports enabling/disabling draw mode and rendering drawn paths.
 * Integrates with Leaflet via react-leaflet hooks.
 * 
 */

import { useEffect, useRef, useImperativeHandle, forwardRef, useCallback } from 'react';
import { useMap, useMapEvents } from 'react-leaflet';
import {useDrawingHistoryLeaflet, type DrawCommand} from '../hooks/useDrawingHistoryLeaflet';
import L from 'leaflet';

interface DrawingLayerProps {
  isDrawMode: boolean;
  activeTool: 'pencil' | 'erase' | null;  // ADD: support for erase mode
  onCommandsChange?: (commands: DrawCommand[]) => void;
}

export interface DrawingLayerHandle {
  undo: () => void;
  redo: () => void;
  clearAll: () => void;
}

export const DrawingLayer = forwardRef<DrawingLayerHandle, DrawingLayerProps>(
  ({ isDrawMode, activeTool, onCommandsChange }, ref) => {
    const map = useMap();
    const isDrawingRef = useRef(false);
    const currentPathRef = useRef<[number, number][]>([]);
    const drawnLayersRef = useRef<Map<string, L.Polyline>>(new Map());

    const { commands, currentIndex, addDrawCommand, addEraseCommand, undo, redo, clearAll } = 
      useDrawingHistoryLeaflet();

    // Expose methods via ref
    useImperativeHandle(ref, () => ({
      undo,
      redo,
      clearAll
    }), [undo, redo, clearAll]);

    // rebuild polylines based on command history
    const rebuildPolylines = useCallback(() => {
      // Remove all polylines
      drawnLayersRef.current.forEach(layer => layer.remove());
      drawnLayersRef.current.clear();

      // track erased ones so we dont draw them again
      const erasedIds = new Set<string>();

      // add erased ids so we can skip drawing them
      for (let i = 0; i <= currentIndex; i++) {
        const cmd = commands[i];
        if (cmd?.type === 'erase') {
          erasedIds.add(cmd.id);
        }
      }

      // Replay commands up to currentIndex but skip erased ones
      for (let i = 0; i <= currentIndex; i++) {
        const cmd = commands[i];
        if (!cmd) continue;

        if (cmd.type === 'draw' && !erasedIds.has(cmd.id)) {
          const polyline = L.polyline(cmd.points, {
            color: '#ff6b00',
            weight: 3,
            opacity: 0.8
          }).addTo(map);
          
          drawnLayersRef.current.set(cmd.id, polyline);
        }
        // } else if (cmd.type === 'erase') {
        //   // Don't draw erased polylines
        //   drawnLayersRef.current.delete(cmd.id);
        // }
      }
    }, [commands, currentIndex, map]);

    // Rebuild on command history change
    useEffect(() => {
      rebuildPolylines();
      onCommandsChange?.(commands.slice(0, currentIndex + 1));
    }, [commands, currentIndex, rebuildPolylines, onCommandsChange]);

    // Handle mouse events for drawing
    useMapEvents({
      mousedown: (e) => {
        console.log('mousedown event:', { isDrawMode, activeTool, latlng: e.latlng });
        console.log('mousedown. drawinglayertsx', { isDrawMode, activeTool });
        if (!isDrawMode) return;
        
        // If erase mode, erase the clicked polyline
        if (activeTool === 'erase') {
          console.log('Erase mode - checking polylines');
          console.log('Number of drawn layers:', drawnLayersRef.current.size);
          console.log('Drawn layer IDs:', Array.from(drawnLayersRef.current.keys()));
          
          for (const [id, polyline] of drawnLayersRef.current.entries()) {
            // Check if click is near polyline (simple distance check)
            console.log('Checking polyline id:', id);
            const latlng = e.latlng;

            const distance = (p1: L.LatLng, p2: L.LatLng) => {
              const R = 6371; // Earth radius in km
              const dLat = (p2.lat - p1.lat) * Math.PI / 180;
              const dLng = (p2.lng - p1.lng) * Math.PI / 180;
              const a = 
                Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                Math.cos(p1.lat * Math.PI / 180) * Math.cos(p2.lat * Math.PI / 180) *
                Math.sin(dLng / 2) * Math.sin(dLng / 2);
              const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
              return R * c * 1000; // meters
            };

            // Check distance to polyline points
            const points = polyline.getLatLngs() as L.LatLng[];
            console.log(`Polyline ${id} has ${points.length} points`);

            let minDist = Infinity;
            for (const pt of points) {
              minDist = Math.min(minDist, distance(latlng, pt));
            }

            console.log(`Min distance to polyline ${id}: ${minDist.toFixed(2)}m`);

            // If within 10 meters, erase it
            if (minDist < 10) {
              console.log(`Erasing polyline ${id}`);
              addEraseCommand(id);
              return;
            }
          }

          console.log('No polyline found within 10m of click');
          return;
        }

        // Normal drawing mode
        if (activeTool !== 'pencil') {
          console.log('not pencil tool, returning');
          return;
        }

        console.log('Starting to drawwww');
  
        isDrawingRef.current = true;
        currentPathRef.current = [[e.latlng.lat, e.latlng.lng]];
      },

      mousemove: (e) => {
        if (!isDrawMode || !isDrawingRef.current || activeTool !== 'pencil') return;
        
        console.log('Drawing - adding point');

        currentPathRef.current.push([e.latlng.lat, e.latlng.lng]);
        
        // Update temporary polyline
        const existingTemp = drawnLayersRef.current.get('__temp__');
        if (existingTemp) existingTemp.remove();

        const tempLayer = L.polyline(currentPathRef.current, {
          color: '#ff6b00',
          weight: 3,
          opacity: 0.8,
          dashArray: '5, 5' // dashed to indicate temporary
        }).addTo(map);
        
        drawnLayersRef.current.set('__temp__', tempLayer);
      },

      mouseup: () => {
        console.log('mouseup - isDrawing:', isDrawingRef.current, 'points:', currentPathRef.current.length);
        if (!isDrawMode || !isDrawingRef.current || activeTool !== 'pencil') return;
        
        isDrawingRef.current = false;

        // Remove temporary polyline
        const tempLayer = drawnLayersRef.current.get('__temp__');
        if (tempLayer) {
          tempLayer.remove();
          drawnLayersRef.current.delete('__temp__');
        }

        if (currentPathRef.current.length > 1) {
          const id = Date.now().toString();
          addDrawCommand(id, currentPathRef.current as [number, number][]);
        }

        currentPathRef.current = [];
      }
    });

    // Update cursor based on tool
    useEffect(() => {
      if (activeTool === 'pencil') {
        map.getContainer().style.cursor = 'crosshair';
        map.dragging.disable();
      } else if (activeTool === 'erase') {
        map.getContainer().style.cursor = 'grab';
        map.dragging.disable();
      } else {
        map.getContainer().style.cursor = '';
        map.dragging.enable();
      }
    }, [activeTool, map]);

    return null;
  }
);

DrawingLayer.displayName = 'DrawingLayer';

// interface DrawingLayerProps {
//   isDrawMode: boolean;
//   // activeTool: 'draw' | 'erase' | null;
//   // onCommandsChange?: (commands: DrawCommand[]) => void;
//   drawnPaths: Array<{ id: string; points: [number, number][] }>;
//   onPathComplete: (points: [number, number][]) => void;
// };

// // export interface DrawingLayerHandle {
// //   undo: () => void;
// //   redo: () => void;
// //   clearAll: () => void;
// // }

// // export const DrawingLayerHandle = forwardRef<DrawingLayerHandle, DrawingLayerProps>(
// //   ({ isDrawMode, activeTool, onCommandsChange }, ref) => {

// //     const map = useMap();
// //     const isDrawingRef = useRef(false);
// //     const currentPathRef = useRef<[number, number][]>([]);
// //     const drawnLayersRef = useRef<Map<string, L.Polyline>>(new Map());

// //     const { commands, currIdx, addCommand, undo, redo, clearAll } = useDrawingHistoryLeaflet();
  
// //     // expose undo, redo, clearAll methods to parent via ref
// //     useImperativeHandle(ref, () => ({
// //       undo,
// //       redo,
// //       clearAll,
// //     }), [undo, redo, clearAll]);
      
// //     // rebuild drawn layers whenever commands or currIdx change
// //     const rebuildDrawnLayers = () => {
// //       // Clear existing layers
// //       drawnLayersRef.current.forEach(layer => layer.remove());
// //       drawnLayersRef.current.clear();
  
// //       // Rebuild layers based on commands up to currIdx
// //       for (let i = 0; i <= currIdx; i++) {
// //         const command = commands[i];

// //         if (!command) continue;

// //         // draw or erase based on command type
// //         if (command.type === 'draw') {
// //           const polyline = L.polyline(command.points, {
// //             color: '#ff6b00',
// //             weight: 3,
// //             opacity: 0.8
// //           }).addTo(map);

// //           drawnLayersRef.current.set(command.id, polyline);

// //         } else if (command.type === 'erase') {
// //           drawnLayersRef.current.delete(command.id);
// //           // const layer = drawnLayersRef.current.get(command.id);

// //           // if (layer) {
// //           //   layer.remove();
// //           //   drawnLayersRef.current.delete(command.id);
// //           // }
// //         }
// //       }
// //     }, [commands, currIdx, map]);

// //     //rebuild based on commands/currIdx change
// //     useEffect(() => {
// //       rebuildDrawnLayers();
// //       if (onCommandsChange) {
// //         onCommandsChange(commands.slice(0, currIdx + 1));
// //       }
// //     }, [commands, currIdx, rebuildDrawnLayers, onCommandsChange]);

// //     // Handle mouse events for drawing/erasing
// //     useMapEvents({
// //       mousedown: (e) => {
// //         if (!isDrawMode) return;
        
// //         if (activeTool === 'erase') {
// //           // Check if clicked near any drawn polyline
// //   }
// // );

// export function DrawingLayer({ isDrawMode, drawnPaths, onPathComplete }: DrawingLayerProps) {
//   const map = useMap();
//   const isDrawingRef = useRef(false);
//   const currentPathRef = useRef<[number, number][]>([]);
//   const drawnLayersRef = useRef<L.Polyline[]>([]);

//   // Handle mouse events for drawing
//   useMapEvents({
//     mousedown: (e) => {
//       if (!isDrawMode) return;
      
//       isDrawingRef.current = true;
//       currentPathRef.current = [[e.latlng.lat, e.latlng.lng]];
//     },
//     mousemove: (e) => {
//       if (!isDrawMode || !isDrawingRef.current) return;
      
//       currentPathRef.current.push([e.latlng.lat, e.latlng.lng]);
      
//       // Draw temporary line as user draws
//       const tempLayer = L.polyline(currentPathRef.current, {
//         color: '#ff6b00',
//         weight: 3,
//         opacity: 0.8
//       }).addTo(map);
      
//       // Remove it immediately (we'll redraw constantly for smoothness)
//       setTimeout(() => tempLayer.remove(), 50);
//     },
//     mouseup: () => {
//       if (!isDrawMode || !isDrawingRef.current) return;
      
//       isDrawingRef.current = false;
      
//       if (currentPathRef.current.length > 1) {
//         onPathComplete([...currentPathRef.current]);
//       }
      
//       currentPathRef.current = [];
//     }
//   });

//   // Render all drawn paths
//   useEffect(() => {
//     // Clear previous layers
//     drawnLayersRef.current.forEach(layer => layer.remove());
//     drawnLayersRef.current = [];

//     // Draw all paths
//     drawnPaths.forEach(path => {
//       const polyline = L.polyline(path.points, {
//         color: '#ff6b00',
//         weight: 3,
//         opacity: 0.8
//       }).addTo(map);
      
//       drawnLayersRef.current.push(polyline);
//     });

//     return () => {
//       drawnLayersRef.current.forEach(layer => layer.remove());
//     };
//   }, [drawnPaths, map]);

//   // Change cursor when in draw mode
//   useEffect(() => {
//     if (isDrawMode) {
//       map.getContainer().style.cursor = 'crosshair';
//       map.dragging.disable();
//     } else {
//       map.getContainer().style.cursor = '';
//       map.dragging.enable();
//     }
//   }, [isDrawMode, map]);

//   return null;
// }
