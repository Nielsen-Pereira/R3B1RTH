/**
 * Main App Component - Batch 3 Development
 * Integrates all components: Instruments, Pattern Manager, Song Mode
 */

import React from 'react';
import { TB303 } from './components/TB303';
import { TR808 } from './components/TR808';
import { TR909 } from './components/TR909';
import { SongMode } from './components/SongMode';
import { AudioEffectsControls } from './components/AudioEffectsControls';
import { TransportControls } from './components/TransportControls';
import { PatternManager } from './components/PatternManager';
import { PatternSelector } from './components/PatternSelector';
import { usePatternStore } from './stores/patternStore';
import { useTransportStore } from './stores/transportStore';

const App: React.FC = () => {
  const patternStore = usePatternStore();
  const transportStore = useTransportStore();

  return (
    <div className="app">
      <header className="app-header">
        <h1>R3B1RTH</h1>
        <p>ReBirth RB-338 Clone - Web Implementation</p>
      </header>

      <main className="app-main">
        <section className="transport-section">
          <TransportControls />
        </section>

        <section className="instruments-row">
          <TB303 />
          <TR808 />
          <TR909 />
        </section>

        <section className="pattern-section">
          <PatternSelector onPatternSelect={(patternId) => {
            patternStore.getState().setCurrentPattern(patternId);
          }} />
          <PatternManager />
        </section>

        <section className="effects-section">
          <AudioEffectsControls />
        </section>

        <section className="song-mode-section">
          <SongMode />
        </section>
      </main>

      <footer className="app-footer">
        <p>Batch 1-3 Development | R3B1RTH Project | Type-safe React + TypeScript + Web Audio API</p>
      </footer>
    </div>
  );
};

export default App;
