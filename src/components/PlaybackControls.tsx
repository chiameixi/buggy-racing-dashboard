/**slider + buttons + time display
 * PlaybackControls.tsx
 * 
 */

import './PlaybackControls.css';

type PlaybackControlsProps = {
  isPlaying: boolean;
  currentTime: number; // percentage 0-100
//   playbackSpeed: number;
  onTogglePlay: () => void;
  onSeek: (percentage: number) => void;
  onReset: () => void;
};

export function PlaybackControls({
    isPlaying,
    currentTime,
    onTogglePlay,
    onSeek,
    onReset

}: PlaybackControlsProps){
  return (
    <div className="playback-controls">
      <div className="playback-buttons">
        <button onClick={onReset} className="control-btn">
          ⏮ Reset
        </button>
        <button onClick={onTogglePlay} className="control-btn play-btn">
          {isPlaying ? '⏸ Pause' : '▶ Play'}
        </button>
      </div>
      
      <div className="scrubber-container">
        <input
          type="range"
          min="0"
          max="100"
          step="0.1"
          value={currentTime}
          onChange={(e) => onSeek(parseFloat(e.target.value))}
          className="scrubber"
        />
        <div className="time-display">
          {currentTime.toFixed(1)}%
        </div>
      </div>
    </div>
  );
}