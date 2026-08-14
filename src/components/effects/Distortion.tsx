import React from 'react';
import { useAudioEffectsStore } from '../../stores/audioEffectsStore';

interface DistortionProps { effectIndex: number; }

const Distortion: React.FC<DistortionProps> = ({ effectIndex }) => {
  const store = useAudioEffectsStore();
  const state = store();

  const handleDriveChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const drive = parseFloat(e.target.value);
    store.setEffectParameter('distortion', 'drive', drive);
  };

  const handleToneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const tone = parseFloat(e.target.value);
    store.setEffectParameter('distortion', 'tone', tone);
  };

  return (
    <div className="effect distortion">
      <h4>Distortion #{effectIndex + 1}</h4>
      <div className="control">
        <label>Drive: <input type="range" min="0" max="1" step="0.01" value={state.distortion.parameters.drive} onChange={handleDriveChange} /> {state.distortion.parameters.drive.toFixed(2)}</label>
      </div>
      <div className="control">
        <label>Tone: <input type="range" min="0" max="1" step="0.01" value={state.distortion.parameters.tone} onChange={handleToneChange} /> {state.distortion.parameters.tone.toFixed(2)}</label>
      </div>
    </div>
  );
};

export default Distortion;
