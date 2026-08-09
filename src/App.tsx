import React, { useEffect, useCallback } from 'react';
import { useAudioStore } from './store/audioStore';
import { useSequencerStore } from './store/sequencerStore';
import { useUIStore } from './store/uiStore';
import TR808Section from './components/sections/TR808Section';
import TR909Section from './components/sections/TR909Section';
import TB303Section from './components/sections/TB303Section';
import TransportPanel from './components/transport/TransportPanel';
import MixerSection from './components/mixer/MixerSection';
import EffectsSection from './components/effects/EffectsSection';
import SongWindow from './components/sequencer/SongWindow';
import './styles/global.css';

const App: React.FC = () => {
  const { initAudioContext, isAudioReady } = useAudioStore();
  const { setLayout, theme } = useUIStore();

  const handleUserInteraction = useCallback(() => {
    if (!isAudioReady) {
      initAudioContext();
    }
  }, [isAudioReady, initAudioContext]);

  useEffect(() => {
    const handleResize = () => {
      setLayout(window.innerWidth, window.innerHeight);
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    document.addEventListener('click', handleUserInteraction, { once: true });
    document.addEventListener('keydown', handleUserInteraction, { once: true });

    return () => {
      window.removeEventListener('resize', handleResize);
      document.removeEventListener('click', handleUserInteraction);
      document.removeEventListener('keydown', handleUserInteraction);
    };
  }, [setLayout, handleUserInteraction]);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  return (
    <div className="app-container">
      <header className="app-header">
        <div className="logo">
          <span className="logo-text">R3B1RTH</span>
          <span className="logo-subtitle">ReBirth RB-338</span>
        </div>
      </header>

      <main className="main-content">
        <div className="sections-grid">
          <div className="drum-machines">
            <TR808Section section="808" />
            <TR909Section section="909" />
          </div>
          
          <div className="synthesizers">
            <TB303Section section="303_1" />
            <TB303Section section="303_2" />
          </div>

          <div className="controls-panel">
            <TransportPanel />
            <MixerSection />
            <EffectsSection />
          </div>
        </div>

        <div className="song-section">
          <SongWindow />
        </div>
      </main>

      <footer className="app-footer">
        <div className="footer-content">
          <span>R3B1RTH v0.1.0</span>
          <span className="footer-divider">|</span>
          <span>Propellerhead ReBirth RB-338 Recreation</span>
        </div>
      </footer>
    </div>
  );
};

export default App;