/**
 * Main Sequencer Component - Batch 2 Development
 * Central sequencer interface integrating all instruments
 */

import React, { useState } from 'react';
import { TB303 } from './TB303';
import { TR808 } from './TR808';
import { TR909 } from './TR909';
import { TransportControls } from './TransportControls';
import { PatternEditor } from './PatternEditor';
import { useTransportStore } from '../stores/transportStore';
import type { Pattern } from '../types';

type InstrumentTab = 'tb303' | 'tr808' | 'tr909' | 'patterns' | 'song';

const defaultPattern: Pattern = {
  id: '1',
  name: 'Pattern 1',
  instrument: 'tb303',
  steps: Array.from({ length: 16 }, (_, i) => ({
    id: i,
    active: i % 4 === 0, // Every 4th step active
    accent: false,
    slide: false,
    value: 1,
  })),
  length: 16,
  swing: 0,
  shuffle: 0,
};

export const MainSequencer: React.FC = () => {
  const [activeTab, setActiveTab] = useState<InstrumentTab>('tb303');
  const [currentPattern, setCurrentPattern] = useState<Pattern>(defaultPattern);
  const transport = useTransportStore();

  const handleTabChange = (tab: InstrumentTab) => {
    setActiveTab(tab);
  };

  const handlePatternChange = (pattern: Pattern) => {
    setCurrentPattern(pattern);
  };

  return (
    <div className="main-sequencer">
      {/* Header */}
      <header className="sequencer-header">
        <h2>Sequencer</h2>
        <div className="transport-header">
          <TransportControls />
        </div>
      </header>

      {/* Tabs */}
      <nav className="sequencer-tabs">
        <button
          onClick={() => handleTabChange('tb303')}
          className={activeTab === 'tb303' ? 'active' : ''}
        >
          TB-303
        </button>
        <button
          onClick={() => handleTabChange('tr808')}
          className={activeTab === 'tr808' ? 'active' : ''}
        >
          TR-808
        </button>
        <button
          onClick={() => handleTabChange('tr909')}
          className={activeTab === 'tr909' ? 'active' : ''}
        >
          TR-909
        </button>
        <button
          onClick={() => handleTabChange('patterns')}
          className={activeTab === 'patterns' ? 'active' : ''}
        >
          Patterns
        </button>
        <button
          onClick={() => handleTabChange('song')}
          className={activeTab === 'song' ? 'active' : ''}
        >
          Song Mode
        </button>
      </nav>

      {/* Tab Content */}
      <main className="sequencer-content">
        {activeTab === 'tb303' && <TB303 />}
        {activeTab === 'tr808' && <TR808 />}
        {activeTab === 'tr909' && <TR909 />}
        {activeTab === 'patterns' && (
          <PatternEditor
            instrument="tb303"
            pattern={currentPattern}
            onPatternChange={handlePatternChange}
            length={16}
          />
        )}
        {activeTab === 'song' && (
          <div className="song-mode-placeholder">
            <p>Song Mode - Coming Soon</p>
          </div>
        )}
      </main>

      {/* Status Bar */}
      <footer className="sequencer-footer">
        <div className="status-info">
          <span>BPM: {transport.bpm}</span>
          <span>Playing: {transport.isPlaying ? 'Yes' : 'No'}</span>
          <span>Recording: {transport.isRecording ? 'Yes' : 'No'}</span>
        </div>
      </footer>
    </div>
  );
};

export default MainSequencer;