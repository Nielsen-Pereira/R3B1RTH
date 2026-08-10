import React from 'react';
import { useAudioStore } from '../../store/audioStore';

interface DistortionProps { effectIndex: number; }

const Distortion: React.FC<DistortionProps> = ({ effectIndex }) => {
  const { setDistortionDrive } = useAudioStore();
  const { distortion } = useAudioStore();
  const settings = distortion[effectIndex];

  const handleDriveChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const drive = parseFloat(e.target.value);
    setDistortionDrive(effectIndex, drive);
  };

  return (
    <div className="effect distortion">
      <h4>Distortion #{effectIndex + 1}</h4>
      <div className="control">
        <label>Drive: <input type="range" min="0" max="1" step="0.01" value={settings.drive} onChange={handleDriveChange} /> {settings.drive.toFixed(2)}</label>
      </div>
    </div>
  );
};

export default Distortion;