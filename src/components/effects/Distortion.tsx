import React, { useState } from 'react';
import { useAudioStore } from '../../store';

interface DistortionProps { id: number; }

export const Distortion: React.FC<DistortionProps> = ({ id }) => {
  const [drive, setDrive] = useState<number>(0.5);
  const [enabled, setEnabled] = useState<boolean>(true);
  const { setDistortionDrive } = useAudioStore();

  const handleDriveChange = (value: number) => { setDrive(value); setDistortionDrive(id, value); };
  const handleEnableToggle = () => { setEnabled(!enabled); };

  return (
    <div className="effect distortion">
      <div className="effect-header"><h4>Distortion {id + 1}</h4><button onClick={handleEnableToggle} className={enabled ? 'active' : ''}>{enabled ? 'ON' : 'OFF'}</button></div>
      <div className="effect-controls">
        <div className="control-group">
          <label>Drive</label>
          <input type="range" min="0" max="1" step="0.01" value={drive} onChange={(e) => handleDriveChange(parseFloat(e.target.value))} />
          <span className="value">{Math.round(drive * 100)}%</span>
        </div>
      </div>
      <div className="effect-visualizer">
        <svg width="100%" height="40" viewBox="0 0 200 40"><path d={`M0,20 Q50,${20 - drive * 15} 100,20 T200,20`} stroke="#ff5555" strokeWidth="2" fill="none" /></svg>
      </div>
    </div>
  );
};

export default Distortion;
