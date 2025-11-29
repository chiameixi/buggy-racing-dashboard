/**slider + buttons + time display
 * PlaybackControls.tsx
 * 
 */

import './PlaybackControls.css';

interface PlaybackControlsProps {
  isPlaying: boolean;
  currentTime: number; // percentage 0-100
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
  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    onSeek(parseFloat(e.target.value));
  };

  return (
    <div className="playback-controls">
      <div className="progress-container">
        <input
          type="range"
          min="0"
          max="100"
          step="0.1"
          value={currentTime}
          onChange={handleSeek}
          className="scrubber"
          title="Seek playback"
          style={{
            background: `linear-gradient(to right, #6cbbb4 0%, #6cbbb4 ${currentTime}%, #e5e5e5 ${currentTime}%, #e5e5e5 100%)`
          }}
        />
        <span className="progress-percentage">{currentTime.toFixed(1)}%</span>
      </div>
    </div>
  );
}