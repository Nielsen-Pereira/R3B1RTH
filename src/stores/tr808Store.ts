/**
 * TR-808 Instrument Store - Batch 2 Development
 * R3B-97, R3B-98: TR-808/TR-909 Instruments Completion
 */

import { create } from 'zustand';
import type { InstrumentType } from '../types';

export type TR808Drum = 'bd' | 'sd' | 'lt' | 'mt' | 'ht' | 'cp' | 'oh' | 'ch' | 'cy' | 'cl';

export type TR808Parameters = {
  volume: number;
  tune: number;
  decay: number;
  pan: number;
  accent: number;
};

export type TR808DrumState = {
  id: TR808Drum;
  name: string;
  enabled: boolean;
  parameters: TR808Parameters;
  playing: boolean;
  accented: boolean;
};

export type TR808State = {
  id: InstrumentType;
  name: string;
  enabled: boolean;
  volume: number;
  mute: boolean;
  solo: boolean;
  drums: TR808DrumState[];
  
  setEnabled: (enabled: boolean) => void;
  setVolume: (volume: number) => void;
  setMute: (mute: boolean) => void;
  setSolo: (solo: boolean) => void;
  setDrumParameter: (drumId: TR808Drum, param: keyof TR808Parameters, value: number) => void;
  setDrumEnabled: (drumId: TR808Drum, enabled: boolean) => void;
  noteOn: (drumId: TR808Drum, velocity: number, accent: boolean) => void;
  noteOff: (drumId: TR808Drum) => void;
  allNotesOff: () => void;
  reset: () => void;
};

const defaultDrumParameters: TR808Parameters = {
  volume: 0.8,
  tune: 0,
  decay: 0.5,
  pan: 0,
  accent: 0.5,
};

const drums: { id: TR808Drum; name: string }[] = [
  { id: 'bd', name: 'Bass Drum' },
  { id: 'sd', name: 'Snare Drum' },
  { id: 'lt', name: 'Low Tom' },
  { id: 'mt', name: 'Mid Tom' },
  { id: 'ht', name: 'High Tom' },
  { id: 'cp', name: 'Clap' },
  { id: 'oh', name: 'Open Hi-Hat' },
  { id: 'ch', name: 'Closed Hi-Hat' },
  { id: 'cy', name: 'Crash Cymbal' },
  { id: 'cl', name: 'Claves' },
];

export const useTR808Store = create<TR808State>((set) => ({
  id: 'tr808',
  name: 'TR-808',
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
        ? { ...drum, parameters: { ...drum.parameters, [param]: Math.max(-24, Math.min(24, value)) } }
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

export const getTR808State = (state: TR808State) => state;
export const isTR808Enabled = (state: TR808State) => state.enabled;
export const isTR808Muted = (state: TR808State) => state.mute;
export const isTR808Solo = (state: TR808State) => state.solo;
export const getTR808Volume = (state: TR808State) => state.volume;
export const getDrumState = (state: TR808State, drumId: TR808Drum) =>
  state.drums.find(d => d.id === drumId);
export const isDrumEnabled = (state: TR808State, drumId: TR808Drum) =>
  getDrumState(state, drumId)?.enabled || false;
export const getDrumParameter = (state: TR808State, drumId: TR808Drum, param: keyof TR808Parameters) =>
  getDrumState(state, drumId)?.parameters[param];

export const TR808_PRESETS = {
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

export const applyTR808Preset = (store: { getState: () => TR808State; setState: (state: Partial<TR808State>) => void }, preset: keyof typeof TR808_PRESETS) => {
  const presetConfig = TR808_PRESETS[preset];
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
