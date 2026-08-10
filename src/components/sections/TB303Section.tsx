import React from 'react';
import { useAudioStore } from '../../store/audioStore';
import { useSequencerStore } from '../../store/sequencerStore';

interface TB303SectionProps { synthIndex: number; }

const TB303Section: React.FC<TB303SectionProps> = ({ synthIndex }) => {
  const { setTB303FilterCutoff, setTB303FilterResonance, playTB303Note, stopTB303Note } = useAudioStore();
  const { tb303Settings, setTB303Setting } = useSequencerStore();
  const settings = tb303Settings[synthIndex];

  const handleCutoffChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const cutoff = parseFloat(e.target.value);
    setTB303FilterCutoff(synthIndex, cutoff);
    setTB303Setting(synthIndex, 'filterCutoff', cutoff);
  };

  const handleResonanceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const resonance = parseFloat(e.target.value);
    setTB303FilterResonance(synthIndex, resonance);
    setTB303Setting(synthIndex, 'filterResonance', resonance);
  };

  const notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

  return (
    <div className="tb303-section">
      <h3>TB-303 #{synthIndex + 1}</h3>
      <div className="filter-controls">
        <div className="control">
          <label>Cutoff: <input type="range" min="20" max="20000" step="1" value={settings.filterCutoff} onChange={handleCutoffChange} /> {Math.round(settings.filterCutoff)} Hz</label>
        </div>
        <div className="control">
          <label>Resonance: <input type="range" min="0" max="20" step="0.1" value={settings.filterResonance} onChange={handleResonanceChange} /> {settings.filterResonance.toFixed(1)}</label>
        </div>
      </div>
      <div className="keyboard">
        <h4>Keyboard</h4>
        <div className="piano-keys">
          {notes.map((note, i) => (
            <button key={i} onMouseDown={() => playTB303Note(synthIndex, 60 + i, 1.0)} onMouseUp={() => stopTB303Note(synthIndex)} onMouseLeave={() => stopTB303Note(synthIndex)}>
              {note}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TB303Section;