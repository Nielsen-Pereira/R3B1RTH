/**
 * Audio Effects Store - R3B-81: Audio Effects Routing
 *
 * Unified Zustand store for audio effects with routing and parameters
 * Implements INSERT/SEND architecture per ReBirth RB-338 manual section 58
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
  setEffectParameter: (effect: EffectType, param: string, value: number) => void;
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

const defaultDistortionParams = { drive: 0.5, tone: 0.5 };
const defaultPCFParams = { cutoff: 0.5, resonance: 0.5 };
const defaultCompressorParams = { threshold: -20, ratio: 4, attack: 0.1, release: 0.5 };
const defaultDelayParams = { time: 0.5, feedback: 0.3 };

export const useAudioEffectsStore = create<AudioEffectsState>((set) => ({
  distortion: { ...defaultEffectConfig, parameters: { ...defaultDistortionParams }, enabled: true },
  pcf: { ...defaultEffectConfig, parameters: { ...defaultPCFParams }, enabled: true },
  compressor: { ...defaultEffectConfig, parameters: { ...defaultCompressorParams }, enabled: true },
  delay: { ...defaultEffectConfig, parameters: { ...defaultDelayParams }, enabled: true },
  
  tb303Routing: defaultRouting,
  tr808Routing: defaultRouting,
  tr909Routing: defaultRouting,
  masterRouting: defaultRouting,

  setEffectConfig: (effect, config) => set((state) => ({
    [effect]: { ...state[effect], ...config },
  })),

  setEffectParameter: (effect, param, value) => set((state) => ({
    [effect]: { 
      ...state[effect], 
      parameters: { 
        ...state[effect].parameters, 
        [param]: value 
      } 
    },
  })),

  setInstrumentRouting: (instrument, routing) => set((state) => ({
    [instrument + 'Routing']: routing,
  })),

  setMasterRouting: (routing) => set({ masterRouting: routing }),

  toggleEffect: (effect, enabled) => set((state) => ({
    [effect]: { ...state[effect], enabled },
  })),

  resetAll: () => set({
    distortion: { ...defaultEffectConfig, parameters: { ...defaultDistortionParams }, enabled: true },
    pcf: { ...defaultEffectConfig, parameters: { ...defaultPCFParams }, enabled: true },
    compressor: { ...defaultEffectConfig, parameters: { ...defaultCompressorParams }, enabled: true },
    delay: { ...defaultEffectConfig, parameters: { ...defaultDelayParams }, enabled: true },
    tb303Routing: defaultRouting,
    tr808Routing: defaultRouting,
    tr909Routing: defaultRouting,
    masterRouting: defaultRouting,
  })),
}));

export const getEffectConfig = (state: AudioEffectsState, effect: EffectType): EffectConfig =>
  state[effect];

export const getEffectParameter = (state: AudioEffectsState, effect: EffectType, param: string): number =>
  state[effect].parameters[param];

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

export const getDistortionDrive = (state: AudioEffectsState): number =>
  state.distortion.parameters.drive;
export const getDistortionTone = (state: AudioEffectsState): number =>
  state.distortion.parameters.tone;

export const getPCFCutoff = (state: AudioEffectsState): number =>
  state.pcf.parameters.cutoff;
export const getPCFResonance = (state: AudioEffectsState): number =>
  state.pcf.parameters.resonance;

export const getCompressorThreshold = (state: AudioEffectsState): number =>
  state.compressor.parameters.threshold;
export const getCompressorRatio = (state: AudioEffectsState): number =>
  state.compressor.parameters.ratio;
export const getCompressorAttack = (state: AudioEffectsState): number =>
  state.compressor.parameters.attack;
export const getCompressorRelease = (state: AudioEffectsState): number =>
  state.compressor.parameters.release;

export const getDelayTime = (state: AudioEffectsState): number =>
  state.delay.parameters.time;
export const getDelayFeedback = (state: AudioEffectsState): number =>
  state.delay.parameters.feedback;
