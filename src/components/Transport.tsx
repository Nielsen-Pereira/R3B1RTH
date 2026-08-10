import React, { useState, useEffect } from 'react';
import { useAudioStore, useSequencerStore } from '../store';

export const Transport: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [bpm, setBpm] = useState<number>(120);
  const [currentBeat, setCurrentBeat] = useState<number>(0);
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [tempoInput, setTempoInput] = useState<string>('120');
  const { start: startAudio, stop: stopAudio, setBPM, getCurrentBeat } = useAudioStore();
  const { globalSettings, setGlobalSetting } = useSequencerStore();

  useEffect(() => {
    const interval = setInterval(() => {
      if (isPlaying) { const beat = getCurrentBeat(); setCurrentBeat(beat); setCurrentStep(beat % 16); }
    }, 50);
    return () => clearInterval(interval);
  }, [isPlaying]);

  const handlePlay = () => { if (!isPlaying) { startAudio(); setIsPlaying(true); } };
  const handleStop = () => { if (isPlaying) { stopAudio(); setIsPlaying(false); setCurrentStep(0); } };
  const handleBpmSubmit = (e: React.FormEvent) => { e.preventDefault(); const newBpm = parseInt(tempoInput) || 120; setBpm(Math.min(Math.max(newBpm, 20), 300)); setBPM(newBpm); setGlobalSetting('bpm', newBpm); };
  const handleBpmIncrease = () => { const newBpm = bpm + 1; setBpm(Math.min(newBpm, 300)); setBPM(newBpm); setTempoInput(newBpm.toString()); setGlobalSetting('bpm', newBpm); };
  const handleBpmDecrease = () => { const newBpm = bpm - 1; setBpm(Math.max(newBpm, 20)); setBPM(newBpm); setTempoInput(newBpm.toString()); setGlobalSetting('bpm', newBpm); };

  return (
    <div className="transport">
      <div className="transport-controls">
        <button onClick={handleStop} className="transport-button stop" disabled={!isPlaying}>Stop</button>
        <button onClick={handlePlay} className="transport-button play" disabled={isPlaying}>Play</button>
        <div className="bpm-control">
          <button onClick={handleBpmDecrease} className="bpm-adjust">-</button>
          <form onSubmit={handleBpmSubmit}><input type="number" value={tempoInput} onChange={(e) => setTempoInput(e.target.value)} min="20" max="300" className="bpm-input" /></form>
          <button onClick={handleBpmIncrease} className="bpm-adjust">+</button><span className="bpm-label">BPM</span>
        </div>
      </div>
      <div className="transport-display">
        <div className="beat-indicator"><span className="current-beat">{currentBeat + 1}</span><span className="beat-divider">/</span><span className="total-beats">16</span></div>
        <div className="step-indicator">Step: {currentStep + 1}</div>
        <div className="step-leds">{Array.from({ length: 16 }).map((_, i) => <div key={i} className={`led ${i === currentStep ? 'active' : ''} ${i % 4 === 0 ? 'strong' : ''}`} />)}</div>
      </div>
      <div className="transport-status"><span className={`status-indicator ${isPlaying ? 'playing' : 'stopped'}`}>{isPlaying ? 'Playing' : 'Stopped'}</span></div>
    </div>
  );
};

export default Transport;
