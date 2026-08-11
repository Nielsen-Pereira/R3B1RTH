/**
 * Pattern Selector Component - Batch 3 Development
 * R3B-99 to R3B-102: Pattern Editing Features
 * 
 * Component for selecting patterns by instrument
 */

import React from 'react';
import { usePatternStore, getPatternsByInstrument, getCurrentPattern, getCurrentInstrument } from '../stores/patternStore';
import { useTB303Store } from '../stores/tb303Store';
import { useTR808Store } from '../stores/tr808Store';
import { useTR909Store } from '../stores/tr909Store';
import type { InstrumentType } from '../types';

interface PatternSelectorProps {
  onPatternSelect: (patternId: string) => void;
}

export const PatternSelector: React.FC<PatternSelectorProps> = ({ onPatternSelect }) => {
  const patternStore = usePatternStore();
  const state = patternStore();
  
  const currentInstrument = getCurrentInstrument(state);
  const patterns = getPatternsByInstrument(state, currentInstrument);
  const currentPattern = getCurrentPattern(state);

  const handleInstrumentChange = (instrument: InstrumentType) => {
    patternStore.setCurrentInstrument(instrument);
  };

  const handlePatternSelect = (patternId: string) => {
    patternStore.setCurrentPattern(patternId);
    onPatternSelect(patternId);
  };

  const getInstrumentColor = (instrument: InstrumentType): string => {
    switch (instrument) {
      case 'tb303':
        return '#e94560';
      case 'tr808':
        return '#4ecca3';
      case 'tr909':
        return '#ffc107';
      default:
        return '#ffffff';
    }
  };

  return (
    <div className="pattern-selector">
      <div className="instrument-selector">
        {(['tb303', 'tr808', 'tr909'] as InstrumentType[]).map(instrument => {
          const instrumentPatterns = getPatternsByInstrument(state, instrument);
          const activePattern = instrumentPatterns.find(p => p.id === (currentInstrument === instrument ? currentPattern?.id : null));
          
          return (
            <button
              key={instrument}
              onClick={() => handleInstrumentChange(instrument)}
              className={currentInstrument === instrument ? 'active' : ''}
              style={{ borderColor: getInstrumentColor(instrument) }}
            >
              <span className="instrument-label">{instrument.toUpperCase()}</span>
              {instrumentPatterns.length > 0 && (
                <span className="pattern-count">{instrumentPatterns.length}</span>
              )}
              {activePattern && (
                <span className="active-pattern">{activePattern.name}</span>
              )}
            </button>
          );
        })}
      </div>

      <div className="pattern-grid">
        {patterns.map((pattern, index) => {
          const activeStepCount = pattern.steps.filter(s => s.active).length;
          const isCurrent = currentPattern?.id === pattern.id;
          
          return (
            <button
              key={pattern.id}
              onClick={() => handlePatternSelect(pattern.id)}
              className={
                'pattern-card' + 
                (isCurrent ? ' active' : '') + 
                (activeStepCount === 0 ? ' empty' : '')
              }
              title={pattern.name}
            >
              <div className="pattern-header">
                <span className="pattern-name">{pattern.name}</span>
                <span className="pattern-length">{pattern.length} steps</span>
              </div>
              <div className="pattern-visual">
                <div className="steps-grid">
                  {pattern.steps.slice(0, 16).map((step, i) => (
                    <div
                      key={i}
                      className={
                        'step' + 
                        (step.active ? ' active' : '') + 
                        (step.accent ? ' accent' : '') + 
                        (step.slide ? ' slide' : '')
                      }
                    />
                  ))}
                </div>
              </div>
              <div className="pattern-stats">
                <span>{activeStepCount}/{pattern.length}</span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default PatternSelector;
