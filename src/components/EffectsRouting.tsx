import React from 'react';
import { useAudioEffectsStore, getEffectConfig, EffectType } from '../stores/audioEffectsStore';

export const EffectsRouting: React.FC = () => {
  const store = useAudioEffectsStore();
  const state = store();
  const effects: EffectType[] = ['distortion', 'pcf', 'compressor', 'delay'];

  return (
    <div className="effects-routing">
      <h3>Effects Routing</h3>
      <div className="effects-grid">
        {effects.map(effect => {
          const config = getEffectConfig(state, effect);
          return (
            <div key={effect} className="effect-card">
              <h4>{effect}</h4>
              <button onClick={() => store.toggleEffect(effect, !config.enabled)}>
                {config.enabled ? 'ON' : 'OFF'}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default EffectsRouting;