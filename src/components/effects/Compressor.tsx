import React, { useState } from 'react';
import { useAudioStore } from '../../store';

interface CompressorProps { id: number; }

export const Compressor: React.FC<CompressorProps> = ({ id }) => {
  const [threshold, setThreshold] = useState<number>(-20);
  const [ratio, setRatio] = useState<number>(4);
  const [attack, setAttack] = useState<number>(0.01);
  const [release, setRelease] = useState<number>(0.1);
  const [enabled, setEnabled] = useState<boolean>(true);
  const { setCompressorThreshold } = useAudioStore();

  const handleThresholdChange = (value: number) => { setThreshold(value); setCompressorThreshold(id, value); };
  const handleEnableToggle = () => { setEnabled(!enabled); };

  return (
    <div className="effect compressor">
      <div className="effect-header"><h4>Compressor {id + 1}</h4><button onClick={handleEnableToggle} className={enabled ? 'active' : ''}>{enabled ? 'ON' : 'OFF'}</button></div>
      <div className="effect-controls">
        <div className="control-group"><label>Threshold</label><input type="range" min="-60" max="0" step="1" value={threshold} onChange={(e) => handleThresholdChange(parseInt(e.target.value))} /><span className="value">{threshold} dB</span></div>
        <div className="control-group"><label>Ratio</label><input type="range" min="1" max="20" step="0.1" value={ratio} onChange={(e) => setRatio(parseFloat(e.target.value))} /><span className="value">{ratio}:1</span></div>
        <div className="control-group"><label>Attack</label><input type="range" min="0.001" max="0.1" step="0.001" value={attack} onChange={(e) => setAttack(parseFloat(e.target.value))} /><span className="value">{attack}ms</span></div>
        <div className="control-group"><label>Release</label><input type="range" min="0.01" max="1" step="0.01" value={release} onChange={(e) => setRelease(parseFloat(e.target.value))} /><span className="value">{release}ms</span></div>
      </div>
      <div className="effect-visualizer"><svg width="100%" height="40" viewBox="0 0 200 40"><path d="M0,20 L50,5 L100,20 L150,35 L200,20" stroke="#ffff55" strokeWidth="2" fill="none" /><line x1="0" y1={20 + threshold} x2="200" y2={20 + threshold} stroke="#ffff55" strokeWidth="1" strokeDasharray="5,5" /></svg></div>
    </div>
  );
};

export default Compressor;
