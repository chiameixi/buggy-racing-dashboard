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
  activeTool: 'pencil' | 'erase' | 'marker'| null;  
  selectedMarkerType: 'tree' | 'flag' | 'stop' | 'generic'; 
  onCommandsChange?: (commands: DrawCommand[]) => void;
}

export interface DrawingLayerHandle {
  undo: () => void;
  redo: () => void;
  clearAll: () => void;
}

export const DrawingLayer = forwardRef<DrawingLayerHandle, DrawingLayerProps>(
  ({ isDrawMode, activeTool, selectedMarkerType, onCommandsChange }, ref) => {
    const map = useMap();
    const isDrawingRef = useRef(false);
    const currentPathRef = useRef<[number, number][]>([]);
    const drawnLayersRef = useRef<Map<string, L.Polyline>>(new Map());

    const { commands, currentIndex, addDrawCommand, addEraseCommand, addMarkerCommand, undo, redo, clearAll } = 
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

        // markers

        else if (cmd.type === 'marker' && !erasedIds.has(cmd.id)) {
        // define the file extensions for each marker type
          const iconFiles = {
            tree: '/icons/Tree.png',
            flag: '/icons/Flag.svg',
            stop: '/icons/Stop.png',
            generic: '/buggy.svg'
          };
          
          // create icon based on marker type
          const icon = L.icon({
            iconUrl: iconFiles[cmd.markerType],
            iconSize: [32, 32],
            iconAnchor: [16, 32],
            popupAnchor: [0, -32]
          });
          
          const marker = L.marker(cmd.position, { icon }).addTo(map);
          drawnLayersRef.current.set(cmd.id, marker as any);
        }

        else if (cmd.type === 'draw' && !erasedIds.has(cmd.id)) {
          const polyline = L.polyline(cmd.points, {
            color: '#ff6b00',
            weight: 3,
            opacity: 0.8
          }).addTo(map);
          
          drawnLayersRef.current.set(cmd.id, polyline);
        }
      
      }
    }, [commands, currentIndex, map, selectedMarkerType]);

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
          
          const mouseLatLng = e.latlng;
          const eraseThreshold = 20; //meters

          for (const [id, layer] of drawnLayersRef.current.entries()) {
            // check if click is polyline or marker 
            if (layer instanceof L.Marker) {
              const markerLatLng = layer.getLatLng();
              const dist = mouseLatLng.distanceTo(markerLatLng);

              console.log(`Marker ${id} distance: ${dist.toFixed(2)}m`);
              
              if (dist < eraseThreshold) {
                console.log(`Erasing marker ${id}`);
                addEraseCommand(id);
                return;
              }

              console.log('marker kinda far');
            }

            else if (layer instanceof L.Polyline) {
              const points = layer.getLatLngs() as L.LatLng[];
              let minDist = Infinity;

              for (const pt of points) {
                const dist = mouseLatLng.distanceTo(pt)
                minDist = Math.min(minDist, dist);
              }            

              if (minDist < eraseThreshold) {
                console.log(`erasing polykine ${id}`);
                addEraseCommand(id);
                return;
              }

            }
          }
        
            // console.log('Checking polyline id:', id);
            // const latlng = e.latlng;

            // // Haversine formula to calculate distance between two latlngs
            // import from utils/gpxParser.ts and replace with that function - TO DO
            // const distance = (p1: L.LatLng, p2: L.LatLng) => {
            //   const R = 6371; // Earth radius in km
            //   const dLat = (p2.lat - p1.lat) * Math.PI / 180;
            //   const dLng = (p2.lng - p1.lng) * Math.PI / 180;
            //   const a = 
            //     Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            //     Math.cos(p1.lat * Math.PI / 180) * Math.cos(p2.lat * Math.PI / 180) *
            //     Math.sin(dLng / 2) * Math.sin(dLng / 2);
            //   const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
            //   return R * c * 1000; // meters
            // };

            // Check distance to polyline points
            // const points = polyline.getLatLngs() as L.LatLng[];
            // console.log(`Polyline ${id} has ${points.length} points`);

            // let minDist = Infinity;
            // for (const pt of points) {
            //   minDist = Math.min(minDist, distance(latlng, pt));
            // }

            // console.log(`Min distance to polyline ${id}: ${minDist.toFixed(2)}m`);

            // // If within 10 meters, erase it
            // if (minDist < 10) {
            //   console.log(`Erasing polyline ${id}`);
            //   addEraseCommand(id);
            //   return;
          //   }
          // }

          // console.log('No polyline found within 10m of click');
          // return;
        }

        if (activeTool === 'marker') {
          console.log('marker mode - adding marker');

          const id = Date.now().toString();
          const position: [number, number] = [e.latlng.lat, e.latlng.lng];
          addMarkerCommand(id, position, selectedMarkerType); 
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
    // if the user is currently drawing, they should not be able to drag the map around
    useEffect(() => {
      if (activeTool === 'pencil') {
        map.getContainer().style.cursor = 'crosshair';
        map.dragging.disable();
      } else if (activeTool === 'erase') {
        map.getContainer().style.cursor = 'grab';
        map.dragging.disable();
      } else if (activeTool === 'marker') {
        map.getContainer().style.cursor = 'pointer';
        map.dragging.disable();
      } else {
        map.getContainer().style.cursor = '';
        map.dragging.enable();
      }
    }, [activeTool, selectedMarkerType, map]);

    return null;
  }
);

DrawingLayer.displayName = 'DrawingLayer';