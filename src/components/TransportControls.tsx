/**
 * Transport Controls Component - Batch 1 Development
 * R3B-90 to R3B-93: Song Mode Implementation
 * 
 * UI controls for transport (play, pause, stop, record)
 */

import React from 'react';
import { useTransportStore } from '../stores/transportStore';
import { useSongStore } from '../stores/songStore';

export const TransportControls: React.FC = () => {
  const {
    isPlaying,
    isRecording,
    bpm,
    play,
    pause,
    stop,
    startRecording,
    stopRecording,
    setBpm,
    reset,
  } = useTransportStore();

  const { startPlayback, stopPlayback } = useSongStore();

  const handlePlay = () => {
    if (isPlaying) {
      pause();
      stopPlayback();
    } else {
      play();
      startPlayback();
    }
  };

  const handleRecord = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  const handleStop = () => {
    stop();
    stopPlayback();
  };

  const handleBpmChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newBpm = parseInt(e.target.value);
    setBpm(newBpm);
  };

  const handleBpmDecrease = () => {
    setBpm(Math.max(40, bpm - 1));
  };

  const handleBpmIncrease = () => {
    setBpm(Math.min(300, bpm + 1));
  };

  const handleReset = () => {
    reset();
  };

  return (
    <div className="transport-controls">
      <div className="playback-buttons">
        <button
          onClick={handlePlay}
          disabled={isRecording}
          className={isPlaying ? 'active' : ''}
          title={isPlaying ? 'Pause' : 'Play'}
        >
          {isPlaying ? 'Pause' : 'Play'}
        </button>

        <button
          onClick={handleStop}
          title="Stop"
        >
          Stop
        </button>

        <button
          onClick={handleRecord}
          disabled={isPlaying}
          className={isRecording ? 'active recording' : ''}
          title={isRecording ? 'Stop Recording' : 'Record'}
        >
          {isRecording ? 'Stop Rec' : 'Record'}
        </button>

        <button
          onClick={handleReset}
          title="Reset"
        >
          Reset
        </button>
      </div>

      <div className="bpm-control">
        <button onClick={handleBpmDecrease} title="Decrease BPM">-</button>
        <span className="bpm-value">{bpm}</span>
        <button onClick={handleBpmIncrease} title="Increase BPM">+</button>
        <input
          type="range"
          min="40"
          max="300"
          value={bpm}
          onChange={handleBpmChange}
          className="bpm-slider"
        />
      </div>

      <div className="status-indicators">
        {isPlaying && <span className="status playing">Playing</span>}
        {isRecording && <span className="status recording">Recording</span>}
        <span className="status bpm">BPM: {bpm}</span>
      </div>
    </div>
  );
};

export default TransportControls;
