/**
 * useDrawingHistory.ts
 * 
 * Custom hook for managing undo/redo command history
 */

import { useState, useCallback } from 'react';

export type DrawCommand = 
    | { type: 'draw'; points: [number, number][]; color: string; width: number }
    | { type: 'erase'; points: [number, number][]; width: number };

interface UseDrawingHistoryReturn {
    commands: DrawCommand[];
    currentCommandIndex: number;
    addCommand: (cmd: DrawCommand) => void;
    undo: () => void;
    redo: () => void;
    clearAll: () => void;
}

export function useDrawingHistory(onCommandsChange?: (commands: DrawCommand[]) => void): UseDrawingHistoryReturn {
    // use a single array of DrawaCommands and a pointer index to manage undo/redo
    const [commands, setCommands] = useState<DrawCommand[]>([]);
    const [currentCommandIndex, setCurrentCommandIndex] = useState(-1);

    const addCommand = useCallback((cmd: DrawCommand) => {
        setCommands(prev => {
            // truncate redo stack so that new command invalidates it
            // scared that it will grow indefinitely otherwise
            const newCommands = prev.slice(0, currentCommandIndex + 1); 
            // add new command (the latest action)
            newCommands.push(cmd);
            // notify parent if needed so that it can do redrawing
            onCommandsChange?.(newCommands);
            return newCommands;
    });
    // update ptr
    setCurrentCommandIndex(prev => prev + 1);
    }, [currentCommandIndex, onCommandsChange]);

    const undo = useCallback(() => {
    // -1 means no commands on undo redo stack - don't go below that
        setCurrentCommandIndex(prev => Math.max(-1, prev - 1));
        if (currentCommandIndex - 1 < -1) {
            console.log("Undo not possible");
        }
    }, []);

    const redo = useCallback(() => {
    // cannot go beyond last command
        setCurrentCommandIndex(prev => Math.min(commands.length - 1, prev + 1));
        if (currentCommandIndex + 1 >= commands.length) {
            console.log("Redo not possible");
        };
    }, [commands.length]);

    const clearAll = useCallback(() => {
        setCommands([]);
        setCurrentCommandIndex(-1);
    }, []);

    return {
        commands,
        currentCommandIndex,
        addCommand,
        undo,
        redo,
        clearAll
    };
}
