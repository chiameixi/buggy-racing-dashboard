/**
 * CanvasDrawingLayer.tsx
 * 
 * Canvas-based drawing layer for Leaflet map with support for:
 * - Freehand drawing (pencil)
 * - Erasing strokes
 * - Undo/Redo
 * - Command history
 * 
 * Refactored to use custom hooks for modularity
 */

import { useRef, useImperativeHandle, forwardRef } from 'react';
import { useDrawingHistory, type DrawCommand } from '../hooks/useDrawingHistory';
import { useCanvasRendering } from '../hooks/useCanvasRendering';
import { useCanvasMouseEvents } from '../hooks/useCanvasMouseEvents';
import { useCanvasInitialization } from '../hooks/useCanvasInitialization';
import { useCanvasInteraction } from '../hooks/useCanvasInteraction';
import './CanvasDrawingLayer.css';

interface CanvasDrawingLayerProps {
  activeTool: 'pencil' | 'erase' | null;
  onCommandsChange?: (commands: DrawCommand[]) => void;
}

export interface CanvasDrawingLayerHandle {
  undo: () => void;
  redo: () => void;
  clearAll: () => void;
}

export const CanvasDrawingLayer = forwardRef<CanvasDrawingLayerHandle, CanvasDrawingLayerProps>(
  ({ activeTool, onCommandsChange }, ref) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    // Use custom hooks for different concerns
    const { commands, currentCommandIndex, addCommand, undo, redo, clearAll } = 
      useDrawingHistory(onCommandsChange);
    
    const { redrawCanvas } = useCanvasRendering(
      canvasRef as React.RefObject<HTMLCanvasElement>, 
      commands, 
      currentCommandIndex
    );
    
    const { handleMouseDown, handleMouseMove, handleMouseUp, handleMouseLeave } = 
      useCanvasMouseEvents(
        canvasRef as React.RefObject<HTMLCanvasElement>, 
        activeTool, 
        addCommand, 
        redrawCanvas
      );

    useCanvasInitialization(
      canvasRef as React.RefObject<HTMLCanvasElement>, 
      containerRef as React.RefObject<HTMLDivElement>, 
      redrawCanvas
    );
    
    useCanvasInteraction(
      containerRef as React.RefObject<HTMLDivElement>, 
      activeTool
    );

    // Expose undo/redo/clear methods
    useImperativeHandle(
      ref,
      () => ({
        undo,
        redo,
        clearAll
      }),
      [undo, redo, clearAll]
    );

    return (
      <div
        ref={containerRef}
        className="canvas-drawing-layer"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
      >
        <canvas ref={canvasRef} className="drawing-canvas" />
      </div>
    );
  }
);

CanvasDrawingLayer.displayName = 'CanvasDrawingLayer';

export type { DrawCommand };
