import React from 'react';
import { useAudioStore } from '../../store/audioStore';

interface CompressorProps { effectIndex: number; }

const Compressor: React.FC<CompressorProps> = ({ effectIndex }) => {
  const { setCompressorThreshold } = useAudioStore();
  const { compressor } = useAudioStore();
  const settings = compressor[effectIndex];

  const handleThresholdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const threshold = parseFloat(e.target.value);
    setCompressorThreshold(effectIndex, threshold);
  };

  return (
    <div className="effect compressor">
      <h4>Compressor #{effectIndex + 1}</h4>
      <div className="control">
        <label>Threshold: <input type="range" min="-60" max="0" step="1" value={settings.threshold} onChange={handleThresholdChange} /> {settings.threshold} dB</label>
      </div>
      <div className="control">
        <label>Ratio: <input type="range" min="1" max="20" step="0.1" value={settings.ratio} onChange={(e) => {}} /> {settings.ratio}:1</label>
      </div>
    </div>
  );
};

export default Compressor;