/**
 * TB-303 Component - Batch 2 Development
 * R3B-95, R3B-96: TR-808/TR-909 Instruments Completion
 * 
 * UI component for TB-303 Bass Line synthesizer
 */

import React from 'react';
import { useTB303Store, TB303_PRESETS, applyTB303Preset, getTB303Parameter, isTB303Enabled, isTB303Muted, isTB303Solo } from '../stores/tb303Store';
import type { TB303Waveform } from '../stores/tb303Store';

export const TB303: React.FC = () => {
  const store = useTB303Store();
  const state = store();

  const handleEnabledChange = () => store.setEnabled(!state.enabled);
  const handleMuteChange = () => store.setMute(!state.mute);
  const handleSoloChange = () => store.setSolo(!state.solo);
  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    store.setVolume(parseFloat(e.target.value));
  };

  const handleParameterChange = (param: keyof typeof state.parameters, value: number) => {
    store.setParameter(param, value);
  };

  const handleWaveformChange = (waveform: TB303Waveform) => {
    store.setWaveform(waveform);
  };

  const handlePresetSelect = (preset: keyof typeof TB303_PRESETS) => {
    applyTB303Preset(store, preset);
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
          <option value="pulse">Pulse</option>
          <option value="triangle">Triangle</option>
        </select>
      </div>

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
