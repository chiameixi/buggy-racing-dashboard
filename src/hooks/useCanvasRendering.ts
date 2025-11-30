/**
 * useCanvasRendering.ts
 * 
 * Custom hook for canvas rendering operations (drawing, erasing, redrawing)
 * logic for how to display the commands stored in useDrawingHistory
 */

import { useCallback } from 'react';
import type { DrawCommand } from './useDrawingHistory';

// return types - basically eveyrthing we need for drawing and erasing (and redrawing)
interface UseCanvasRenderingReturn {
    redrawCanvas: () => void;
    drawStroke: (ctx: CanvasRenderingContext2D, points: [number, number][], color: string, width: number) => void;
    eraseStroke: (ctx: CanvasRenderingContext2D, points: [number, number][], width: number) => void;
}

// drawing operations change our undo / redo stack 
export function useCanvasRendering(
    canvasRef: React.RefObject<HTMLCanvasElement>,
    commands: DrawCommand[],
    currentCommandIndex: number
): UseCanvasRenderingReturn {

    const drawStroke = useCallback((
        ctx: CanvasRenderingContext2D,
        points: [number, number][],
        color: string,
        width: number
    ) => {
        if (points.length === 0) return;

        ctx.strokeStyle = color;
        ctx.lineWidth = width;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        ctx.beginPath();
        ctx.moveTo(points[0][0], points[0][1]);

        // loop through points and draw lines between the points
        for (let i = 1; i < points.length; i++) {
            ctx.lineTo(points[i][0], points[i][1]);
        }

        ctx.stroke();
        }, []
    );

    const eraseStroke = useCallback((
        _ctx: CanvasRenderingContext2D,
        _points: [number, number][],
        _width: number
    ) => {

        if (_points.length === 0) return;

        // set up for erasing
        const ctx = _ctx;
        const points = _points;
        const width = _width;

        ctx.lineWidth = width;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        // perform erasing by drawing with 'destination-out' composite mode
        // loop through points and erase segments
        for (let i = 1; i < points.length; i++) {
            const start = points[i - 1];
            const end = points[i];

            ctx.save();
            ctx.globalCompositeOperation = 'destination-out';
            ctx.beginPath();
            ctx.moveTo(start[0], start[1]);
            ctx.lineTo(end[0], end[1]);
            ctx.stroke();
            ctx.restore();
        }   

    }, []
    );

    const redrawCanvas = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // redraw all commands up to currentCommandIndex
        for (let i = 0; i <= currentCommandIndex; i++) {
            const cmd = commands[i];
        
        if (cmd.type === 'draw') {
            drawStroke(ctx, cmd.points, cmd.color, cmd.width);
        } else if (cmd.type === 'erase') {
            eraseStroke(ctx, cmd.points, cmd.width);
        }
        }
    }, [canvasRef, commands, currentCommandIndex, drawStroke, eraseStroke]);

    return {
        redrawCanvas,
        drawStroke,
        eraseStroke
    };
}
