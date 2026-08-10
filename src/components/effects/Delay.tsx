import React, { useState } from 'react';
import { useAudioStore } from '../../store';

interface DelayProps { id: number; }

export const Delay: React.FC<DelayProps> = ({ id }) => {
  const [wet, setWet] = useState<number>(0.5);
  const [delayTime, setDelayTime] = useState<number>(0.3);
  const [feedback, setFeedback] = useState<number>(0.5);
  const [enabled, setEnabled] = useState<boolean>(true);
  const { setDelayWet, setDelayTime, setDelayFeedback } = useAudioStore();

  const handleWetChange = (value: number) => { setWet(value); setDelayWet(id, value); };
  const handleDelayTimeChange = (value: number) => { setDelayTime(value); setDelayTime(id, value); };
  const handleFeedbackChange = (value: number) => { setFeedback(value); setDelayFeedback(id, value); };
  const handleEnableToggle = () => { setEnabled(!enabled); };

  return (
    <div className="effect delay">
      <div className="effect-header"><h4>Delay {id + 1}</h4><button onClick={handleEnableToggle} className={enabled ? 'active' : ''}>{enabled ? 'ON' : 'OFF'}</button></div>
      <div className="effect-controls">
        <div className="control-group"><label>Wet/Dry</label><input type="range" min="0" max="1" step="0.01" value={wet} onChange={(e) => handleWetChange(parseFloat(e.target.value))} /><span className="value">{Math.round(wet * 100)}%</span></div>
        <div className="control-group"><label>Delay Time</label><input type="range" min="0.01" max="1" step="0.01" value={delayTime} onChange={(e) => handleDelayTimeChange(parseFloat(e.target.value))} /><span className="value">{delayTime.toFixed(2)}s</span></div>
        <div className="control-group"><label>Feedback</label><input type="range" min="0" max="0.99" step="0.01" value={feedback} onChange={(e) => handleFeedbackChange(parseFloat(e.target.value))} /><span className="value">{Math.round(feedback * 100)}%</span></div>
      </div>
      <div className="effect-visualizer"><svg width="100%" height="40" viewBox="0 0 200 40"><path d="M0,20 L50,20 L75,5 L100,20 L125,35 L150,20 L175,5 L200,20" stroke="#5555ff" strokeWidth="2" fill="none" /><circle cx="75" cy="5" r="2" fill="#5555ff" /><circle cx="125" cy="35" r="2" fill="#5555ff" /><circle cx="175" cy="5" r="2" fill="#5555ff" /></svg></div>
    </div>
  );
};

export default Delay;
