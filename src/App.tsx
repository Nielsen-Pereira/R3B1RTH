import React from 'react';
import { useAudioStore } from './store/audioStore';
import { useSequencerStore } from './store/sequencerStore';
import { useSwingStore } from './store/swingStore';
import Transport from './components/Transport';
import TB303Section from './components/sections/TB303Section';
import TR808Section from './components/sections/TR808Section';
import TR909Section from './components/sections/TR909Section';
import Distortion from './components/effects/Distortion';
import PCF from './components/effects/PCF';
import Compressor from './components/effects/Compressor';
import Delay from './components/effects/Delay';

function App() {
  const { start, stop, setBPM, setMasterVolume } = useAudioStore();
  const { setGlobalSetting } = useSequencerStore();
  const { setSwingAmount, setSwingEnabled } = useSwingStore();

  const handlePlay = () => { start(); };
  const handleStop = () => { stop(); };

  return (
    <div className="app">
      <header className="header">
        <h1>R3B1RTH</h1>
        <p>ReBirth RB-338 Web Implementation</p>
      </header>

      <main className="main-content">
        <Transport />

        <section className="synth-section">
          <h2>TB-303 Synthesizers</h2>
          <div className="synth-grid">
            <TB303Section synthIndex={0} />
            <TB303Section synthIndex={1} />
          </div>
        </section>

        <section className="drum-section">
          <h2>Drum Machines</h2>
          <div className="drum-grid">
            <TR808Section drumMachineIndex={0} />
            <TR909Section drumMachineIndex={0} />
          </div>
        </section>

        <section className="effects-section">
          <h2>Effects</h2>
          <div className="effects-grid">
            <Distortion effectIndex={0} />
            <PCF effectIndex={0} />
            <Compressor effectIndex={0} />
            <Delay effectIndex={0} />
          </div>
        </section>
      </main>

      <footer className="footer">
        <p>R3B1RTH - ReBirth RB-338 Web Version</p>
        <p>Type-safe implementation with React 18, TypeScript, and Web Audio API</p>
      </footer>
    </div>
  );
}

export default App;