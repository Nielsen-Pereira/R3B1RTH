import React from 'react';
import Distortion from './Distortion';
import PCF from './PCF';
import Compressor from './Compressor';
import Delay from './Delay';

interface EffectsSectionProps { effectIndex: number; name: string; }

export const EffectsSection: React.FC<EffectsSectionProps> = ({ effectIndex, name }) => {
  return (
    <div className="effects-section">
      <div className="section-header"><h3>{name}</h3></div>
      <div className="effects-grid">
        <div className="effect-row"><Distortion effectIndex={effectIndex} /><PCF effectIndex={effectIndex} /></div>
        <div className="effect-row"><Compressor effectIndex={effectIndex} /><Delay effectIndex={effectIndex} /></div>
      </div>
    </div>
  );
};

export default EffectsSection;
