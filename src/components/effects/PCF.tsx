import React from 'react';
import { useAudioStore } from '../../store/audioStore';

interface PCFProps { effectIndex: number; }

const PCF: React.FC<PCFProps> = ({ effectIndex }) => {
  const { setPCFWet, setPCFDelayTime, setPCFFeedback } = useAudioStore();
  const { pcf } = useAudioStore();
  const settings = pcf[effectIndex];

  const handleWetChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const wet = parseFloat(e.target.value);
    setPCFWet(effectIndex, wet);
  };

  const handleDelayTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    setPCFDelayTime(effectIndex, time);
  };

  const handleFeedbackChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const feedback = parseFloat(e.target.value);
    setPCFFeedback(effectIndex, feedback);
  };

  return (
    <div className="effect pcf">
      <h4>PCF #{effectIndex + 1}</h4>
      <div className="control">
        <label>Wet: <input type="range" min="0" max="1" step="0.01" value={settings.wet} onChange={handleWetChange} /> {settings.wet.toFixed(2)}</label>
      </div>
      <div className="control">
        <label>Delay Time: <input type="range" min="0" max="0.1" step="0.001" value={settings.delayTime} onChange={handleDelayTimeChange} /> {settings.delayTime.toFixed(3)}s</label>
      </div>
      <div className="control">
        <label>Feedback: <input type="range" min="0" max="1" step="0.01" value={settings.feedback} onChange={handleFeedbackChange} /> {settings.feedback.toFixed(2)}</label>
      </div>
    </div>
  );
};

export default PCF;