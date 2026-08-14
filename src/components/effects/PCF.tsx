import React from 'react';
import { useAudioEffectsStore } from '../../stores/audioEffectsStore';

interface PCFProps { effectIndex: number; }

const PCF: React.FC<PCFProps> = ({ effectIndex }) => {
  const store = useAudioEffectsStore();
  const state = store();

  const handleCutoffChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const cutoff = parseFloat(e.target.value);
    store.setEffectParameter('pcf', 'cutoff', cutoff);
  };

  const handleResonanceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const resonance = parseFloat(e.target.value);
    store.setEffectParameter('pcf', 'resonance', resonance);
  };

  return (
    <div className="effect pcf">
      <h4>PCF #{effectIndex + 1}</h4>
      <div className="control">
        <label>Cutoff: <input type="range" min="0" max="1" step="0.01" value={state.pcf.parameters.cutoff} onChange={handleCutoffChange} /> {state.pcf.parameters.cutoff.toFixed(2)}</label>
      </div>
      <div className="control">
        <label>Resonance: <input type="range" min="0" max="1" step="0.01" value={state.pcf.parameters.resonance} onChange={handleResonanceChange} /> {state.pcf.parameters.resonance.toFixed(2)}</label>
      </div>
    </div>
  );
};

export default PCF;
