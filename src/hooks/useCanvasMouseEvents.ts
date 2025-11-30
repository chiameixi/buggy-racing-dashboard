/**
 * useCanvasMouseEvents.ts
 * 
 * Custom hook for handling canvas mouse events (drawing/erasing)
 */

import { useRef, useCallback } from 'react';
import type { DrawCommand } from './useDrawingHistory';

// Constants for drawing - basically the main thing the mouseevents change
const PENCIL_COLOR = '#ff6b00';
const PENCIL_WIDTH = 3;
const ERASE_WIDTH = 15;

// return types - mouse event handlers
interface UseCanvasMouseEventsReturn {
    handleMouseDown: (e: React.MouseEvent<HTMLDivElement>) => void;
    handleMouseMove: (e: React.MouseEvent<HTMLDivElement>) => void;
    handleMouseUp: () => void;
    handleMouseLeave: () => void;
}

// main hook function
export function useCanvasMouseEvents(
    canvasRef: React.RefObject<HTMLCanvasElement>,
    activeTool: 'pencil' | 'erase' | null,
    addCommand: (cmd: DrawCommand) => void,
    redrawCanvas: () => void
): UseCanvasMouseEventsReturn {

    const isDrawingRef = useRef(false);
    const lastPointRef = useRef<{ x: number; y: number } | null>(null); // track last point for continuous drawing
    const currentStrokePointsRef = useRef<[number, number][]>([]); // points in current stroke

    // Mouse down = start drawing/erasing
    // means we need to start tracking points and note the last point
    const handleMouseDown = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
        if (!activeTool) return;

        isDrawingRef.current = true;
        currentStrokePointsRef.current = [];

        const canvas = canvasRef.current;
        if (!canvas) return;

        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        lastPointRef.current = { x, y };
        currentStrokePointsRef.current.push([x, y]);
    }, [activeTool, canvasRef]);

    // Mouse move = continue drawing/erasing
    // means we need to draw/erase from last point to current point (add on to the drawing)
    const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
        if (!isDrawingRef.current || !activeTool) return;

        const canvas = canvasRef.current;
        if (!canvas) return;

        // get mouse position relative to canvas
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        currentStrokePointsRef.current.push([x, y]);
        lastPointRef.current = { x, y };

        // real time drawing logic
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        if (activeTool === 'pencil') {
            // Draw from last point to current point

            // set stroke styles
            ctx.strokeStyle = PENCIL_COLOR;
            ctx.lineWidth = PENCIL_WIDTH;
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
        
            // get the old last point (starting point of new line segment)
            const lastPoint = lastPointRef.current;

            // draw line segment
            if (lastPoint) {
                ctx.beginPath();
                ctx.moveTo(lastPoint.x, lastPoint.y);
                ctx.lineTo(x, y);
                ctx.stroke();
            }

        } else if (activeTool === 'erase') {
            // Erase from last point to current point
            // set erase styles
            ctx.strokeStyle = 'rgba(0,0,0,1)'; //alpha
            ctx.lineWidth = ERASE_WIDTH;
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
            ctx.globalCompositeOperation = 'destination-out';
        
            // get the old last point (starting point of erase segment)
            const lastPoint = lastPointRef.current;

            // erase line segment
            if (lastPoint) {
                ctx.beginPath();
                ctx.moveTo(lastPoint.x, lastPoint.y);
                ctx.lineTo(x, y);
                ctx.stroke();
            }

            // reset composite operation back to default
            ctx.globalCompositeOperation = 'source-over';
        }

    }, [activeTool, canvasRef]);

    const handleMouseUp = useCallback(() => {
        if (!isDrawingRef.current || !activeTool) return;

        isDrawingRef.current = false;
        lastPointRef.current = null;

        const points = currentStrokePointsRef.current;

        if (points.length > 1) {
            if (activeTool === 'pencil') {
            addCommand({
                type: 'draw',
                points: points as [number, number][],
                color: PENCIL_COLOR,
                width: PENCIL_WIDTH
            });
            } else if (activeTool === 'erase') {
            addCommand({
                type: 'erase',
                points: points as [number, number][],
                width: ERASE_WIDTH
            });
            }

            redrawCanvas();
        }

        currentStrokePointsRef.current = [];
    }, [activeTool, addCommand, redrawCanvas]);

    const handleMouseLeave = useCallback(() => {
        if (isDrawingRef.current) {
            isDrawingRef.current = false;
            lastPointRef.current = null;
            currentStrokePointsRef.current = [];
        }
    }, []);

    return {
        handleMouseDown,
        handleMouseMove,
        handleMouseUp,
        handleMouseLeave
    };
}
