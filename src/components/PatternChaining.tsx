/**
 * Pattern Chaining Component - Batch 4 Development
 * R3B-133: Pattern Chaining Implementation
 *
 * UI component for pattern chaining management
 */

import React from 'react';
import {
  usePatternChainingStore,
  usePatternStore,
  PATTERN_CHAIN_PRESETS,
  applyPatternChainPreset,
} from '../stores/patternChainingStore';
import { getAllPatterns, getPatternById } from '../stores/patternStore';

export const PatternChaining: React.FC = () => {
  const chainingStore = usePatternChainingStore();
  const patternStore = usePatternStore();
  
  const state = chainingStore();
  const patternState = patternStore();
  
  const allPatterns = getAllPatterns(patternState);
  const currentChain = state.getCurrentChain();
  const allChains = state.getAllChains();

  const handleCreateChain = () => {
    const chainId = chainingStore.getState().createChain('New Chain');
    chainingStore.getState().setCurrentChain(chainId);
  };

  const handleDeleteChain = (chainId: string) => {
    if (window.confirm('Delete this chain?')) {
      chainingStore.getState().deleteChain(chainId);
    }
  };

  const handleAddPattern = (chainId: string, patternId: string) => {
    chainingStore.getState().addPatternToChain(chainId, patternId);
  };

  const handleRemovePattern = (chainId: string, patternIndex: number) => {
    const chain = allChains.find(c => c.id === chainId);
    if (chain && chain.patterns[patternIndex]) {
      chainingStore.getState().removePatternFromChain(chainId, chain.patterns[patternIndex]);
    }
  };

  const handleSetCurrentChain = (chainId: string) => {
    chainingStore.getState().setCurrentChain(chainId);
  };

  const handleToggleChaining = () => {
    chainingStore.getState().setChainingEnabled(!state.isChaining);
  };

  const handleApplyPreset = (presetKey: keyof typeof PATTERN_CHAIN_PRESETS) => {
    const patternIds = allPatterns.map(p => p.id);
    applyPatternChainPreset(chainingStore, presetKey, patternIds);
  };

  const handleAdvance = () => {
    chainingStore.getState().advanceChain();
  };

  return (
    <div className="pattern-chaining">
      <div className="chaining-header">
        <h3>Pattern Chaining</h3>
        <button onClick={handleToggleChaining} className={state.isChaining ? 'active' : ''}>
          {state.isChaining ? 'Chaining: ON' : 'Chaining: OFF'}
        </button>
      </div>

      <div className="chains-list">
        <div className="chain-selector">
          <label>Select Chain:</label>
          <select
            value={state.currentChainId || ''}
            onChange={(e) => handleSetCurrentChain(e.target.value)}
          >
            <option value="">No chain selected</option>
            {allChains.map(chain => (
              <option key={chain.id} value={chain.id}>
                {chain.name} ({chain.patterns.length} patterns)
              </option>
            ))}
          </select>
          <button onClick={handleCreateChain}>New Chain</button>
        </div>

        {currentChain && (
          <div className="chain-detail">
            <div className="chain-info">
              <span>Loop: </span>
              <input
                type="checkbox"
                checked={currentChain.loop}
                onChange={(e) => chainingStore.getState().setChainLoop(currentChain.id, e.target.checked)}
              />
              <span>Enabled: </span>
              <input
                type="checkbox"
                checked={currentChain.enabled}
                onChange={(e) => chainingStore.getState().setChainEnabled(currentChain.id, e.target.checked)}
              />
            </div>

            <div className="chain-patterns">
              <h4>Patterns in Chain:</h4>
              {currentChain.patterns.length === 0 ? (
                <p>No patterns added. Add patterns below.</p>
              ) : (
                <ul>
                  {currentChain.patterns.map((patternId, index) => {
                    const pattern = allPatterns.find(p => p.id === patternId);
                    return (
                      <li key={index}>
                        {pattern ? pattern.name : patternId}
                        <button onClick={() => handleRemovePattern(currentChain.id, index)}>
                          Remove
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>

            <div className="chain-controls">
              <button onClick={handleAdvance} disabled={currentChain.patterns.length === 0}>
                Next Pattern
              </button>
              <button onClick={() => chainingStore.getState().resetChain(currentChain.id)}>
                Reset
              </button>
              <button onClick={() => handleDeleteChain(currentChain.id)} className="danger">
                Delete Chain
              </button>
            </div>
          </div>
        )}

        <div className="chain-presets">
          <label>Presets:</label>
          <select onChange={(e) => handleApplyPreset(e.target.value as keyof typeof PATTERN_CHAIN_PRESETS)}>
            <option value="">Select Preset</option>
            {Object.keys(PATTERN_CHAIN_PRESETS).map(presetKey => (
              <option key={presetKey} value={presetKey}>{presetKey}</option>
            ))}
          </select>
        </div>

        <div className="available-patterns">
          <h4>Available Patterns:</h4>
          {currentChain && (
            <ul>
              {allPatterns.map(pattern => (
                <li key={pattern.id}>
                  {pattern.name}
                  <button
                    onClick={() => handleAddPattern(currentChain.id, pattern.id)}
                    disabled={currentChain.patterns.includes(pattern.id)}
                  >
                    Add to Chain
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default PatternChaining;
