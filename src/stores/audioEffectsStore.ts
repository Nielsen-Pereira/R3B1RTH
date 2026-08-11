/**
 * Audio Effects Store - Batch 1 Development
 * R3B-94: Audio Effects Routing & Completion
 * 
 * Type-safe Zustand store for audio effects routing
 * Implements INSERT/SEND architecture instead of single chain
 */

import { create } from 'zustand';

// Types
export type EffectType = 'distortion' | 'pcf' | 'compressor' | 'delay';

export type EffectConfig = {
  enabled: boolean;
  wetDryMix: number;
  parameters: Record<string, number>;
};

export type EffectRouting = {
  insert: EffectType[];
  send: EffectType[];
};

export type AudioEffectsState = {
  distortion: EffectConfig;
  pcf: EffectConfig;
  compressor: EffectConfig;
  delay: EffectConfig;
  
  tb303Routing: EffectRouting;
  tr808Routing: EffectRouting;
  tr909Routing: EffectRouting;
  masterRouting: EffectRouting;
  
  setEffectConfig: (effect: EffectType, config: Partial<EffectConfig>) => void;
  setInstrumentRouting: (instrument: 'tb303' | 'tr808' | 'tr909', routing: EffectRouting) => void;
  setMasterRouting: (routing: EffectRouting) => void;
  toggleEffect: (effect: EffectType, enabled: boolean) => void;
  resetAll: () => void;
};

const defaultEffectConfig: EffectConfig = {
  enabled: false,
  wetDryMix: 0.5,
  parameters: {},
};

const defaultRouting: EffectRouting = {
  insert: [],
  send: [],
};

export const useAudioEffectsStore = create<AudioEffectsState>((set) => ({
  distortion: { ...defaultEffectConfig, parameters: { drive: 0.5, tone: 0.5 } },
  pcf: { ...defaultEffectConfig, parameters: { cutoff: 0.5, resonance: 0.5 } },
  compressor: { ...defaultEffectConfig, parameters: { threshold: -20, ratio: 4, attack: 0.1, release: 0.5 } },
  delay: { ...defaultEffectConfig, parameters: { time: 0.5, feedback: 0.3 } },
  
  tb303Routing: defaultRouting,
  tr808Routing: defaultRouting,
  tr909Routing: defaultRouting,
  masterRouting: defaultRouting,

  setEffectConfig: (effect, config) => set((state) => ({
    [effect]: { ...state[effect], ...config },
  })),

  setInstrumentRouting: (instrument, routing) => set((state) => ({
    [instrument + 'Routing']: routing,
  })),

  setMasterRouting: (routing) => set({ masterRouting: routing }),

  toggleEffect: (effect, enabled) => set((state) => ({
    [effect]: { ...state[effect], enabled },
  })),

  resetAll: () => set({
    distortion: { ...defaultEffectConfig, parameters: { drive: 0.5, tone: 0.5 } },
    pcf: { ...defaultEffectConfig, parameters: { cutoff: 0.5, resonance: 0.5 } },
    compressor: { ...defaultEffectConfig, parameters: { threshold: -20, ratio: 4, attack: 0.1, release: 0.5 } },
    delay: { ...defaultEffectConfig, parameters: { time: 0.5, feedback: 0.3 } },
    tb303Routing: defaultRouting,
    tr808Routing: defaultRouting,
    tr909Routing: defaultRouting,
    masterRouting: defaultRouting,
  })),
}));

export const getEffectConfig = (state: AudioEffectsState, effect: EffectType): EffectConfig =>
  state[effect];

export const getInstrumentRouting = (
  state: AudioEffectsState,
  instrument: 'tb303' | 'tr808' | 'tr909'
): EffectRouting => state[instrument + 'Routing'];

export const getMasterRouting = (state: AudioEffectsState): EffectRouting =>
  state.masterRouting;

export const isEffectUsed = (state: AudioEffectsState, effect: EffectType): boolean => {
  const allRoutings = [
    state.tb303Routing,
    state.tr808Routing,
    state.tr909Routing,
    state.masterRouting,
  ];
  return allRoutings.some((routing) =>
    routing.insert.includes(effect) || routing.send.includes(effect)
  );
};
