import { create } from 'zustand';
import { AudioState, EffectsSettings } from '../types/audio';

const defaultEffects: EffectsSettings = {
  distortion: { amount: 0.5, shape: 0.5, enabled: false },
  pcf: { pattern: 0, mode: 'LP', cutoff: 0.5, resonance: 0.5, amount: 0.5, enabled: false },
  compressor: { threshold: -24, ratio: 4, attack: 0.1, release: 0.2, gain: 0.5, enabled: false },
  delay: { steps: 8, feedback: 0.5, pan: 0.5, amount: 0.5, enabled: false },
};

const initialState: AudioState = {
  audioContext: null,
  isAudioReady: false,
  masterVolume: 0.8,
  effects: defaultEffects,
};

export const useAudioStore = create<AudioState & {
  setAudioContext: (ctx: AudioContext | null) => void;
  setAudioReady: (ready: boolean) => void;
  setMasterVolume: (vol: number) => void;
  setEffects: (e: Partial<EffectsSettings>) => void;
  setEffect: <K extends keyof EffectsSettings>(name: K, settings: Partial<EffectsSettings[K]>) => void;
  toggleEffect: (name: keyof EffectsSettings) => void;
  resetEffects: () => void;
}>((set, get) => ({
  ...initialState,
  setAudioContext: (ctx) => set({ audioContext: ctx }),
  setAudioReady: (ready) => set({ isAudioReady: ready }),
  setMasterVolume: (vol) => set({ masterVolume: Math.max(0, Math.min(1, vol)) }),
  setEffects: (e) => set((state) => ({ effects: { ...state.effects, ...e } })),
  setEffect: (name, settings) => set((state) => ({
    effects: { ...state.effects, [name]: { ...state.effects[name], ...settings } }
  })),
  toggleEffect: (name) => set((state) => ({
    effects: { ...state.effects, [name]: { ...state.effects[name], enabled: !state.effects[name].enabled } }
  })),
  resetEffects: () => set({ effects: defaultEffects }),
}));
