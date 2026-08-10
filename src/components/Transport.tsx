import React from 'react';
import { useAudioStore } from '../store/audioStore';
import { useSequencerStore } from '../store/sequencerStore';
import { useSwingStore } from '../store/swingStore';

interface TransportProps {
  onPatternChange?: (patternIndex: number) => void;
}

const Transport: React.FC<TransportProps> = ({ onPatternChange }) => {
  const { start, stop, setBPM, setMasterVolume, transport } = useAudioStore();
  const { setGlobalSetting, currentPattern, setCurrentPattern } = useSequencerStore();
  const { setSwingAmount, setSwingEnabled, swingAmount, swingEnabled } = useSwingStore();

  const handlePlay = () => { start(); };
  const handleStop = () => { stop(); };
  const handleBPMChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const bpm = parseInt(e.target.value) || 120;
    setBPM(bpm);
    setGlobalSetting('bpm', bpm);
  };
  const handleSwingChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const swing = parseFloat(e.target.value) || 0;
    setSwingAmount(swing);
    setSwingEnabled(swing > 0);
    setGlobalSetting('swing', swing);
  };
  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const volume = parseFloat(e.target.value) || 0.7;
    setMasterVolume(volume);
  };
  const handlePatternChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const patternIndex = parseInt(e.target.value);
    setCurrentPattern(patternIndex);
    if (onPatternChange) onPatternChange(patternIndex);
  };

  return (
    <section className="transport-controls">
      <h2>Transport</h2>
      <div className="control-group">
        <button onClick={handlePlay} disabled={transport.isPlaying}>Play</button>
        <button onClick={handleStop} disabled={!transport.isPlaying}>Stop</button>
      </div>
      <div className="control-group">
        <label>BPM: <input type="range" min="40" max="200" value={transport.bpm} onChange={handleBPMChange} /> {transport.bpm}</label>
      </div>
      <div className="control-group">
        <label>Swing: <input type="range" min="0" max="1" step="0.1" value={swingAmount} onChange={handleSwingChange} /> {swingAmount.toFixed(1)}</label>
      </div>
      <div className="control-group">
        <label>Volume: <input type="range" min="0" max="1" step="0.01" value={transport.isPlaying ? 0.7 : 0.7} onChange={handleVolumeChange} /></label>
      </div>
      <div className="control-group">
        <label>Pattern: <select value={currentPattern} onChange={handlePatternChange}>
          {Array.from({ length: 32 }, (_, i) => <option key={i} value={i}>Pattern {i + 1}</option>)}
        </select></label>
      </div>
    </section>
  );
};

export default Transport;