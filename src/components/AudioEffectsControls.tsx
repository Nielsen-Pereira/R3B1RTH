/**
 * Audio Effects Controls Component - Batch 1 Development
 * R3B-94: Audio Effects Routing & Completion
 * 
 * Component for controlling and routing audio effects
 */

import React from 'react';
import { useAudioEffectsStore, getEffectConfig, getInstrumentRouting } from '../stores/audioEffectsStore';

type InstrumentType = 'tb303' | 'tr808' | 'tr909';

export const AudioEffectsControls: React.FC = () => {
  const {
    distortion,
    pcf,
    compressor,
    delay,
    setEffectConfig,
    toggleEffect,
    setInstrumentRouting,
    setMasterRouting,
  } = useAudioEffectsStore();

  const instruments: InstrumentType[] = ['tb303', 'tr808', 'tr909'];
  const effects = ['distortion', 'pcf', 'compressor', 'delay'] as const;

  const handleToggleEffect = (effect: typeof effects[number]) => {
    toggleEffect(effect, !getEffectConfig({ distortion, pcf, compressor, delay }, effect).enabled);
  };

  const handleEffectParamChange = (
    effect: typeof effects[number],
    param: string,
    value: number
  ) => {
    setEffectConfig(effect, {
      parameters: {
        ...getEffectConfig({ distortion, pcf, compressor, delay }, effect).parameters,
        [param]: value,
      },
    });
  };

  const handleRoutingChange = (
    instrument: InstrumentType | 'master',
    effect: typeof effects[number],
    routingType: 'insert' | 'send',
    enabled: boolean
  ) => {
    const currentRouting = instrument === 'master'
      ? getEffectConfig({ distortion, pcf, compressor, delay, tb303Routing: { insert: [], send: [] }, tr808Routing: { insert: [], send: [] }, tr909Routing: { insert: [], send: [] }, masterRouting: { insert: [], send: [] } }, 'masterRouting')
      : getInstrumentRouting({ distortion, pcf, compressor, delay, tb303Routing: { insert: [], send: [] }, tr808Routing: { insert: [], send: [] }, tr909Routing: { insert: [], send: [] }, masterRouting: { insert: [], send: [] } }, instrument);

    const newRouting = {
      ...currentRouting,
      [routingType]: enabled
        ? [...currentRouting[routingType], effect]
        : currentRouting[routingType].filter((e) => e !== effect),
    };

    if (instrument === 'master') {
      setMasterRouting(newRouting);
    } else {
      setInstrumentRouting(instrument, newRouting);
    }
  };

  return (
    <div className="audio-effects-controls">
      <h2>Audio Effects</h2>

      <div className="effects-grid">
        {effects.map((effect) => {
          const config = getEffectConfig({ distortion, pcf, compressor, delay }, effect);
          return (
            <div key={effect} className="effect-panel">
              <h3>
                {effect.charAt(0).toUpperCase() + effect.slice(1)}
                <button onClick={() => handleToggleEffect(effect)}>
                  {config.enabled ? 'ON' : 'OFF'}
                </button>
              </h3>

              <div className="effect-params">
                {Object.entries(config.parameters).map(([param, value]) => (
                  <div key={param} className="param-control">
                    <label>{param}</label>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.01"
                      value={value}
                      onChange={(e) =>
                        handleEffectParamChange(effect, param, parseFloat(e.target.value))
                      }
                    />
                    <span>{value.toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <div className="routing-controls">
        <h3>Effect Routing</h3>
        <p>Configure INSERT (series) or SEND (parallel) routing per instrument</p>

        <table>
          <thead>
            <tr>
              <th>Effect</th>
              {instruments.map((inst) => (
                <th key={inst}>{inst.toUpperCase()}</th>
              ))}
              <th>Master</th>
            </tr>
          </thead>
          <tbody>
            {effects.map((effect) => (
              <tr key={effect}>
                <td>{effect}</td>
                {instruments.map((instrument) => {
                  const routing = getInstrumentRouting({ distortion, pcf, compressor, delay, tb303Routing: { insert: [], send: [] }, tr808Routing: { insert: [], send: [] }, tr909Routing: { insert: [], send: [] }, masterRouting: { insert: [], send: [] } }, instrument);
                  return (
                    <td key={instrument}>
                      <select
                        value={routing.insert.includes(effect) ? 'insert' : routing.send.includes(effect) ? 'send' : 'none'}
                        onChange={(e) => {
                          handleRoutingChange(instrument, effect, 'insert', e.target.value === 'insert');
                          handleRoutingChange(instrument, effect, 'send', e.target.value === 'send');
                        }}
                      >
                        <option value="none">None</option>
                        <option value="insert">INSERT</option>
                        <option value="send">SEND</option>
                      </select>
                    </td>
                  );
                })}
                <td>
                  <select
                    value={
                      getEffectConfig({ distortion, pcf, compressor, delay, tb303Routing: { insert: [], send: [] }, tr808Routing: { insert: [], send: [] }, tr909Routing: { insert: [], send: [] }, masterRouting: { insert: [], send: [] } }, 'masterRouting').insert.includes(effect)
                        ? 'insert'
                        : getEffectConfig({ distortion, pcf, compressor, delay, tb303Routing: { insert: [], send: [] }, tr808Routing: { insert: [], send: [] }, tr909Routing: { insert: [], send: [] }, masterRouting: { insert: [], send: [] } }, 'masterRouting').send.includes(effect)
                          ? 'send'
                          : 'none'
                    }
                    onChange={(e) => {
                      handleRoutingChange('master', effect, 'insert', e.target.value === 'insert');
                      handleRoutingChange('master', effect, 'send', e.target.value === 'send');
                    }}
                  >
                    <option value="none">None</option>
                    <option value="insert">INSERT</option>
                    <option value="send">SEND</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AudioEffectsControls;
