import React from 'react';
import { useAudioEffectsStore } from '../../stores/audioEffectsStore';

interface DelayProps { effectIndex: number; }

const Delay: React.FC<DelayProps> = ({ effectIndex }) => {
  const store = useAudioEffectsStore();
  const state = store();

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    store.setEffectParameter('delay', 'time', time);
  };

  const handleFeedbackChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const feedback = parseFloat(e.target.value);
    store.setEffectParameter('delay', 'feedback', feedback);
  };

  return (
    <div className="effect delay">
      <h4>Delay #{effectIndex + 1}</h4>
      <div className="control">
        <label>Delay Time: <input type="range" min="0" max="2" step="0.01" value={state.delay.parameters.time} onChange={handleTimeChange} /> {state.delay.parameters.time.toFixed(2)}s</label>
      </div>
      <div className="control">
        <label>Feedback: <input type="range" min="0" max="1" step="0.01" value={state.delay.parameters.feedback} onChange={handleFeedbackChange} /> {state.delay.parameters.feedback.toFixed(2)}</label>
      </div>
    </div>
  );
};

export default Delay;
