/**
 * TB-303 Instrument Store - Batch 2 Development
 * R3B-95, R3B-96: TR-808/TR-909 Instruments Completion
 * 
 * Zustand store for TB-303 Bass Line synthesizer
 */

import { create } from 'zustand';
import type { InstrumentType } from '../types';

// Types
export type TB303Waveform = 'sawtooth' | 'square' | 'pulse' | 'triangle';

export type TB303Parameters = {
  cutoff: number; // 0-1
  resonance: number; // 0-1
  envMod: number; // 0-1
  decay: number; // 0-1
  accent: number; // 0-1
  volume: number; // 0-1
  waveform: TB303Waveform;
  tune: number; // -24 to +24 semitones
  slide: boolean;
};

export type TB303Voice = {
  id: number;
  note: number | null;
  playing: boolean;
  sliding: boolean;
  accented: boolean;
};

export type TB303State = {
  id: InstrumentType;
  name: string;
  enabled: boolean;
  volume: number;
  mute: boolean;
  solo: boolean;
  parameters: TB303Parameters;
  voices: TB303Voice[];
  
  // Actions
  setEnabled: (enabled: boolean) => void;
  setVolume: (volume: number) => void;
  setMute: (mute: boolean) => void;
  setSolo: (solo: boolean) => void;
  setParameter: (param: keyof TB303Parameters, value: number | TB303Waveform | boolean) => void;
  setWaveform: (waveform: TB303Waveform) => void;
  noteOn: (note: number, velocity: number, accent: boolean, slide: boolean) => void;
  noteOff: (note: number) => void;
  allNotesOff: () => void;
  reset: () => void;
};

// Default parameters
const defaultParameters: TB303Parameters = {
  cutoff: 0.5,
  resonance: 0.5,
  envMod: 0.5,
  decay: 0.5,
  accent: 0.5,
  volume: 0.8,
  waveform: 'sawtooth',
  tune: 0,
  slide: false,
};

// Store
export const useTB303Store = create<TB303State>((set) => ({
  id: 'tb303',
  name: 'TB-303',
  enabled: true,
  volume: 0.8,
  mute: false,
  solo: false,
  parameters: { ...defaultParameters },
  voices: Array.from({ length: 16 }, (_, i) => ({
    id: i,
    note: null,
    playing: false,
    sliding: false,
    accented: false,
  })),

  setEnabled: (enabled) => set({ enabled }),

  setVolume: (volume) => set({ volume: Math.max(0, Math.min(1, volume)) }),

  setMute: (mute) => set({ mute }),

  setSolo: (solo) => set({ solo }),

  setParameter: (param, value) => set((state) => ({
    parameters: {
      ...state.parameters,
      [param]: typeof value === 'number' ? Math.max(0, Math.min(1, value)) : value,
    },
  })),

  setWaveform: (waveform) => set((state) => ({
    parameters: { ...state.parameters, waveform },
  })),

  noteOn: (note, velocity, accent, slide) => set((state) => {
    const voice = state.voices.find(v => !v.playing);
    if (!voice) return state;
    
    voice.note = note;
    voice.playing = true;
    voice.sliding = slide;
    voice.accented = accent;
    
    return {
      voices: [...state.voices],
    };
  }),

  noteOff: (note) => set((state) => ({
    voices: state.voices.map(v =>
      v.note === note ? { ...v, playing: false, note: null } : v
    ),
  })),

  allNotesOff: () => set((state) => ({
    voices: state.voices.map(v => ({ ...v, playing: false, note: null })),
  })),

  reset: () => set({
    enabled: true,
    volume: 0.8,
    mute: false,
    solo: false,
    parameters: { ...defaultParameters },
    voices: Array.from({ length: 16 }, (_, i) => ({
      id: i,
      note: null,
      playing: false,
      sliding: false,
      accented: false,
    })),
  }),
}));

// Selectors
export const getTB303State = (state: TB303State) => state;

export const isTB303Enabled = (state: TB303State) => state.enabled;

export const isTB303Muted = (state: TB303State) => state.mute;

export const isTB303Solo = (state: TB303State) => state.solo;

export const getTB303Volume = (state: TB303State) => state.volume;

export const getTB303Parameter = (state: TB303State, param: keyof TB303Parameters) =>
  state.parameters[param];

// Presets
export const TB303_PRESETS = {
  'Default': defaultParameters,
  'Acid': { ...defaultParameters, waveform: 'square', cutoff: 0.7, resonance: 0.8, decay: 0.3 },
  'Deep': { ...defaultParameters, waveform: 'sawtooth', cutoff: 0.3, resonance: 0.2, decay: 0.8 },
  'Bright': { ...defaultParameters, waveform: 'pulse', cutoff: 0.9, resonance: 0.6, decay: 0.4 },
  'Punchy': { ...defaultParameters, waveform: 'square', cutoff: 0.6, resonance: 0.7, decay: 0.2, accent: 0.8 },
};

export const applyTB303Preset = (store: { getState: () => TB303State; setState: (state: Partial<TB303State>) => void }, preset: keyof typeof TB303_PRESETS) => {
  const presetConfig = TB303_PRESETS[preset];
  store.setState({ parameters: { ...presetConfig } });
};
