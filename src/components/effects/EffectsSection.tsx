import React from 'react';
import Distortion from './Distortion';
import PCF from './PCF';
import Compressor from './Compressor';
import Delay from './Delay';

interface EffectsSectionProps { id: number; name: string; }

export const EffectsSection: React.FC<EffectsSectionProps> = ({ id, name }) => {
  return (
    <div className="effects-section">
      <div className="section-header"><h3>{name}</h3></div>
      <div className="effects-grid">
        <div className="effect-row"><Distortion id={id} /><PCF id={id} /></div>
        <div className="effect-row"><Compressor id={id} /><Delay id={id} /></div>
      </div>
    </div>
  );
};

export default EffectsSection;
