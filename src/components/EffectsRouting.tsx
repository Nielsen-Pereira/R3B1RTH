import React from 'react';
import { useAudioEffectsStore } from '../stores/audioEffectsStore';

type InstrumentType = 'tb303' | 'tr808' | 'tr909';

interface EffectsRoutingProps {
  instrument: InstrumentType;
}

const effectTypes = ['distortion', 'pcf', 'compressor', 'delay'] as const;
type EffectType = typeof effectTypes[number];

export const EffectsRouting: React.FC<EffectsRoutingProps> = ({ instrument }) => {
  const { getInstrumentRouting, setInstrumentRouting } = useAudioEffectsStore();

  const routing = getInstrumentRouting(instrument);

  const handleRoutingChange = (
    effect: EffectType,
    routingType: 'insert' | 'send',
    enabled: boolean
  ) => {
    const newRouting = {
      ...routing,
      [routingType]: enabled
        ? [...routing[routingType], effect]
        : routing[routingType].filter((e) => e !== effect),
    };
    setInstrumentRouting(instrument, newRouting);
  };

  return (
    <div className="effects-routing">
      <h3>{instrument.toUpperCase()} Effects</h3>
      <div className="routing-grid">
        {effectTypes.map((effect) => (
          <div key={effect} className="routing-row">
            <span className="routing-label">{effect}:</span>
            <select
              className="routing-select"
              value={routing.insert.includes(effect) ? 'insert' : routing.send.includes(effect) ? 'send' : 'none'}
              onChange={(e) => {
                handleRoutingChange(effect, 'insert', e.target.value === 'insert');
                handleRoutingChange(effect, 'send', e.target.value === 'send');
              }}
            >
              <option value="none">None</option>
              <option value="insert">INSERT</option>
              <option value="send">SEND</option>
            </select>
          </div>
        ))}
      </div>
      <div className="effects-info">
        INSERT: Series routing | SEND: Parallel routing
      </div>
    </div>
  );
};

export const MasterEffectsRouting: React.FC = () => {
  const { getMasterRouting, setMasterRouting } = useAudioEffectsStore();

  const routing = getMasterRouting();

  const handleRoutingChange = (
    effect: EffectType,
    routingType: 'insert' | 'send',
    enabled: boolean
  ) => {
    const newRouting = {
      ...routing,
      [routingType]: enabled
        ? [...routing[routingType], effect]
        : routing[routingType].filter((e) => e !== effect),
    };
    setMasterRouting(newRouting);
  };

  return (
    <div className="effects-routing">
      <h3>Master Effects Routing</h3>
      <div className="routing-grid">
        {effectTypes.map((effect) => (
          <div key={effect} className="routing-row">
            <span className="routing-label">{effect}:</span>
            <select
              className="routing-select"
              value={routing.insert.includes(effect) ? 'insert' : routing.send.includes(effect) ? 'send' : 'none'}
              onChange={(e) => {
                handleRoutingChange(effect, 'insert', e.target.value === 'insert');
                handleRoutingChange(effect, 'send', e.target.value === 'send');
              }}
            >
              <option value="none">None</option>
              <option value="insert">INSERT</option>
              <option value="send">SEND</option>
            </select>
          </div>
        ))}
      </div>
      <div className="effects-info">
        INSERT: Series routing | SEND: Parallel routing
      </div>
    </div>
  );
};

export default EffectsRouting;