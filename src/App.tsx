import React, { useState } from 'react';
import { SongMode } from './components/SongMode';
import { MainSequencer } from './components/MainSequencer';
import { PatternEditor } from './components/PatternEditor';
import { PatternManager } from './components/PatternManager';
import { TB303 } from './components/TB303';
import { TR808 } from './components/TR808';
import { TR909 } from './components/TR909';
import { TransportControls } from './components/TransportControls';
import { AudioEffectsControls } from './components/AudioEffectsControls';
import { AutomationControls } from './components/AutomationControls';
import { AdvancedSequencerControls } from './components/AdvancedSequencerControls';
import { EffectsRouting, MasterEffectsRouting } from './components/EffectsRouting';
import { FileManager } from './components/FileManager';
import { useSongStore } from './stores/songStore';
import { usePatternStore } from './stores/patternStore';
import './App.css';

const App: React.FC = () => {
  const [showFileManager, setShowFileManager] = useState(false);
  const songStore = useSongStore();
  const patternStore = usePatternStore();

  const handleNewProject = () => {
    // Reset all stores to initial state
    songStore.reset();
    patternStore.reset();
    // Note: Other stores (automation, effects) should also be reset
    // This will be handled by the FileManager component
  };

  const handleProjectLoaded = (project: unknown) => {
    // Load project data into stores
    // This will be implemented in the FileManager component
    console.log('Project loaded:', project);
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>R3B1RTH</h1>
        <p>ReBirth RB-338 Web Clone</p>
      </header>

      <main className="app-main">
        {/* Transport Controls */}
        <div className="section transport-section">
          <TransportControls />
        </div>

        {/* Main Sequencer */}
        <div className="section sequencer-section">
          <MainSequencer />
        </div>

        {/* Pattern Management */}
        <div className="section pattern-section">
          <PatternManager />
          <PatternEditor />
        </div>

        {/* Song Mode */}
        <div className="section song-section">
          <SongMode />
        </div>

        {/* Instruments */}
        <div className="instruments-section">
          <div className="instrument tb303">
            <h2>TB-303</h2>
            <TB303 />
            <EffectsRouting instrument="tb303" />
          </div>
          <div className="instrument tr808">
            <h2>TR-808</h2>
            <TR808 />
            <EffectsRouting instrument="tr808" />
          </div>
          <div className="instrument tr909">
            <h2>TR-909</h2>
            <TR909 />
            <EffectsRouting instrument="tr909" />
          </div>
        </div>

        {/* Master Effects */}
        <div className="section master-section">
          <h2>Master Effects</h2>
          <MasterEffectsRouting />
          <AudioEffectsControls />
        </div>

        {/* Advanced Features */}
        <div className="section advanced-section">
          <AutomationControls />
          <AdvancedSequencerControls />
        </div>
      </main>

      {/* File Manager Modal */}
      <FileManager
        onProjectLoaded={handleProjectLoaded}
        onNewProject={handleNewProject}
      />

      {/* File Manager Button */}
      <button
        className="file-manager-button"
        onClick={() => setShowFileManager(true)}
      >
        File Manager
      </button>

      <footer className="app-footer">
        <p>R3B1RTH - ReBirth RB-338 Clone</p>
        <p>Batch 8: File Save/Open Integrated</p>
      </footer>
    </div>
  );
};

export default App;