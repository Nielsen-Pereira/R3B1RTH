/**
 * TR-909 Component - Batch 2 Development
 * R3B-97, R3B-98: TR-808/TR-909 Instruments Completion
 * 
 * UI component for TR-909 Drum Machine
 */

import React from 'react';
import { useTR909Store, TR909_PRESETS, applyTR909Preset, getTR909DrumState, isTR909DrumEnabled, getTR909Volume, isTR909Enabled, isTR909Muted, isTR909Solo } from '../stores/tr909Store';
import type { TR909Drum } from '../stores/tr909Store';

const drumLabels: Record<TR909Drum, string> = {
  bd: 'Bass Drum',
  sd: 'Snare',
  lt: 'Low Tom',
  mt: 'Mid Tom',
  ht: 'High Tom',
  cp: 'Clap',
  oh: 'Open Hat',
  ch: 'Closed Hat',
  cy: 'Crash',
  rd: 'Ride',
  rc: 'Rimshot',
};

export const TR909: React.FC = () => {
  const store = useTR909Store();
  const state = store();

  const handleEnabledChange = () => store.setEnabled(!state.enabled);
  const handleMuteChange = () => store.setMute(!state.mute);
  const handleSoloChange = () => store.setSolo(!state.solo);
  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    store.setVolume(parseFloat(e.target.value));
  };

  const handleDrumEnabledChange = (drumId: TR909Drum) => {
    const drum = getTR909DrumState(state, drumId);
    if (drum) {
      store.setDrumEnabled(drumId, !drum.enabled);
    }
  };

  const handleDrumParameterChange = (drumId: TR909Drum, param: keyof typeof state.drums[0].parameters, value: number) => {
    store.setDrumParameter(drumId, param, value);
  };

  const handlePresetSelect = (preset: keyof typeof TR909_PRESETS) => {
    applyTR909Preset(store, preset);
  };

  return (
    <div className="instrument tr909">
      <div className="instrument-header">
        <h3>TR-909</h3>
        <div className="instrument-controls">
          <button onClick={handleEnabledChange} className={state.enabled ? 'active' : ''}>
            Power
          </button>
          <button onClick={handleMuteChange} className={state.mute ? 'active' : ''}>
            Mute
          </button>
          <button onClick={han
dleSoloChange} className={state.solo ? 'active' : ''}>
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
              <span className="drum-name">{drumLabels[drum.id as TR909Drum] || drum.id}</span>
              <button
                onClick={() => handleDrumEnabledChange(drum.id as TR909Drum)}
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
                onChange={(e) => handleDrumParameterChange(drum.id as TR909Drum, 'tune', parseFloat(e.target.value))}
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
                onChange={(e) => handleDrumParameterChange(drum.id as TR909Drum, 'decay', parseFloat(e.target.value))}
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
                onChange={(e) => handleDrumParameterChange(drum.id as TR909Drum, 'volume', parseFloat(e.target.value))}
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
                onChange={(e) => handleDrumParameterChange(drum.id as TR909Drum, 'pan', parseFloat(e.target.value))}
              />
              <span>{drum.parameters.pan > 0 ? 'R' : 'L'}{Math.abs(Math.round(drum.parameters.pan * 100))}%</span>
            </div>

            <div className="drum-parameter">
              <label>Attack</label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={drum.parameters.attack}
                onChange={(e) => handleDrumParameterChange(drum.id as TR909Drum, 'attack', parseFloat(e.target.value))}
              />
              <span>{Math.round(drum.parameters.attack * 100)}%</span>
            </div>
          </div>
        ))}
      </div>

      <div className="presets">
        <label>Presets</label>
        <select onChange={(e) => handlePresetSelect(e.target.value as keyof typeof TR909_PRESETS)}>
          <option value="">Select Preset</option>
          {Object.keys(TR909_PRESETS).map(preset => (
            <option key={preset} value={preset}>{preset}</option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default TR909;
