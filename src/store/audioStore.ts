import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { SectionType } from '../types/audio';

interface TR808Params {
  BD: { level: number; tune: number; decay: number };
  SD: { level: number; tune: number; decay: number; tone: number; snap: number };
  LT: { level: number; tune: number; decay: number };
  MT: { level: number; tune: number; decay: number };
  HT: { level: number; tune: number; decay: number };
  RS: { level: number };
  CP: { level: number };
  CH: { level: number; decay: number };
  OH: { level: number; decay: number };
  CC: { level: number; tune: number };
  RC: { level: number; tune: number };
}

interface TR909Params extends TR808Params {
  flam: number;
  BD: { level: number; tune: number; decay: number; attack: number };
  SD: { level: number; tune: number; decay: number; tone: number; snap: number; attack: number };
  LT: { level: number; tune: number; decay: number; attack: number };
  MT: { level: number; tune: number; decay: number; attack: number };
  HT: { level: number; tune: number; decay: number; attack: number };
}

interface TB303Params {
  waveform: 'sawtooth' | 'square';
  tune: number;
  cutoff: number;
  resonance: number;
  envMod: number;
  decay: number;
  accent: number;
  vintage: boolean;
}

interface SectionParams {
  level: number;
  pan: number;
  mute: boolean;
  solo: boolean;
  delaySend: number;
  distortion: boolean;
  compressor: boolean;
  pcf: boolean;
}

interface PCFSettings { enabled: boolean; pattern: number; }
interface DelaySettings { enabled: boolean; step: number; triplet: boolean; feedback: number; }
interface DistortionSettings { enabled: boolean; amount: number; }
interface CompressorSettings { enabled: boolean; threshold: number; ratio: number; }
interface MasterSettings { volume: number; compressor: CompressorSettings; }

interface AudioState {
  audioContext: AudioContext | null;
  isAudioReady: boolean;
  tr808Params: TR808Params;
  tr909Params: TR909Params;
  tb303_1Params: TB303Params;
  tb303_2Params: TB303Params;
  sectionParams: Record<SectionType, SectionParams>;
  pcfSettings: PCFSettings;
  delaySettings: DelaySettings;
  distortionSettings: DistortionSettings;
  compressorSettings: Record<SectionType | 'master', CompressorSettings>;
  masterSettings: MasterSettings;
  activeVoices: Map<string, unknown>;
  voiceCount: number;
  maxVoices: number;
}

const defaultTR808Params: TR808Params = {
  BD: { level: 100, tune: 50, decay: 50 },
  SD: { level: 100, tune: 50, decay: 50, tone: 50, snap: 50 },
  LT: { level: 80, tune: 50, decay: 50 },
  MT: { level: 80, tune: 50, decay: 50 },
  HT: { level: 80, tune: 50, decay: 50 },
  RS: { level: 80 },
  CP: { level: 80 },
  CH: { level: 80, decay: 50 },
  OH: { level: 80, decay: 50 },
  CC: { level: 80, tune: 50 },
  RC: { level: 80, tune: 50 },
};

const defaultTR909Params: TR909Params = {
  ...defaultTR808Params,
  flam: 0,
  BD: { level: 100, tune: 50, decay: 50, attack: 50 },
  SD: { level: 100, tune: 50, decay: 50, tone: 50, snap: 50, attack: 50 },
  LT: { level: 80, tune: 50, decay: 50, attack: 50 },
  MT: { level: 80, tune: 50, decay: 50, attack: 50 },
  HT: { level: 80, tune: 50, decay: 50, attack: 50 },
};

const defaultTB303Params: TB303Params = {
  waveform: 'sawtooth',
  tune: 0,
  cutoff: 64,
  resonance: 0,
  envMod: 64,
  decay: 32,
  accent: 64,
  vintage: false,
};

const defaultSectionParams: SectionParams = {
  level: 100,
  pan: 0,
  mute: false,
  solo: false,
  delaySend: 0,
  distortion: false,
  compressor: false,
  pcf: false,
};

const defaultPCFSettings: PCFSettings = { enabled: false, pattern: 0 };
const defaultDelaySettings: DelaySettings = { enabled: false, step: 4, triplet: false, feedback: 50 };
const defaultDistortionSettings: DistortionSettings = { enabled: false, amount: 50 };
const defaultCompressorSettings: CompressorSettings = { enabled: false, threshold: -24, ratio: 4 };
const defaultMasterSettings: MasterSettings = { volume: 100, compressor: defaultCompressorSettings };

interface AudioActions {
  initAudioContext: () => void;
  setAudioContext: (context: AudioContext | null) => void;
  setAudioReady: (ready: boolean) => void;
  setTR808Param: (instrument: keyof TR808Params, param: keyof TR808Params[keyof TR808Params], value: number) => void;
  setTR909Param: (instrument: keyof TR909Params, param: keyof TR909Params[keyof TR909Params], value: number) => void;
  setTB303_1Param: (param: keyof TB303Params, value: TB303Params[keyof TB303Params]) => void;
  setTB303_2Param: (param: keyof TB303Params, value: TB303Params[keyof TB303Params]) => void;
  setSectionParam: (section: SectionType, param: keyof SectionParams, value: SectionParams[keyof SectionParams]) => void;
  setPCFSetting: (setting: keyof PCFSettings, value: PCFSettings[keyof PCFSettings]) => void;
  setDelaySetting: (setting: keyof DelaySettings, value: DelaySettings[keyof DelaySettings]) => void;
  setDistortionSetting: (setting: keyof DistortionSettings, value: DistortionSettings[keyof DistortionSettings]) => void;
  setCompressorSetting: (target: SectionType | 'master', setting: keyof CompressorSettings, value: CompressorSettings[keyof CompressorSettings]) => void;
  setMasterSetting: (setting: keyof MasterSettings, value: MasterSettings[keyof MasterSettings]) => void;
  addVoice: (voiceId: string, voiceData: unknown) => void;
  removeVoice: (voiceId: string) => void;
  setMaxVoices: (max: number) => void;
  resetSectionParams: (section: SectionType) => void;
  resetAllParams: () => void;
}

type AudioStore = AudioState & AudioActions;

const initialState: AudioState = {
  audioContext: null,
  isAudioReady: false,
  tr808Params: defaultTR808Params,
  tr909Params: defaultTR909Params,
  tb303_1Params: defaultTB303Params,
  tb303_2Params: defaultTB303Params,
  sectionParams: {
    '808': defaultSectionParams,
    '909': defaultSectionParams,
    '303_1': defaultSectionParams,
    '303_2': defaultSectionParams,
  },
  pcfSettings: defaultPCFSettings,
  delaySettings: defaultDelaySettings,
  distortionSettings: defaultDistortionSettings,
  compressorSettings: {
    '808': defaultCompressorSettings,
    '909': defaultCompressorSettings,
    '303_1': defaultCompressorSettings,
    '303_2': defaultCompressorSettings,
    'master': defaultCompressorSettings,
  },
  masterSettings: defaultMasterSettings,
  activeVoices: new Map(),
  voiceCount: 0,
  maxVoices: 32,
};

export const useAudioStore = create<AudioStore>()(
  devtools(
    persist(
      (set, get) => ({
        ...initialState,
        initAudioContext: () => {
          const context = new (window.AudioContext || (window as any).webkitAudioContext)({
            sampleRate: 44100,
            latencyHint: 'interactive',
          });
          set({ audioContext: context, isAudioReady: true });
        },
        setAudioContext: (context) => set({ audioContext: context }),
        setAudioReady: (ready) => set({ isAudioReady: ready }),
        setTR808Param: (instrument, param, value) => set((state) => ({
          tr808Params: {
            ...state.tr808Params,
            [instrument]: { ...state.tr808Params[instrument], [param]: Math.max(0, Math.min(100, value)) },
          },
        })),
        setTR909Param: (instrument, param, value) => set((state) => ({
          tr909Params: {
            ...state.tr909Params,
            [instrument]: { ...state.tr909Params[instrument], [param]: Math.max(0, Math.min(100, value)) },
          },
        })),
        setTB303_1Param: (param, value) => set((state) => ({
          tb303_1Params: { ...state.tb303_1Params, [param]: value },
        })),
        setTB303_2Param: (param, value) => set((state) => ({
          tb303_2Params: { ...state.tb303_2Params, [param]: value },
        })),
        setSectionParam: (section, param, value) => set((state) => ({
          sectionParams: {
            ...state.sectionParams,
            [section]: { ...state.sectionParams[section], [param]: value },
          },
        })),
        setPCFSetting: (setting, value) => set((state) => ({
          pcfSettings: { ...state.pcfSettings, [setting]: value },
        })),
        setDelaySetting: (setting, value) => set((state) => ({
          delaySettings: { ...state.delaySettings, [setting]: value },
        })),
        setDistortionSetting: (setting, value) => set((state) => ({
          distortionSettings: { ...state.distortionSettings, [setting]: value },
        })),
        setCompressorSetting: (target, setting, value) => set((state) => ({
          compressorSettings: {
            ...state.compressorSettings,
            [target]: { ...state.compressorSettings[target], [setting]: value },
          },
        })),
        setMasterSetting: (setting, value) => set((state) => ({
          masterSettings: { ...state.masterSettings, [setting]: value },
        })),
        addVoice: (voiceId, voiceData) => {
          const activeVoices = new Map(get().activeVoices);
          activeVoices.set(voiceId, voiceData);
          set({ activeVoices, voiceCount: activeVoices.size });
        },
        removeVoice: (voiceId) => {
          const activeVoices = new Map(get().activeVoices);
          activeVoices.delete(voiceId);
          set({ activeVoices, voiceCount: activeVoices.size });
        },
        setMaxVoices: (max) => set({ maxVoices: max }),
        resetSectionParams: (section) => set((state) => ({
          sectionParams: { ...state.sectionParams, [section]: defaultSectionParams },
        })),
        resetAllParams: () => set({
          tr808Params: defaultTR808Params,
          tr909Params: defaultTR909Params,
          tb303_1Params: defaultTB303Params,
          tb303_2Params: defaultTB303Params,
          sectionParams: {
            '808': defaultSectionParams,
            '909': defaultSectionParams,
            '303_1': defaultSectionParams,
            '303_2': defaultSectionParams,
          },
          pcfSettings: defaultPCFSettings,
          delaySettings: defaultDelaySettings,
          distortionSettings: defaultDistortionSettings,
          compressorSettings: {
            '808': defaultCompressorSettings,
            '909': defaultCompressorSettings,
            '303_1': defaultCompressorSettings,
            '303_2': defaultCompressorSettings,
            'master': defaultCompressorSettings,
          },
          masterSettings: defaultMasterSettings,
        }),
      }),
      {
        name: 'audio-store',
        partialize: (state) => ({
          tr808Params: state.tr808Params,
          tr909Params: state.tr909Params,
          tb303_1Params: state.tb303_1Params,
          tb303_2Params: state.tb303_2Params,
          sectionParams: state.sectionParams,
          pcfSettings: state.pcfSettings,
          delaySettings: state.delaySettings,
          distortionSettings: state.distortionSettings,
          compressorSettings: state.compressorSettings,
          masterSettings: state.masterSettings,
          maxVoices: state.maxVoices,
        }),
      }
    ),
    { name: 'AudioStore' }
  )
);

export default useAudioStore;