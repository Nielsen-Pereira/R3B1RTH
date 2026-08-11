/**
 * TR-808 Component - Batch 2 Development
 * R3B-97, R3B-98: TR-808/TR-909 Instruments Completion
 * 
 * UI component for TR-808 Drum Machine
 */

import React from 'react';
import { useTR808Store, TR808_PRESETS, applyTR808Preset, getDrumState, isDrumEnabled, getTR808Volume, isTR808Enabled, isTR808Muted, isTR808Solo } from '../stores/tr808Store';
import type { TR808Drum } from '../stores/tr808Store';

const drumLabels: Record<TR808Drum, string> = {
  bd: 'Bass Drum',
  sd: 'Snare',
  lt: 'Low Tom',
  mt: 'Mid Tom',
  ht: 'High Tom',
  cp: 'Clap',
  oh: 'Open Hat',
  ch: 'Closed Hat',
  cy: 'Crash',
  cl: 'Claves',
};

export const TR808: React.FC = () => {
  const store = useTR808Store();
  const state = store();

  const handleEnabledChange = () => store.setEnabled(!state.enabled);
  const handleMuteChange = () => store.setMute(!state.mute);
  const handleSoloChange = () => store.setSolo(!state.solo);
  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    store.setVolume(parseFloat(e.target.value));
  };

  const handleDrumEnabledChange = (drumId: TR808Drum) => {
    const drum = getDrumState(state, drumId);
    if (drum) {
      store.setDrumEnabled(drumId, !drum.enabled);
    }
  };

  const handleDrumParameterChange = (drumId: TR808Drum, param: keyof typeof state.drums[0].parameters, value: number) => {
    store.setDrumParameter(drumId, param, value);
  };

  const handlePresetSelect = (preset: keyof typeof TR808_PRESETS) => {
    applyTR808Preset(store, preset);
  };

  return (
    <div className="instrument tr808">
      <div className="instrument-header">
        <h3>TR-808</h3>
        <div className="instrument-controls">
          <button onClick={handleEnabledChange} className={state.enabled ? 'active' : ''}>
            Power
          </button>
          <button onClick={handleMuteChange} className={state.mute ? 'active' : ''}>
            Mute
          </button>
          <button onClick={handleSoloChange} className={stat
e.solo ? 'active' : ''}>
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

      <div className="drum-grid">
        {state.drums.map(drum => (
          <div key={drum.id} className="drum-channel">
            <div className="drum-header">
              <span className="drum-name">{drumLabels[drum.id as TR808Drum] || drum.id}</span>
              <button
                onClick={() => handleDrumEnabledChange(drum.id as TR808Drum)}
                className={drum.enabled ? 'active' : ''}
              >
                {drum.enabled ? 'ON' : 'OFF'}
              </button>
            </div>

            <div className="drum-parameter">
              <label>Tune</label>
              <input
                type="range"
                min="-24"
                max="24"
                step="1"
                value={drum.parameters.tune}
                onChange={(e) => handleDrumParameterChange(drum.id as TR808Drum, 'tune', parseFloat(e.target.value))}
              />
              <span>{drum.parameters.tune}</span>
            </div>

            <div className="drum-parameter">
              <label>Decay</label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={drum.parameters.decay}
                onChange={(e) => handleDrumParameterChange(drum.id as TR808Drum, 'decay', parseFloat(e.target.value))}
              />
              <span>{Math.round(drum.parameters.decay * 100)}%</span>
            </div>

            <div className="drum-parameter">
              <label>Volume</label>
              <input
                type="range"
     
           min="0"
                max="1"
                step="0.01"
                value={drum.parameters.volume}
                onChange={(e) => handleDrumParameterChange(drum.id as TR808Drum, 'volume', parseFloat(e.target.value))}
              />
              <span>{Math.round(drum.parameters.volume * 100)}%</span>
            </div>

            <div className="drum-parameter">
              <label>Pan</label>
              <input
                type="range"
                min="-1"
                max="1"
                step="0.01"
                value={drum.parameters.pan}
                onChange={(e) => handleDrumParameterChange(drum.id as TR808Drum, 'pan', parseFloat(e.target.value))}
              />
              <span>{drum.parameters.pan > 0 ? 'R' : 'L'}{Math.abs(Math.round(drum.parameters.pan * 100))}%</span>
            </div>
          </div>
        ))}
      </div>

      <div className="presets">
        <label>Presets</label>
        <select onChange={(e) => handlePresetSelect(e.target.value as keyof typeof TR808_PRESETS)}>
          <option value="">Select Preset</option>
          {Object.keys(TR808_PRESETS).map(preset => (
            <option key={preset} value={preset}>{preset}</option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default TR808;
