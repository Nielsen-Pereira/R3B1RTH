/**
 * TB-303 Instrument Store - Enhanced for Batch 4
 * R3B-95, R3B-96, R3B-135: TR-808/TR-909 + TB-303 Advanced Parameters
 *
 * Zustand store for TB-303 Bass Line synthesizer with advanced parameters
 */

import { create } from 'zustand';
import type { InstrumentType } from '../types';

// Types
export type TB303Waveform = 'sawtooth' | 'square' | 'pulse' | 'triangle';

export type TB303Envelope = {
  attack: number;  // 0-1
  decay: number;   // 0-1
  sustain: number; // 0-1
  release: number; // 0-1
};

export type TB303Parameters = {
  // Basic parameters (Batch 2)
  cutoff: number;
  resonance: number;
  envMod: number;
  decay: number;
  accent: number;
  volume: number;
  waveform: TB303Waveform;
  tune: number;
  slide: boolean;
  
  // Advanced parameters (Batch 4 - R3B-135)
  accentAmount: number;      // 0-1: Amount of accent modulation
  slideTime: number;         // 0-1: Slide time between notes
  cutoffEnv: TB303Envelope;  // Cutoff envelope ADSR
  accentVelocity: number;    // 0-1: Velocity sensitivity for accent
  portamento: boolean;       // Portamento mode (legacy slide behavior)
};

export type TB303Voice = {
  id: number;
  note: number | null;
  playing: boolean;
  sliding: boolean;
  accented: boolean;
  slideStartNote: number | null;
  slideProgress: number;
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
  setParameter: (param: keyof TB303Parameters, value: number | TB303Waveform | boolean | TB303Envelope) => void;
  setWaveform: (waveform: TB303Waveform) => void;
  setCutoffEnv: (env: TB303Envelope) => void;
  noteOn: (note: number, velocity: number, accent: boolean, slide: boolean) => void;
  noteOff: (note: number) => void;
  allNotesOff: () => void;
  reset: () => void;
};

// Default envelope
const defaultEnvelope: TB303Envelope = {
  attack: 0.1,
  decay: 0.5,
  sustain: 0.5,
  release: 0.3,
};

// Default parameters
const defaultParameters: TB303Parameters = {
  // Basic
  cutoff: 0.5,
  resonance: 0.5,
  envMod: 0.5,
  decay: 0.5,
  accent: 0.5,
  volume: 0.8,
  waveform: 'sawtooth',
  tune: 0,
  slide: false,
  
  // Advanced
  accentAmount: 0.5,
  slideTime: 0.3,
  cutoffEnv: { ...defaultEnvelope },
  accentVelocity: 0.5,
  portamento: false,
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
    slideStartNote: null,
    slideProgress: 0,
  })),

  setEnabled: (enabled) => set({ enabled }),

  setVolume: (volume) => set({ volume: Math.max(0, Math.min(1, volume)) }),

  setMute: (mute) => set({ mute }),

  setSolo: (solo) => set({ solo }),

  setParameter: (param, value) => set((state) => ({
    parameters: {
      ...state.parameters,
      [param]: typeof value === 'number' 
        ? Math.max(0, Math.min(1, value)) 
        : typeof value === 'boolean' 
          ? value 
          : value,
    },
  })),

  setWaveform: (waveform) => set((state) => ({
    parameters: { ...state.parameters, waveform },
  })),

  setCutoffEnv: (env) => set((state) => ({
    parameters: {
      ...state.parameters,
      cutoffEnv: {
        attack: Math.max(0, Math.min(1, env.attack)),
        decay: Math.max(0, Math.min(1, env.decay)),
        sustain: Math.max(0, Math.min(1, env.sustain)),
        release: Math.max(0, Math.min(1, env.release)),
      },
    },
  })),

  noteOn: (note, velocity, accent, slide) => set((state) => {
    const voice = state.voices.find(v => !v.playing);
    if (!voice) return state;
    
    voice.note = note;
    voice.playing = true;
    voice.sliding = slide;
    voice.accented = accent;
    voice.slideStartNote = slide ? voice.note : null;
    voice.slideProgress = 0;
    
    return { voices: [...state.voices] };
  }),

  noteOff: (note) => set((state) => ({
    voices: state.voices.map(v =>
      v.note === note ? { ...v, playing: false, note: null, slideStartNote: null } : v
    ),
  })),

  allNotesOff: () => set((state) => ({
    voices: state.voices.map(v => ({
      ...v,
      playing: false,
      note: null,
      sliding: false,
      accented: false,
      slideStartNote: null,
      slideProgress: 0,
    })),
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
      slideStartNote: null,
      slideProgress: 0,
    })),
  }),
}));

// Selectors
export const getTB303State = (state: TB303State) => state;
export const isTB303Enabled = (state: TB303State) => state.enabled;
export const isTB303Muted = (state: TB303State) => state.mute;
export const isTB303Solo = (state: TB303State) => state.solo;
export const getTB303Volume = (state: TB303State) => state.volume;
export const getTB303Parameter = (state: TB303State, param: keyof TB303Parameters) => state.parameters[param];
export const getTB303CutoffEnv = (state: TB303State) => state.parameters.cutoffEnv;

// Presets
export const TB303_PRESETS = {
  'Default': defaultParameters,
  'Acid': { 
    ...defaultParameters, 
    waveform: 'square', 
    cutoff: 0.7, 
    resonance: 0.8, 
    decay: 0.3,
    accentAmount: 0.8,
    cutoffEnv: { attack: 0.05, decay: 0.6, sustain: 0.3, release: 0.2 }
  },
  'Deep': { 
    ...defaultParameters, 
    waveform: 'sawtooth', 
    cutoff: 0.3, 
    resonance: 0.2, 
    decay: 0.8,
    cutoffEnv: { attack: 0.2, decay: 0.7, sustain: 0.6, release: 0.5 }
  },
  'Bright': { 
    ...defaultParameters, 
    waveform: 'pulse', 
    cutoff: 0.9, 
    resonance: 0.6, 
    decay: 0.4,
    accentAmount: 0.7
  },
  'Punchy': { 
    ...defaultParameters, 
    waveform: 'square', 
    cutoff: 0.6, 
    resonance: 0.7, 
    decay: 0.2, 
    accent: 0.8,
    accentAmount: 0.9,
    cutoffEnv: { attack: 0.01, decay: 0.8, sustain: 0.2, release: 0.1 }
  },
  'Slidy': {
    ...defaultParameters,
    slide: true,
    slideTime: 0.5,
    portamento: true,
    cutoffEnv: { attack: 0.3, decay: 0.5, sustain: 0.7, release: 0.4 }
  },
};

export const applyTB303Preset = (store: { getState: () => TB303State; setState: (state: Partial<TB303State>) => void }, preset: keyof typeof TB303_PRESETS) => {
  const presetConfig = TB303_PRESETS[preset];
  store.setState({ parameters: { ...presetConfig } });
};
