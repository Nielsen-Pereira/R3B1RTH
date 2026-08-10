import React, { useEffect, useRef, useState } from 'react';
import { useAudioStore, useSequencerStore } from '../../store';
import { TR808Instrument } from '../../types/audio';

interface TR808SectionProps { id: number; name: string; }

const TR808_INSTRUMENTS: TR808Instrument[] = ['BD', 'SD', 'LT', 'MT', 'HT', 'RS', 'CP', 'CB', 'CY', 'OH', 'CH'];
const INSTRUMENT_NAMES: Record<TR808Instrument, string> = { BD: 'Bass Drum', SD: 'Snare Drum', LT: 'Low Tom', MT: 'Mid Tom', HT: 'High Tom', RS: 'Rimshot', CP: 'Clap', CB: 'Cowbell', CY: 'Cymbal', OH: 'Open Hi-Hat', CH: 'Closed Hi-Hat' };

export const TR808Section: React.FC<TR808SectionProps> = ({ id, name }) => {
  const [activeInstrument, setActiveInstrument] = useState<TR808Instrument>('BD');
  const [activePattern, setActivePattern] = useState<number>(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { tr808Patterns, setTR808Pattern, getTR808Pattern } = useSequencerStore();
  const { triggerKick, triggerSnare } = useAudioStore();
  const pattern = getTR808Pattern(id, activePattern, TR808_INSTRUMENTS.indexOf(activeInstrument));

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const width = canvas.width; const height = canvas.height;
    ctx.clearRect(0, 0, width, height);
    const cellSize = width / 16; ctx.strokeStyle = '#444'; ctx.lineWidth = 1;
    for (let i = 0; i <= 16; i++) { ctx.beginPath(); ctx.moveTo(i * cellSize, 0); ctx.lineTo(i * cellSize, height); ctx.stroke(); }
    if (pattern) { ctx.fillStyle = '#00ff00'; for (let step = 0; step < 16; step++) { if (pattern.steps[step].active) { ctx.fillRect(step * cellSize + 2, 2, cellSize - 4, height - 4); } } }
  }, [pattern, activePattern, activeInstrument]);

  const handleStepClick = (stepIndex: number) => { if (!pattern) return; const newPattern = { ...pattern }; newPattern.steps[stepIndex].active = !newPattern.steps[stepIndex].active; setTR808Pattern(id, activePattern, TR808_INSTRUMENTS.indexOf(activeInstrument), newPattern); };
  const handlePatternChange = (patternIndex: number) => { setActivePattern(patternIndex); };
  const triggerInstrument = (instrument: TR808Instrument) => { if (instrument === 'BD') triggerKick(id, 1.0); else if (instrument === 'SD') triggerSnare(id, 1.0); };

  return (
    <div className="tr808-section">
      <div className="section-header"><h3>{name}</h3></div>
      <div className="instrument-selector">{TR808_INSTRUMENTS.map(instrument => <button key={instrument} onClick={() => setActiveInstrument(instrument)} className={activeInstrument === instrument ? 'active' : ''}>{instrument}</button>)}</div>
      <div className="instrument-name">{INSTRUMENT_NAMES[activeInstrument]}</div>
      <div className="pattern-selector">{Array.from({ length: 4 }).map((_, i) => <button key={i} onClick={() => handlePatternChange(i)} className={activePattern === i ? 'active' : ''}>Pattern {i + 1}</button>)}</div>
      <div className="sequencer-grid">
        <canvas ref={canvasRef} width={400} height={60} onClick={(e) => { const rect = (e.target as HTMLCanvasElement).getBoundingClientRect(); const x = e.clientX - rect.left; const cellSize = rect.width / 16; const step = Math.floor(x / cellSize); if (step >= 0 && step < 16) { handleStepClick(step); } }} />
        <div className="step-indicators">{Array.from({ length: 16 }).map((_, i) => <div key={i} className={`step ${pattern?.steps[i].active ? 'active' : ''}`} onClick={() => handleStepClick(i)}>{i + 1}</div>)}</div>
      </div>
      <div className="instrument-pad"><button onClick={() => triggerInstrument(activeInstrument)} className="trigger-pad">Trigger {activeInstrument}</button></div>
    </div>
  );
};

export default TR808Section;
