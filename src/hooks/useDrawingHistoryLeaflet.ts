/**
 * custom hook to manage drawing history on a Leaflet map
 * 
 * interacts with drawing layer to add/undo/redo/clear drawings and markers
 * performs pops/pushes drawing commands to a stack to maintain history
 * 
 */

import { useState, useCallback } from 'react';

export type DrawCommand = 
    | { type: 'draw'; id: string; points: [number, number][] }
    | { type: 'erase'; id: string }
    | { type: 'marker'; id: string; position: [number, number]; markerType: 'tree' | 'flag' | 'stop' | 'generic' }
;

interface UseDrawingHistoryLeafletResult {
    commands: DrawCommand[]; // stack of drawing commands
    currentIndex: number; // Changed from currIdx
    addDrawCommand: (id: string, points: [number, number][]) => void;
    addEraseCommand: (id: string) => void; 
    addMarkerCommand: (id: string, position: [number, number], markerType: 'tree' | 'flag' | 'stop' | 'generic' ) => void;
    undo: () => void; // undo last command
    redo: () => void; // redo last undone command
    clearAll: () => void; // clear all commands
}

// main hook function - defines state and methods to manage drawing history
export function useDrawingHistoryLeaflet(): UseDrawingHistoryLeafletResult {
    const [commands, setCommands] = useState<DrawCommand[]>([]);
    const [currentIndex, setCurrentIndex] = useState(-1);

    const addDrawCommand = useCallback((id: string, points: [number, number][]) => {
        setCommands((prevCommands) => {
            const newCommands = prevCommands.slice(0, currentIndex + 1);
            newCommands.push({ type: 'draw', id, points });
            return newCommands;
        });
        // update index - where we are in the command stack
        setCurrentIndex((prev) => prev + 1);
    }, [currentIndex]);

    // add erase command to the stack
    const addEraseCommand = useCallback((id: string) => {
        setCommands((prevCommands) => {
            const newCommands = prevCommands.slice(0, currentIndex + 1);
            newCommands.push({ type: 'erase', id });
            return newCommands;
        });
        // update index - where we are in the command stack
        setCurrentIndex((prev) => prev + 1);
    }, [currentIndex]);

    // add marker command to the stack
    const addMarkerCommand = useCallback((id: string, position: [number, number], markerType: 'tree' | 'flag' | 'stop' | 'generic') => {
        setCommands((prevCommands) => {
            const newCommands = prevCommands.slice(0, currentIndex + 1);
            newCommands.push({ type: 'marker', id, position, markerType });
            return newCommands;
        });
        setCurrentIndex((prev) => prev + 1);
    }, [currentIndex]);

    // set index back by 1 to undo
    const undo = useCallback(() => {
        setCurrentIndex((prev) => Math.max(prev - 1, -1));
    }, []);

    // increase index by 1 to redo
    const redo = useCallback(() => {
        setCurrentIndex((prev) => Math.min(prev + 1, commands.length - 1));
    }, [commands.length]);

    // clear all commands by clearing the stack and resetting index
    const clearAll = useCallback(() => {
        setCommands([]);
        setCurrentIndex(-1);
    }, []);

    return {
        commands,
        currentIndex,
        addDrawCommand,
        addEraseCommand,
        addMarkerCommand,
        undo,
        redo,
        clearAll,
    };
}