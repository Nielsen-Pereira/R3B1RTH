/**
 * Audio Effects Store - Batch 7 Development
 * R3B-94: Audio Effects Routing & Completion
 * 
 * Type-safe Zustand store for audio effects routing
 * Implements INSERT/SEND architecture instead of single chain
 */

import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

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

export type InstrumentType = 'tb303' | 'tr808' | 'tr909' | 'master';

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
  setInstrumentRouting: (instrument: InstrumentType, routing: EffectRouting) => void;
  setMasterRouting: (routing: EffectRouting) => void;
  toggleEffect: (effect: EffectType, enabled: boolean) => void;
  
  addEffectToInsert: (instrument: InstrumentType, effect: EffectType) => void;
  addEffectToSend: (instrument: InstrumentType, effect: EffectType) => void;
  removeEffectFromInsert: (instrument: InstrumentType, effect: EffectType) => void;
  removeEffectFromSend: (instrument: InstrumentType, effect: EffectType) => void;
  moveEffectToInsert: (instrument: InstrumentType, effect: EffectType) => void;
  moveEffectToSend: (instrument: InstrumentType, effect: EffectType) => void;
  
  resetAll: () => void;
  resetInstrumentRouting: (instrument: InstrumentType) => void;
  
  getEffectConfig: (effect: EffectType) => EffectConfig;
  getInstrumentRouting: (instrument: InstrumentType) => EffectRouting;
  getMasterRouting: () => EffectRouting;
  isEffectUsed: (effect: EffectType) => boolean;
  isEffectInInsert: (instrument: InstrumentType, effect: EffectType) => boolean;
  isEffectInSend: (instrument: InstrumentType, effect: EffectType) => boolean;
  getAllRoutings: () => Record<InstrumentType, EffectRouting>;
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

const effectDefaults: Record<EffectType, EffectConfig> = {
  distortion: { ...defaultEffectConfig, parameters: { drive: 0.5, tone: 0.5 } },
  pcf: { ...defaultEffectConfig, parameters: { cutoff: 0.5, resonance: 0.5 } },
  compressor: { ...defaultEffectConfig, parameters: { threshold: -20, ratio: 4, attack: 0.1, release: 0.5 } },
  delay: { ...defaultEffectConfig, parameters: { time: 0.5, feedback: 0.3 } },
};

export const useAudioEffectsStore = create<AudioEffectsState>()(
  devtools(
    persist(
      (set, get) => ({
        distortion: { ...effectDefaults.distortion },
        pcf: { ...effectDefaults.pcf },
        compressor: { ...effectDefaults.compressor },
        delay: { ...effectDefaults.delay },
        
        tb303Routing: { ...defaultRouting },
        tr808Routing: { ...defaultRouting },
        tr909Routing: { ...defaultRouting },
        masterRouting: { ...defaultRouting },

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

        addEffectToInsert: (instrument, effect) => set((state) => {
          const currentRouting = state[instrument + 'Routing'];
          if (currentRouting.insert.includes(effect) || currentRouting.send.includes(effect)) {
            return state;
          }
          return {
            [instrument + 'Routing']: {
              ...currentRouting,
              insert: [...currentRouting.insert, effect],
            },
          };
        }),

        addEffectToSend: (instrument, effect) => set((state) => {
          const currentRouting = state[instrument + 'Routing'];
          if (currentRouting.insert.includes(effect) || currentRouting.send.includes(effect)) {
            return state;
          }
          return {
            [instrument + 'Routing']: {
              ...currentRouting,
              send: [...currentRouting.send, effect],
            },
          };
        }),

        removeEffectFromInsert: (instrument, effect) => set((state) => {
          const currentRouting = state[instrument + 'Routing'];
          return {
            [instrument + 'Routing']: {
              ...currentRouting,
              insert: currentRouting.insert.filter(e => e !== effect),
            },
          };
        }),

        removeEffectFromSend: (instrument, effect) => set((state) => {
          const currentRouting = state[instrument + 'Routing'];
          return {
            [instrument + 'Routing']: {
              ...currentRouting,
              send: currentRouting.send.filter(e => e !== effect),
            },
          };
        }),

        moveEffectToInsert: (instrument, effect) => set((state) => {
          const currentRouting = state[instrument + 'Routing'];
          const newSend = currentRouting.send.filter(e => e !== effect);
          const newInsert = currentRouting.insert.includes(effect)
            ? currentRouting.insert
            : [...currentRouting.insert, effect];
          return {
            [instrument + 'Routing']: {
              insert: newInsert,
              send: newSend,
            },
          };
        }),

        moveEffectToSend: (instrument, effect) => set((state) => {
          const currentRouting = state[instrument + 'Routing'];
          const newInsert = currentRouting.insert.filter(e => e !== effect);
          const newSend = currentRouting.send.includes(effect)
            ? currentRouting.send
            : [...currentRouting.send, effect];
          return {
            [instrument + 'Routing']: {
              insert: newInsert,
              send: newSend,
            },
          };
        }),

        resetAll: () => set({
          distortion: { ...effectDefaults.distortion },
          pcf: { ...effectDefaults.pcf },
          compressor: { ...effectDefaults.compressor },
          delay: { ...effectDefaults.delay },
          tb303Routing: { ...defaultRouting },
          tr808Routing: { ...defaultRouting },
          tr909Routing: { ...defaultRouting },
          masterRouting: { ...defaultRouting },
        }),

        resetInstrumentRouting: (instrument) => set((state) => ({
          [instrument + 'Routing']: { ...defaultRouting },
        })),

        getEffectConfig: (effect) => get()[effect],
        getInstrumentRouting: (instrument) => get()[instrument + 'Routing'],
        getMasterRouting: () => get().masterRouting,
        
        isEffectUsed: (effect) => {
          const state = get();
          const allRoutings = [
            state.tb303Routing,
            state.tr808Routing,
            state.tr909Routing,
            state.masterRouting,
          ];
          return allRoutings.some((routing) =>
            routing.insert.includes(effect) || routing.send.includes(effect)
          );
        },
        
        isEffectInInsert: (instrument, effect) => {
          const routing = get()[instrument + 'Routing'];
          return routing.insert.includes(effect);
        },
        
        isEffectInSend: (instrument, effect) => {
          const routing = get()[instrument + 'Routing'];
          return routing.send.includes(effect);
        },
        
        getAllRoutings: () => ({
          tb303: get().tb303Routing,
          tr808: get().tr808Routing,
          tr909: get().tr909Routing,
          master: get().masterRouting,
        }),
      }),
      {
        name: 'audio-effects-store',
        partialize: (state) => ({
          distortion: state.distortion,
          pcf: state.pcf,
          compressor: state.compressor,
          delay: state.delay,
          tb303Routing: state.tb303Routing,
          tr808Routing: state.tr808Routing,
          tr909Routing: state.tr909Routing,
          masterRouting: state.masterRouting,
        }),
      }
    ),
    { name: 'AudioEffectsStore' }
  )
);

export const getEffectConfig = (effect: EffectType): EffectConfig =>
  useAudioEffectsStore.getState().getEffectConfig(effect);

export const getInstrumentRouting = (
  instrument: InstrumentType
): EffectRouting =>
  useAudioEffectsStore.getState().getInstrumentRouting(instrument);

export const getMasterRouting = (): EffectRouting =>
  useAudioEffectsStore.getState().getMasterRouting();

export const isEffectUsed = (effect: EffectType): boolean =>
  useAudioEffectsStore.getState().isEffectUsed(effect);

export const isEffectInInsert = (
  instrument: InstrumentType,
  effect: EffectType
): boolean =>
  useAudioEffectsStore.getState().isEffectInInsert(instrument, effect);

export const isEffectInSend = (
  instrument: InstrumentType,
  effect: EffectType
): boolean =>
  useAudioEffectsStore.getState().isEffectInSend(instrument, effect);

export const getAllRoutings = (): Record<InstrumentType, EffectRouting> =>
  useAudioEffectsStore.getState().getAllRoutings();

export const EFFECT_PRESETS = {
  subtle: {
    distortion: { enabled: true, wetDryMix: 0.2, parameters: { drive: 0.3, tone: 0.5 } },
    pcf: { enabled: true, wetDryMix: 0.3, parameters: { cutoff: 0.7, resonance: 0.3 } },
    compressor: { enabled: true, wetDryMix: 0.4, parameters: { threshold: -24, ratio: 2, attack: 0.1, release: 0.3 } },
    delay: { enabled: false, wetDryMix: 0.5, parameters: { time: 0.3, feedback: 0.2 } },
  },
  aggressive: {
    distortion: { enabled: true, wetDryMix: 0.8, parameters: { drive: 0.9, tone: 0.7 } },
    pcf: { enabled: true, wetDryMix: 0.6, parameters: { cutoff: 0.4, resonance: 0.8 } },
    compressor: { enabled: true, wetDryMix: 0.7, parameters: { threshold: -12, ratio: 8, attack: 0.05, release: 0.2 } },
    delay: { enabled: false, wetDryMix: 0.5, parameters: { time: 0.5, feedback: 0.4 } },
  },
  ambient: {
    distortion: { enabled: false, wetDryMix: 0.5, parameters: { drive: 0.5, tone: 0.5 } },
    pcf: { enabled: true, wetDryMix: 0.5, parameters: { cutoff: 0.3, resonance: 0.5 } },
    compressor: { enabled: false, wetDryMix: 0.5, parameters: { threshold: -20, ratio: 4, attack: 0.1, release: 0.5 } },
    delay: { enabled: true, wetDryMix: 0.7, parameters: { time: 0.7, feedback: 0.6 } },
  },
};

export const applyEffectPreset = (preset: keyof typeof EFFECT_PRESETS) => {
  const presetConfig = EFFECT_PRESETS[preset];
  const store = useAudioEffectsStore.getState();
  store.setEffectConfig('distortion', presetConfig.distortion);
  store.setEffectConfig('pcf', presetConfig.pcf);
  store.setEffectConfig('compressor', presetConfig.compressor);
  store.setEffectConfig('delay', presetConfig.delay);
};