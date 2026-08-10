import React from 'react';
import { useAudioStore } from '../../store/audioStore';

interface DelayProps { effectIndex: number; }

const Delay: React.FC<DelayProps> = ({ effectIndex }) => {
  const { setDelayWet, setDelayTime, setDelayFeedback } = useAudioStore();
  const { delay } = useAudioStore();
  const settings = delay[effectIndex];

  const handleWetChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const wet = parseFloat(e.target.value);
    setDelayWet(effectIndex, wet);
  };

  const handleDelayTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    setDelayTime(effectIndex, time);
  };

  const handleFeedbackChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const feedback = parseFloat(e.target.value);
    setDelayFeedback(effectIndex, feedback);
  };

  return (
    <div className="effect delay">
      <h4>Delay #{effectIndex + 1}</h4>
      <div className="control">
        <label>Wet: <input type="range" min="0" max="1" step="0.01" value={settings.wet} onChange={handleWetChange} /> {settings.wet.toFixed(2)}</label>
      </div>
      <div className="control">
        <label>Delay Time: <input type="range" min="0" max="2" step="0.01" value={settings.delayTime} onChange={handleDelayTimeChange} /> {settings.delayTime.toFixed(2)}s</label>
      </div>
      <div className="control">
        <label>Feedback: <input type="range" min="0" max="1" step="0.01" value={settings.feedback} onChange={handleFeedbackChange} /> {settings.feedback.toFixed(2)}</label>
      </div>
    </div>
  );
};

export default Delay;