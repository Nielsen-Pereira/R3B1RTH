/**
 * TB-303 Component - R3B-87: TB-303 Advanced Features
 *
 * UI component for TB-303 Bass Line synthesizer with advanced parameters
 * Constraints: TB-303 supports only Sawtooth and Square waveforms (per ReBirth RB-338 specs)
 */

import React from 'react';
import {
  useTB303Store,
  TB303_PRESETS,
  applyTB303Preset,
  getTB303Parameter,
  isTB303Enabled,
  isTB303Muted,
  isTB303Solo,
  getTB303CutoffEnv
} from '../stores/tb303Store';
import type { TB303Waveform, TB303Envelope } from '../stores/tb303Store';

export const TB303: React.FC = () => {
  const store = useTB303Store();
  const state = store();

  const handleEnabledChange = () => store.setEnabled(!state.enabled);
  const handleMuteChange = () => store.setMute(!state.mute);
  const handleSoloChange = () => store.setSolo(!state.solo);
  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    store.setVolume(parseFloat(e.target.value));
  };

  const handleParameterChange = (param: keyof typeof state.parameters, value: number | boolean) => {
    store.setParameter(param, value);
  };

  const handleWaveformChange = (waveform: TB303Waveform) => {
    store.setWaveform(waveform);
  };

  const handleCutoffEnvChange = (param: keyof TB303Envelope, value: number) => {
    const currentEnv = getTB303CutoffEnv(state);
    store.setCutoffEnv({ ...currentEnv, [param]: value });
  };

  const handlePresetSelect = (preset: keyof typeof TB303_PRESETS) => {
    applyTB303Preset(store, preset);
  };

  const handleSlideToggle = () => {
    store.setParameter('slide', !state.parameters.slide);
  };

  const handlePortamentoToggle = () => {
    store.setParameter('portamento', !state.parameters.portamento);
  };

  return (
    <div className="instrument tb303">
      <div className="instrument-header">
        <h3>TB-303</h3>
        <div className="instrument-controls">
          <button onClick={handleEnabledChange} className={state.enabled ? 'active' : ''}>
            Power
          </button>
          <button onClick={handleMuteChange} className={state.mute ? 'active' : ''}>
            Mute
          </button>
          <button onClick={handleSoloChange} className={state.solo ? 'active' : ''}>
            Solo
          </button>
        </div>
      </div>

      <div className="volume-control">
        <label>Volume</label>
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={state.volume}
          onChange={handleVolumeChange}
        />
        <span>{Math.round(state.volume * 100)}%</span>
      </div>

      <div className="waveform-selector">
        <label>Waveform</label>
        <select
          value={state.parameters.waveform}
          onChange={(e) => handleWaveformChange(e.target.value as TB303Waveform)}
        >
          <option value="sawtooth">Sawtooth</option>
          <option value="square">Square</option>
        </select>
      </div>

      <div className="slide-controls">
        <div className="slide-toggle">
          <label>
            <input
              type="checkbox"
              checked={state.parameters.slide}
              onChange={handleSlideToggle}
            />
            Slide
          </label>
          {state.parameters.slide && (
            <div className="slide-time">
              <label>Slide Time</label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={state.parameters.slideTime}
                onChange={(e) => handleParameterChange('slideTime', parseFloat(e.target.value))}
              />
              <span>{Math.round(state.parameters.slideTime * 100)}%</span>
            </div>
          )}
        </div>
        <div className="portamento-toggle">
          <label>
            <input
              type="checkbox"
              checked={state.parameters.portamento}
              onChange={handlePortamentoToggle}
            />
            Portamento
          </label>
        </div>
      </div>

      <div className="parameter-section">
        <h4>Basic Parameters</h4>
        <div className="parameter-controls">
          <div className="parameter">
            <label>Cutoff</label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={state.parameters.cutoff}
              onChange={(e) => handleParameterChange('cutoff', parseFloat(e.target.value))}
            />
            <span>{Math.round(state.parameters.cutoff * 100)}%</span>
          </div>

          <div className="parameter">
            <label>Resonance</label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={state.parameters.resonance}
              onChange={(e) => handleParameterChange('resonance', parseFloat(e.target.value))}
            />
            <span>{Math.round(state.parameters.resonance * 100)}%</span>
          </div>

          <div className="parameter">
            <label>Env Mod</label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={state.parameters.envMod}
              onChange={(e) => handleParameterChange('envMod', parseFloat(e.target.value))}
            />
            <span>{Math.round(state.parameters.envMod * 100)}%</span>
          </div>

          <div className="parameter">
            <label>Decay</label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={state.parameters.decay}
              onChange={(e) => handleParameterChange('decay', parseFloat(e.target.value))}
            />
            <span>{Math.round(state.parameters.decay * 100)}%</span>
          </div>

          <div className="parameter">
            <label>Accent</label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={state.parameters.accent}
              onChange={(e) => handleParameterChange('accent', parseFloat(e.target.value))}
            />
            <span>{Math.round(state.parameters.accent * 100)}%</span>
          </div>
        </div>
      </div>

      <div className="parameter-section advanced">
        <h4>Advanced Parameters</h4>
        <div className="parameter-controls">
          <div className="parameter">
            <label>Accent Amount</label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={state.parameters.accentAmount}
              onChange={(e) => handleParameterChange('accentAmount', parseFloat(e.target.value))}
            />
            <span>{Math.round(state.parameters.accentAmount * 100)}%</span>
          </div>

          <div className="parameter">
            <label>Accent Velocity</label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={state.parameters.accentVelocity}
              onChange={(e) => handleParameterChange('accentVelocity', parseFloat(e.target.value))}
            />
            <span>{Math.round(state.parameters.accentVelocity * 100)}%</span>
          </div>
        </div>
      </div>

      <div className="parameter-section">
        <h4>Cutoff Envelope (ADSR)</h4>
        <div className="envelope-controls">
          <div className="env-param">
            <label>A</label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={state.parameters.cutoffEnv.attack}
              onChange={(e) => handleCutoffEnvChange('attack', parseFloat(e.target.value))}
            />
          </div>
          <div className="env-param">
            <label>D</label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={state.parameters.cutoffEnv.decay}
              onChange={(e) => handleCutoffEnvChange('decay', parseFloat(e.target.value))}
            />
          </div>
          <div className="env-param">
            <label>S</label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={state.parameters.cutoffEnv.sustain}
              onChange={(e) => handleCutoffEnvChange('sustain', parseFloat(e.target.value))}
            />
          </div>
          <div className="env-param">
            <label>R</label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={state.parameters.cutoffEnv.release}
              onChange={(e) => handleCutoffEnvChange('release', parseFloat(e.target.value))}
            />
          </div>
        </div>
      </div>

      <div className="presets">
        <label>Presets</label>
        <select onChange={(e) => handlePresetSelect(e.target.value as keyof typeof TB303_PRESETS)}>
          <option value="">Select Preset</option>
          {Object.keys(TB303_PRESETS).map(preset => (
            <option key={preset} value={preset}>{preset}</option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default TB303;
