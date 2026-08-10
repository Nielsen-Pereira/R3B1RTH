import { create } from 'zustand';
import { getAudioEngine } from '../utils/audioEngine';
import { AudioStoreState, TB303Settings, DrumSettings, DistortionSettings, PCFSettings, CompressorSettings, DelaySettings, TransportState, GlobalSettings } from '../types/audio';

const defaultTB303Settings: TB303Settings = { filterCutoff: 1000, filterResonance: 0.5, filterEnvelope: 0.5, accent: 0.5, slide: 0.5, volume: 0.8, pan: 0 };
const defaultDrumSettings: DrumSettings = { decay: 0.5, tone: 0.5, volume: 0.8, pan: 0 };
const defaultDistortionSettings: DistortionSettings = { enabled: true, wet: 0.5, drive: 0.5 };
const defaultPCFSettings: PCFSettings = { enabled: true, wet: 0.5, delayTime: 0.003, feedback: 0.5 };
const defaultCompressorSettings: CompressorSettings = { enabled: true, wet: 1.0, threshold: -20, ratio: 4, attack: 0.01, release: 0.1 };
const defaultDelaySettings: DelaySettings = { enabled: true, wet: 0.5, delayTime: 0.3, feedback: 0.5 };

const initialState: AudioStoreState = {
  tb303Synths: [{ ...defaultTB303Settings }, { ...defaultTB303Settings }],
  tr808Drums: Array(11).fill(null).map(() => ({ ...defaultDrumSettings })),
  tr909Drums: Array(11).fill(null).map(() => ({ ...defaultDrumSettings })),
  distortion: [{ ...defaultDistortionSettings }, { ...defaultDistortionSettings }],
  pcf: [{ ...defaultPCFSettings }, { ...defaultPCFSettings }],
  compressor: [{ ...defaultCompressorSettings }, { ...defaultCompressorSettings }],
  delay: [{ ...defaultDelaySettings }, { ...defaultDelaySettings }],
  transport: { isPlaying: false, bpm: 120, currentBeat: 0, currentStep: 0 },
  global: { bpm: 120, swing: 0, masterVolume: 0.7 }
};

interface AudioStoreActions {
  start: () => void;
  stop: () => void;
  setBPM: (bpm: number) => void;
  getCurrentBeat: () => number;
  playTB303Note: (synthIndex: number, note: number, velocity?: number) => void;
  stopTB303Note: (synthIndex: number, time?: number) => void;
  setTB303FilterCutoff: (synthIndex: number, cutoff: number) => void;
  setTB303FilterResonance: (synthIndex: number, resonance: number) => void;
  triggerKick: (drumIndex: number, velocity: number) => void;
  triggerSnare: (drumIndex: number, velocity: number) => void;
  triggerHiHat: (drumIndex: number, velocity: number) => void;
  setDistortionDrive: (effectIndex: number, drive: number) => void;
  setPCFWet: (effectIndex: number, wet: number) => void;
  setPCFDelayTime: (effectIndex: number, time: number) => void;
  setPCFFeedback: (effectIndex: number, feedback: number) => void;
  setCompressorThreshold: (effectIndex: number, threshold: number) => void;
  setDelayWet: (effectIndex: number, wet: number) => void;
  setDelayTime: (effectIndex: number, time: number) => void;
  setDelayFeedback: (effectIndex: number, feedback: number) => void;
  setMasterVolume: (volume: number) => void;
  destroy: () => void;
}

type AudioStore = AudioStoreState & AudioStoreActions;

export const useAudioStore = create<AudioStore>((set, get) => ({
  ...initialState,
  start: () => { const engine = getAudioEngine(); engine.start(); set({ transport: { ...get().transport, isPlaying: true } }); },
  stop: () => { const engine = getAudioEngine(); engine.stop(); set({ transport: { ...get().transport, isPlaying: false, currentBeat: 0, currentStep: 0 } }); },
  setBPM: (bpm: number) => { const engine = getAudioEngine(); engine.setBPM(bpm); set({ transport: { ...get().transport, bpm }, global: { ...get().global, bpm } }); },
  getCurrentBeat: () => getAudioEngine().getCurrentBeat(),
  playTB303Note: (synthIndex: number, note: number, velocity: number = 1.0) => getAudioEngine().playTB303Note(synthIndex, note, velocity),
  stopTB303Note: (synthIndex: number, time: number = 0) => getAudioEngine().stopTB303Note(synthIndex, time),
  setTB303FilterCutoff: (synthIndex: number, cutoff: number) => { getAudioEngine().setTB303FilterCutoff(synthIndex, cutoff); set({ tb303Synths: get().tb303Synths.map((s, i) => i === synthIndex ? { ...s, filterCutoff: cutoff } : s) }); },
  setTB303FilterResonance: (synthIndex: number, resonance: number) => { getAudioEngine().setTB303FilterResonance(synthIndex, resonance); set({ tb303Synths: get().tb303Synths.map((s, i) => i === synthIndex ? { ...s, filterResonance: resonance } : s) }); },
  triggerKick: (drumIndex: number, velocity: number) => getAudioEngine().triggerKick(drumIndex, velocity),
  triggerSnare: (drumIndex: number, velocity: number) => getAudioEngine().triggerSnare(drumIndex, velocity),
  triggerHiHat: (drumIndex: number, velocity: number) => getAudioEngine().triggerHiHat(drumIndex, velocity),
  setDistortionDrive: (effectIndex: number, drive: number) => { getAudioEngine().setDistortionDrive(drive); set({ distortion: get().distortion.map((e, i) => i === effectIndex ? { ...e, drive } : e) }); },
  setPCFWet: (effectIndex: number, wet: number) => { getAudioEngine().setPCFWet(wet); set({ pcf: get().pcf.map((e, i) => i === effectIndex ? { ...e, wet } : e) }); },
  setPCFDelayTime: (effectIndex: number, time: number) => { getAudioEngine().setPCFDelayTime(time); set({ pcf: get().pcf.map((e, i) => i === effectIndex ? { ...e, delayTime: time } : e) }); },
  setPCFFeedback: (effectIndex: number, feedback: number) => { getAudioEngine().setPCFFeedback(feedback); set({ pcf: get().pcf.map((e, i) => i === effectIndex ? { ...e, feedback } : e) }); },
  setCompressorThreshold: (effectIndex: number, threshold: number) => { getAudioEngine().setCompressorThreshold(threshold); set({ compressor: get().compressor.map((e, i) => i === effectIndex ? { ...e, threshold } : e) }); },
  setDelayWet: (effectIndex: number, wet: number) => { getAudioEngine().setDelayWet(wet); set({ delay: get().delay.map((e, i) => i === effectIndex ? { ...e, wet } : e) }); },
  setDelayTime: (effectIndex: number, time: number) => { getAudioEngine().setDelayTime(time); set({ delay: get().delay.map((e, i) => i === effectIndex ? { ...e, delayTime: time } : e) }); },
  setDelayFeedback: (effectIndex: number, feedback: number) => { getAudioEngine().setDelayFeedback(feedback); set({ delay: get().delay.map((e, i) => i === effectIndex ? { ...e, feedback } : e) }); },
  setMasterVolume: (volume: number) => { getAudioEngine().setMasterVolume(volume); set({ global: { ...get().global, masterVolume: volume } }); },
  destroy: () => {}
}));
