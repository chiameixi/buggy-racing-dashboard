/**
 * custom hook to manage drawing history on a Leaflet map
 */

import { useState, useCallback } from 'react';

export type DrawCommand = 
    | { type: 'draw'; id: string; points: [number, number][] }
    | { type: 'erase'; id: string };

interface UseDrawingHistoryLeafletResult {
    commands: DrawCommand[]; // stack of drawing commands
    currentIndex: number; // Changed from currIdx
    addDrawCommand: (id: string, points: [number, number][]) => void;
    addEraseCommand: (id: string) => void; 
    undo: () => void; // undo last command
    redo: () => void; // redo last undone command
    clearAll: () => void; // clear all commands
}

export function useDrawingHistoryLeaflet(): UseDrawingHistoryLeafletResult {
    const [commands, setCommands] = useState<DrawCommand[]>([]);
    const [currentIndex, setCurrentIndex] = useState(-1);

    const addDrawCommand = useCallback((id: string, points: [number, number][]) => {
        setCommands((prevCommands) => {
            const newCommands = prevCommands.slice(0, currentIndex + 1);
            newCommands.push({ type: 'draw', id, points });
            return newCommands;
        });
        setCurrentIndex((prev) => prev + 1);
    }, [currentIndex]);

    const addEraseCommand = useCallback((id: string) => {
        setCommands((prevCommands) => {
            const newCommands = prevCommands.slice(0, currentIndex + 1);
            newCommands.push({ type: 'erase', id });
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
        undo,
        redo,
        clearAll,
    };
}