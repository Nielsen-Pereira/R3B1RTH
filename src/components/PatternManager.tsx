/**
 * Pattern Manager Component - Batch 3 Development
 * R3B-99 to R3B-102: Pattern Editing Features
 * 
 * Central component for pattern management
 */

import React, { useState } from 'react';
import { usePatternStore, getCurrentPattern, getPatternsByInstrument, getPatternStats, PATTERN_PRESETS, applyPatternPreset } from '../stores/patternStore';
import { PatternEditor } from './PatternEditor';
import type { Pattern, InstrumentType } from '../types';

const instrumentLabels: Record<InstrumentType, string> = {
  tb303: 'TB-303',
  tr808: 'TR-808',
  tr909: 'TR-909',
};

export const PatternManager: React.FC = () => {
  const store = usePatternStore();
  const [selectedInstrument, setSelectedInstrument] = useState<InstrumentType>('tb303');

  const patterns = getPatternsByInstrument(store(), selectedInstrument);
  const currentPattern = getCurrentPattern(store());

  const handleInstrumentChange = (instrument: InstrumentType) => {
    setSelectedInstrument(instrument);
    store.setCurrentInstrument(instrument);
  };

  const handleAddPattern = () => {
    const newPattern = store.addPattern({ instrument: selectedInstrument });
    store.setCurrentPattern(newPattern.id);
  };

  const handleSelectPattern = (patternId: string) => {
    store.setCurrentPattern(patternId);
  };

  const handleDeletePattern = (patternId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (patterns.length <= 1) return; // Keep at least one pattern
    store.deletePattern(patternId);
    if (store.currentPatternId === patternId) {
      store.setCurrentPattern(null);
    }
  };

  const handleClonePattern = (patternId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const newPattern = store.clonePattern(patternId);
    store.setCurrentPattern(newPattern.id);
  };

  const handleClearPattern = (patternId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    store.clearPattern(patternId);
  };

  const handlePresetSelect = (preset: keyof typeof PATTERN_PRESETS) => {
    applyPatternPreset(store, preset, selectedInstrument);
  };

  const handleLengthChange = (length: number) => {
    store.setPatternLength(length);
    if (currentPattern) {
      store.updatePattern(currentPattern.id, { length });
    }
  };

  const handleSwingChange = (swing: number) => {
    store.setSwing(swing);
    if (currentPattern) {
      store.updatePattern(currentPattern.id, { swing });
    }
  };

  const handleShuffleChange = (shuffle: number) => {
    store.setShuffle(shuffle);
    if (currentPattern) {
      store.updatePattern(currentPattern.id, { shuffle });
    }
  };

  return (
    <div className="pattern-manager">
      <div className="pattern-header">
        <h3>Pattern Manager</h3>
        <div className="pattern-actions">
          <button onClick={handleAddPattern}>Add Pattern</button>
          <select onChange={(e) => handlePresetSelect(e.target.value as keyof typeof PATTERN_PRESETS)}>
            <option value="">Presets</option>
            {Object.keys(PATTERN_PRESETS).map(preset => (
              <option key={preset} value={preset}>{preset}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="instrument-tabs">
        {(Object.keys(instrumentLabels) as InstrumentType[]).map(instrument => (
          <button
            key={instrument}
            onClick={() => handleInstrumentChange(instrument)}
            className={selectedInstrument === instrument ? 'active' : ''}
          >
            {instrumentLabels[instrument]}
          </button>
        ))}
      </div>

      <div className="pattern-list">
        <h4>Patterns ({patterns.length})</h4>
        <ul>
          {patterns.map(pattern => {
            const stats = getPatternStats(pattern);
            return (
              <li
                key={pattern.id}
                onClick={() => handleSelectPattern(pattern.id)}
                className={currentPattern?.id === pattern.id ? 'active' : ''}
              >
                <span className="pattern-name">{pattern.name}</span>
                <span className="pattern-info">
                  {stats.activeSteps}/{pattern.length} steps
                </span>
                <div className="pattern-actions">
                  <button onClick={(e) => handleClonePattern(pattern.id, e)} title="Clone">
                    Clone
                  </button>
                  <button onClick={(e) => handleClearPattern(pattern.id, e)} title="Clear">
                    Clear
                  </button>
                  {patterns.length > 1 && (
                    <button onClick={(e) => handleDeletePattern(pattern.id, e)} title="Delete">
                      Delete
                    </button>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      </div>

      {currentPattern && (
        <div className="pattern-editor-container">
          <PatternEditor
            instrument={currentPattern.instrument}
            pattern={currentPattern}
            onPatternChange={(updates) => {
              store.updatePattern(currentPattern.id, updates);
            }}
            length={store.patternLength}
          />

          <div className="global-controls">
            <div className="control-group">
              <label>Length: {store.patternLength}</label>
              <input
                type="range"
                min="1"
                max="32"
                value={store.patternLength}
                onChange={(e) => handleLengthChange(parseInt(e.target.value))}
              />
            </div>

            <div className="control-group">
              <label>Swing: {store.swing}%</label>
              <input
                type="range"
                min="-100"
                max="100"
                value={store.swing}
                onChange={(e) => handleSwingChange(parseInt(e.target.value))}
              />
            </div>

            <div className="control-group">
              <label>Shuffle: {store.shuffle}%</label>
              <input
                type="range"
                min="0"
                max="100"
                value={store.shuffle}
                onChange={(e) => handleShuffleChange(parseInt(e.target.value))}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PatternManager;
