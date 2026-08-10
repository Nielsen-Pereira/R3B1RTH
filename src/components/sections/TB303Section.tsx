import React, { useEffect, useRef, useState } from 'react';
import { useAudioStore, useSequencerStore } from '../../store';

interface TB303SectionProps { id: number; name: string; }

export const TB303Section: React.FC<TB303SectionProps> = ({ id, name }) => {
  const [activePattern, setActivePattern] = useState<number>(0);
  const [showSettings, setShowSettings] = useState<boolean>(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { tb303Patterns, setTB303Pattern, getTB303Pattern, tb303Settings, setTB303Setting } = useSequencerStore();
  const { playTB303Note, setTB303FilterCutoff, setTB303FilterResonance } = useAudioStore();
  const pattern = getTB303Pattern(id, activePattern);
  const settings = tb303Settings[id];

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const width = canvas.width;
    const height = canvas.height;
    ctx.clearRect(0, 0, width, height);
    const cellSize = width / 16;
    ctx.strokeStyle = '#444';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 16; i++) { ctx.beginPath(); ctx.moveTo(i * cellSize, 0); ctx.lineTo(i * cellSize, height); ctx.stroke(); }
    if (pattern) { ctx.fillStyle = '#00ff00'; for (let step = 0; step < 16; step++) { if (pattern.steps[step].active) { ctx.fillRect(step * cellSize + 2, 2, cellSize - 4, height - 4); } } }
  }, [pattern, activePattern]);

  const handleStepClick = (stepIndex: number) => { if (!pattern) return; const newPattern = { ...pattern }; newPattern.steps[stepIndex].active = !newPattern.steps[stepIndex].active; setTB303Pattern(id, activePattern, newPattern); };
  const handleCutoffChange = (value: number) => { setTB303Setting(id, 'filterCutoff', value); setTB303FilterCutoff(id, value); };
  const handleResonanceChange = (value: number) => { setTB303Setting(id, 'filterResonance', value); setTB303FilterResonance(id, value); };
  const handlePatternChange = (patternIndex: number) => { setActivePattern(patternIndex); };
  const triggerNote = (note: number) => { playTB303Note(id, note); };
  const notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  const octaves = [2, 3, 4];

  return (
    <div className="tb303-section">
      <div className="section-header"><h3>{name}</h3><div className="section-controls"><button onClick={() => setShowSettings(!showSettings)}>Settings</button></div></div>
      <div className="pattern-selector">{Array.from({ length: 4 }).map((_, i) => <button key={i} onClick={() => handlePatternChange(i)} className={activePattern === i ? 'active' : ''}>Pattern {i + 1}</button>)}</div>
      <div className="sequencer-grid">
        <canvas ref={canvasRef} width={400} height={80} onClick={(e) => { const rect = (e.target as HTMLCanvasElement).getBoundingClientRect(); const x = e.clientX - rect.left; const cellSize = rect.width / 16; const step = Math.floor(x / cellSize); if (step >= 0 && step < 16) { handleStepClick(step); } }} />
        <div className="step-indicators">{Array.from({ length: 16 }).map((_, i) => <div key={i} className={`step ${pattern?.steps[i].active ? 'active' : ''}`} onClick={() => handleStepClick(i)}>{i + 1}</div>)}</div>
      </div>
      <div className="note-controls"><div className="note-grid">{octaves.map(octave => <div key={octave} className="octave-row">{notes.map((note, idx) => { const noteValue = octave * 12 + idx; return <button key={note} onClick={() => triggerNote(noteValue)} className="note-key">{note}</button>; })}</div>)}</div>
      {showSettings && <div className="tb303-settings"><div className="filter-controls"><label>Cutoff: {Math.round(settings?.filterCutoff || 1000)} Hz<input type="range" min="20" max="5000" value={settings?.filterCutoff || 1000} onChange={(e) => handleCutoffChange(parseInt(e.target.value))} /></label><label>Resonance: {Math.round((settings?.filterResonance || 0) * 100)}%<input type="range" min="0" max="1" step="0.01" value={settings?.filterResonance || 0} onChange={(e) => handleResonanceChange(parseFloat(e.target.value))} /></label></div></div>}
    </div>
  );
};

export default TB303Section;
