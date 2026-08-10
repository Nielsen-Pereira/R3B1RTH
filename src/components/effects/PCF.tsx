import React, { useState } from 'react';
import { useAudioStore } from '../../store';

interface PCFProps { id: number; }

export const PCF: React.FC<PCFProps> = ({ id }) => {
  const [wet, setWet] = useState<number>(0.5);
  const [delayTime, setDelayTime] = useState<number>(0.003);
  const [feedback, setFeedback] = useState<number>(0.5);
  const [enabled, setEnabled] = useState<boolean>(true);
  const { setPCFWet, setPCFDelayTime, setPCFFeedback } = useAudioStore();

  const handleWetChange = (value: number) => { setWet(value); setPCFWet(id, value); };
  const handleDelayTimeChange = (value: number) => { setDelayTime(value); setPCFDelayTime(id, value); };
  const handleFeedbackChange = (value: number) => { setFeedback(value); setPCFFeedback(id, value); };
  const handleEnableToggle = () => { setEnabled(!enabled); };

  return (
    <div className="effect pcf">
      <div className="effect-header"><h4>PCF {id + 1}</h4><button onClick={handleEnableToggle} className={enabled ? 'active' : ''}>{enabled ? 'ON' : 'OFF'}</button></div>
      <div className="effect-controls">
        <div className="control-group"><label>Wet/Dry</label><input type="range" min="0" max="1" step="0.01" value={wet} onChange={(e) => handleWetChange(parseFloat(e.target.value))} /><span className="value">{Math.round(wet * 100)}%</span></div>
        <div className="control-group"><label>Delay Time</label><input type="range" min="0.001" max="0.02" step="0.0001" value={delayTime} onChange={(e) => handleDelayTimeChange(parseFloat(e.target.value))} /><span className="value">{delayTime.toFixed(4)}s</span></div>
        <div className="control-group"><label>Feedback</label><input type="range" min="0" max="0.99" step="0.01" value={feedback} onChange={(e) => handleFeedbackChange(parseFloat(e.target.value))} /><span className="value">{Math.round(feedback * 100)}%</span></div>
      </div>
      <div className="effect-visualizer"><svg width="100%" height="40" viewBox="0 0 200 40"><path d={`M0,20 Q50,${20 - wet * 15} 100,20 T200,20`} stroke="#55ff55" strokeWidth="2" fill="none" /><circle cx="100" cy="20" r="3" fill="#55ff55" /></svg></div>
    </div>
  );
};

export default PCF;
