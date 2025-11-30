/**
 * useCanvasInteraction.ts
 * 
 * Custom hook for managing cursor and map interaction during drawing
 * basically changes cursor style to reflect the active tool
 * and enables/disables map dragging accordingly
 */

import { useEffect } from 'react';
import { useMap } from 'react-leaflet';

export function useCanvasInteraction(
    containerRef: React.RefObject<HTMLDivElement>,
    activeTool: 'pencil' | 'erase' | null) {

    // connect to the react leaflet map instance
    const map = useMap();

    // change cursor and map dragging based on active tool
    useEffect(() => {
        if (!containerRef.current) return;

        // set cursor style and map dragging to reflect active tool
        if (activeTool === 'pencil') {

            containerRef.current.style.cursor = 'crosshair';
            console.log('pencil tool active');
            map.dragging.disable();

        } else if (activeTool === 'erase') {

            containerRef.current.style.cursor = 'cell';
            console.log('erase tool active');
            map.dragging.disable();

        } else {

            containerRef.current.style.cursor = 'grab';
            console.log('no tool active');
            map.dragging.enable();
            
        }
    }, [activeTool, map]);
}
