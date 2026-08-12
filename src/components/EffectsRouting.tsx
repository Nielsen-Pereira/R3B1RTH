import React from 'react';
import { useAudioEffectsStore } from '../stores/audioEffectsStore';
import { EffectType, InstrumentType, EffectRouting } from '../types/effectTypes';
import './EffectsRouting.css';

interface EffectsRoutingProps {
  instrument: InstrumentType;
}

const EffectsRouting: React.FC<EffectsRoutingProps> = ({ instrument }) => {
  const store = useAudioEffectsStore();
  const routing = store.getInstrumentRouting(instrument);
  const allEffects: EffectType[] = ['distortion', 'pcf', 'compressor', 'delay'];

  const getLabel = (effect: EffectType) => {
    const labels = { distortion: 'Distortion', pcf: 'PCF Filter', compressor: 'Compressor', delay: 'Delay' };
    return labels[effect];
  };

  const getInstLabel = (inst: InstrumentType) => {
    const labels = { tb303: 'TB-303', tr808: 'TR-808', tr909: 'TR-909', master: 'Master' };
    return labels[inst];
  };

  const available = allEffects.filter(e => !routing.insert.includes(e) && !routing.send.includes(e));

  return (
    <div className="effects-routing">
      <div className="routing-header">
        <h3 className="instrument-title">{getInstLabel(instrument)} Effects Routing</h3>
        <button className="reset-button" onClick={() => store.resetInstrumentRouting(instrument)}>
          Reset
        </button>
      </div>

      <div className="routing-grid">
        <EffectChain
          title="INSERT"
          info="(Series)"
          effects={routing.insert}
          available={available}
          onAdd={(e) => store.addEffectToInsert(instrument, e)}
          onMove={(e) => store.moveEffectToSend(instrument, e)}
          onRemove={(e) => store.removeEffectFromInsert(instrument, e)}
          getLabel={getLabel}
        />
        <EffectChain
          title="SEND"
          info="(Parallel)"
          effects={routing.send}
          available={available}
          onAdd={(e) => store.addEffectToSend(instrument, e)}
          onMove={(e) => store.moveEffectToInsert(instrument, e)}
          onRemove={(e) => store.removeEffectFromSend(instrument, e)}
          getLabel={getLabel}
        />
      </div>

      <div className="available-effects">
        <h4>Available Effects</h4>
        <div className="effects-palette">
          {allEffects.map(e => {
            const inInsert = routing.insert.includes(e);
            const inSend = routing.send.includes(e);
            const cls = inInsert || inSend ? 'effect-palette-item used' : 'effect-palette-item';
            return (
              <div key={e} className={cls}>
                <span className="effect-name">{getLabel(e)}</span>
                {inInsert && <span className="status-badge insert">INSERT</span>}
                {inSend && <span className="status-badge send">SEND</span>}
              </div>
            );
          })}
        </div>
      </div>

      <div className="routing-info">
        <div className="info-box"><strong>INSERT:</strong> Series processing</div>
        <div className="info-box"><strong>SEND:</strong> Parallel processing</div>
      </div>
    </div>
  );
};

interface EffectChainProps {
  title: string;
  info: string;
  effects: EffectType[];
  available: EffectType[];
  onAdd: (e: EffectType) => void;
  onMove: (e: EffectType) => void;
  onRemove: (e: EffectType) => void;
  getLabel: (e: EffectType) => string;
}

const EffectChain: React.FC<EffectChainProps> = ({ title, info, effects, available, onAdd, onMove, onRemove, getLabel }) => {
  return (
    <div className="routing-chain">
      <div className="chain-header">
        <span className="chain-label">{title}</span>
        <span className="chain-info">{info}</span>
      </div>
      <div className="effects-list">
        {effects.length > 0 ? (
          effects.map((e, i) => (
            <div key={e} className="effect-item in-chain">
              <span className="effect-name">{getLabel(e)}</span>
              <span className="effect-position">{i + 1}</span>
              <button className="move-button" onClick={() => onMove(e)}>Move</button>
              <button className="remove-button" onClick={() => onRemove(e)}>X</button>
            </div>
          ))
        ) : <div className="empty-state">No effects in {title}</div>}
      </div>
      <div className="add-section">
        <select className="effect-select" defaultValue="" onChange={(ev) => {
          const e = ev.target.value as EffectType;
          if (e) { onAdd(e); ev.target.value = ''; }
        }}>
          <option value="" disabled>Add to {title}...</option>
          {available.map(e => <option key={e} value={e}>{getLabel(e)}</option>)}
        </select>
      </div>
    </div>
  );
};

export const MasterEffectsRouting: React.FC = () => {
  const [activeInst, setActiveInst] = React.useState<InstrumentType>('tb303');
  const insts: InstrumentType[] = ['tb303', 'tr808', 'tr909', 'master'];
  return (
    <div className="master-effects-routing">
      <div className="instrument-tabs">
        {insts.map(i => (
          <button key={i} className={"instrument-tab " + (activeInst === i ? 'active' : '')} onClick={() => setActiveInst(i)}>
            {i.toUpperCase()}
          </button>
        ))}
      </div>
      <EffectsRouting instrument={activeInst} />
    </div>
  );
};

export default EffectsRouting;