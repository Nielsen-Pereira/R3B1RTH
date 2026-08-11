/**
 * Main App Component - Batch 2 Development
 * Integrates all instrument and mode components
 */

import React from 'react';
import { TB303 } from './components/TB303';
import { TR808 } from './components/TR808';
import { TR909 } from './components/TR909';
import { SongMode } from './components/SongMode';
import { AudioEffectsControls } from './components/AudioEffectsControls';
import { TransportControls } from './components/TransportControls';
import { PatternEditor } from './components/PatternEditor';
import { useSongStore } from './stores/songStore';
import { useTransportStore } from './stores/transportStore';
import type { Pattern } from './types';

// Main App component
const App: React.FC = () => {
  const songStore = useSongStore();
  const transportStore = useTransportStore();

  // Temporary pattern for PatternEditor
  const tempPattern: Pattern = {
    id: '1',
    name: 'Pattern 1',
    instrument: 'tb303',
    steps: Array.from({ length: 16 }, (_, i) => ({
      id: i,
      active: false,
      accent: false,
      slide: false,
      value: 0,
    })),
    length: 16,
    swing: 0,
    shuffle: 0,
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>R3B1RTH</h1>
        <p>ReBirth RB-338 Clone</p>
      </header>

      <main className="app-main">
        {/* Transport Controls */}
        <section className="transport-section">
          <TransportControls />
        </section>

        {/* Instruments */}
        <section className="instruments-section">
          <TB303 />
          <TR808 />
          <TR909 />
        </section>

        {/* Audio Effects */}
        <section className="effects-section">
          <AudioEffectsControls />
        </section>

        {/* Song Mode */}
        <section className="song-mode-section">
          <SongMode />
        </section>

        {/* Pattern Editor */}
        <section className="pattern-editor-section">
          <PatternEditor
            instrument="tb303"
            pattern={tempPattern}
            onPatternChange={(pattern) => console.log('Pattern changed:', pattern)}
            length={16}
          />
        </section>
      </main>

      <footer className="app-footer">
        <p>Batch 1 & 2 Development - R3B1RTH Project</p>
      </footer>
    </div>
  );
};

export default App;
