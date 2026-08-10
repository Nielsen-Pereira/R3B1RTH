import React from 'react';
import { TB303Section } from './components/sections/TB303Section';
import { TR808Section } from './components/sections/TR808Section';
import { TR909Section } from './components/sections/TR909Section';
import { EffectsSection } from './components/effects/EffectsSection';
import Transport from './components/Transport';
import './index.css';

const App: React.FC = () => {
  return (
    <div className="app">
      <header className="app-header"><h1>R3B1RTH</h1><p>Propellerhead ReBirth RB-338 Emulator</p></header>
      <main className="app-main">
        <div className="sections-container">
          <div className="synths-row"><TB303Section id={0} name="TB-303 #1" /><TB303Section id={1} name="TB-303 #2" /></div>
          <div className="drums-row"><TR808Section id={0} name="TR-808" /><TR909Section id={1} name="TR-909" /></div>
          <div className="effects-row"><EffectsSection id={0} name="Effects" /></div>
        </div>
        <div className="transport-container"><Transport /></div>
      </main>
      <footer className="app-footer"><p>R3B1RTH - A Web Audio API ReBirth Emulator</p></footer>
    </div>
  );
};

export default App;
