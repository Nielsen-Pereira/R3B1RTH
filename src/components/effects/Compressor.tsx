import React from 'react';
import { useAudioEffectsStore } from '../../stores/audioEffectsStore';

interface CompressorProps { effectIndex: number; }

const Compressor: React.FC<CompressorProps> = ({ effectIndex }) => {
  const store = useAudioEffectsStore();
  const state = store();

  const handleThresholdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const threshold = parseFloat(e.target.value);
    store.setEffectParameter('compressor', 'threshold', threshold);
  };

  const handleRatioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const ratio = parseFloat(e.target.value);
    store.setEffectParameter('compressor', 'ratio', ratio);
  };

  const handleAttackChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const attack = parseFloat(e.target.value);
    store.setEffectParameter('compressor', 'attack', attack);
  };

  const handleReleaseChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const release = parseFloat(e.target.value);
    store.setEffectParameter('compressor', 'release', release);
  };

  return (
    <div className="effect compressor">
      <h4>Compressor #{effectIndex + 1}</h4>
      <div className="control">
        <label>Threshold: <input type="range" min="-60" max="0" step="1" value={state.compressor.parameters.threshold} onChange={handleThresholdChange} /> {state.compressor.parameters.threshold} dB</label>
      </div>
      <div className="control">
        <label>Ratio: <input type="range" min="1" max="20" step="0.1" value={state.compressor.parameters.ratio} onChange={handleRatioChange} /> {state.compressor.parameters.ratio}:1</label>
      </div>
      <div className="control">
        <label>Attack: <input type="range" min="0" max="1" step="0.01" value={state.compressor.parameters.attack} onChange={handleAttackChange} /> {state.compressor.parameters.attack.toFixed(2)}s</label>
      </div>
      <div className="control">
        <label>Release: <input type="range" min="0" max="1" step="0.01" value={state.compressor.parameters.release} onChange={handleReleaseChange} /> {state.compressor.parameters.release.toFixed(2)}s</label>
      </div>
    </div>
  );
};

export default Compressor;
