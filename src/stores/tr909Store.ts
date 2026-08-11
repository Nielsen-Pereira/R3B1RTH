/**
 * TR-909 Instrument Store - Batch 2 Development
 * R3B-97, R3B-98: TR-808/TR-909 Instruments Completion
 * 
 * Zustand store for TR-909 Drum Machine
 */

import { create } from 'zustand';
import type { InstrumentType } from '../types';

// Types
export type TR909Drum = 'bd' | 'sd' | 'lt' | 'mt' | 'ht' | 'cp' | 'oh' | 'ch' | 'cy' | 'rd' | 'rc';

export type TR909Parameters = {
  volume: number; // 0-1
  tune: number; // -24 to +24 semitones
  decay: number; // 0-1
  pan: number; // -1 to 1
  accent: number; // 0-1
  attack: number; // 0-1 (for toms and cymbals)
};

export type TR909DrumState = {
  id: TR909Drum;
  name: string;
  enabled: boolean;
  parameters: TR909Parameters;
  playing: boolean;
  accented: boolean;
};

export type TR909State = {
  id: InstrumentType;
  name: string;
  enabled: boolean;
  volume: number;
  mute: boolean;
  solo: boolean;
  drums: TR909DrumState[];
  
  // Actions
  setEnabled: (enabled: boolean) => void;
  setVolume: (volume: number) => void;
  setMute: (mute: boolean) => void;
  setSolo: (solo: boolean) => void;
  setDrumParameter: (drumId: TR909Drum, param: keyof TR909Parameters, value: number) => void;
  setDrumEnabled: (drumId: TR909Drum, enabled: boolean) => void;
  noteOn: (drumId: TR909Drum, velocity: number, accent: boolean) => void;
  noteOff: (drumId: TR909Drum) => void;
  allNotesOff: () => void;
  reset: () => void;
};

// Default parameters
const defaultDrumParameters: TR909Parameters = {
  volume: 0.8,
  tune: 0,
  decay: 0.5,
  pan: 0,
  accent: 0.5,
  attack: 0.1,
};

// Drum definitions
const drums: { id: TR909Drum; name: string }[] = [
  { id: 'bd', name: 'Bass Drum' },
  { id: 'sd', name: 'Snare Drum' },
  { id: 'lt', name: 'Low Tom' },
  { id: 'mt', name: 'Mid Tom' },
  { id: 'ht', name: 'High Tom' },
  { id: 'cp', name: 'Clap' },
  { id: 'oh', name: 'Open Hi-Hat' },
  { id: 'ch', name: 'Closed Hi-Hat' },
  { id: 'cy', name: 'Crash Cymbal' },
  { id: 'rd', name: 'Ride Cymbal' },
  { id: 'rc', name: 'Rimshot' },
];

// Store
export const useTR909Store = create<TR909State>((set) => ({
  id: 'tr909',
  name: 'TR-909',
  enabled: true,
  volume: 0.8,
  mute: false,
  solo: false,
  drums: drums.map(drum => ({
    id: drum.id,
    name: drum.name,
    enabled: true,
    parameters: { ...defaultDrumParameters },
    playing: false,
    accented: false,
  })),

  setEnabled: (enabled) => set({ enabled }),

  setVolume: (volume) => set({ volume: Math.max(0, Math.min(1, volume)) }),

  setMute: (mute) => set({ mute }),

  setSolo: (solo) => set({ solo }),

  setDrumParameter: (drumId, param, value) => set((state) => ({
    drums: state.drums.map(drum =>
      drum.id === drumId
        ? { ...drum, parameters: { ...drum.parameters, [param]: Math.max(0, Math.min(1, value)) } }
        : drum
    ),
  })),

  setDrumEnabled: (drumId, enabled) => set((state) => ({
    drums: state.drums.map(drum =>
      drum.id === drumId ? { ...drum, enabled } : drum
    ),
  })),

  noteOn: (drumId, velocity, accent) => set((state) => ({
    drums: state.drums.map(drum =>
      drum.id === drumId
        ? { ...drum, playing: true, accented: accent }
        : drum
    ),
  })),

  noteOff: (drumId) => set((state) => ({
    drums: state.drums.map(drum =>
      drum.id === drumId ? { ...drum, playing: false, accented: false } : drum
    ),
  })),

  allNotesOff: () => set((state) => ({
    drums: state.drums.map(drum => ({ ...drum, playing: false, accented: false })),
  })),

  reset: () => set({
    enabled: true,
    volume: 0.8,
    mute: false,
    solo: false,
    drums: drums.map(drum => ({
      id: drum.id,
      name: drum.name,
      enabled: true,
      parameters: { ...defaultDrumParameters },
      playing: false,
      accented: false,
    })),
  }),
}));

// Selectors
export const getTR909State = (state: TR909State) => state;

export const isTR909Enabled = (state: TR909State) => state.enabled;

export const isTR909Muted = (state: TR909State) => state.mute;

export const isTR909Solo = (state: TR909State) => state.solo;

export const getTR909Volume = (state: TR909State) => state.volume;

export const getTR909DrumState = (state: TR909State, drumId: TR909Drum) =>
  state.drums.find(d => d.id === drumId);

export const isTR909DrumEnabled = (state: TR909State, drumId: TR909Drum) =>
  getTR909DrumState(state, drumId)?.enabled || false;

export const getTR909DrumParameter = (state: TR909State, drumId: TR909Drum, param: keyof TR909Parameters) =>
  getTR909DrumState(state, drumId)?.parameters[param];

// Presets
export const TR909_PRESETS = {
  'Default': drums.map(d => ({ id: d.id, parameters: { ...defaultDrumParameters } })),
  'Punchy': drums.map(d => ({
    id: d.id,
    parameters: {
      ...defaultDrumParameters,
      decay: d.id === 'bd' ? 0.3 : d.id === 'sd' ? 0.4 : 0.5,
      accent: d.id === 'bd' || d.id === 'sd' ? 0.8 : 0.5,
    }
  })),
  'Boomy': drums.map(d => ({
    id: d.id,
    parameters: {
      ...defaultDrumParameters,
      tune: d.id === 'bd' ? -12 : d.id === 'sd' ? -6 : 0,
      decay: d.id === 'bd' ? 0.8 : 0.5,
    }
  })),
  'Tight': drums.map(d => ({
    id: d.id,
    parameters: {
      ...defaultDrumParameters,
      decay: 0.2,
      accent: 0.7,
    }
  })),
};

export const applyTR909Preset = (store: { getState: () => TR909State; setState: (state: Partial<TR909State>) => void }, preset: keyof typeof TR909_PRESETS) => {
  const presetConfig = TR909_PRESETS[preset];
  store.setState({
    drums: drums.map(drum => {
      const presetDrum = presetConfig.find(p => p.id === drum.id);
      return {
        ...drum,
        parameters: presetDrum ? { ...presetDrum.parameters } : { ...drum.parameters },
      };
    }),
  });
};