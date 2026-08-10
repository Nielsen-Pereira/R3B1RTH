import { create } from 'zustand';
import { SequencerStoreState, TB303Pattern, DrumPattern, TB303Settings, DrumSettings, GlobalSettings } from '../types/audio';

const createDefaultTB303Pattern = (): TB303Pattern => ({ id: `tb303-${Date.now()}`, name: 'Pattern 1', type: 'TB303', steps: Array(16).fill(null).map(() => ({ active: false })), length: 16 });
const createDefaultDrumPattern = (instrument: string): DrumPattern => ({ id: `${instrument}-${Date.now()}`, name: 'Pattern 1', type: 'drum', instrument: instrument as any, steps: Array(16).fill(null).map(() => ({ active: false })), length: 16 });

const defaultTB303Settings: TB303Settings = { filterCutoff: 1000, filterResonance: 0.5, filterEnvelope: 0.5, accent: 0.5, slide: 0.5, volume: 0.8, pan: 0 };
const defaultDrumSettings: DrumSettings = { decay: 0.5, tone: 0.5, volume: 0.8, pan: 0 };
const defaultGlobalSettings: GlobalSettings = { bpm: 120, swing: 0, masterVolume: 0.7 };

const initialState: SequencerStoreState = {
  tb303Patterns: [Array(4).fill(null).map(() => createDefaultTB303Pattern()), Array(4).fill(null).map(() => createDefaultTB303Pattern())],
  tr808Patterns: Array(11).fill(null).map(() => Array(4).fill(null).map(() => createDefaultDrumPattern('BD'))),
  tr909Patterns: Array(11).fill(null).map(() => Array(4).fill(null).map(() => createDefaultDrumPattern('BD'))),
  tb303Settings: [{ ...defaultTB303Settings }, { ...defaultTB303Settings }],
  tr808Settings: Array(11).fill(null).map(() => ({ ...defaultDrumSettings })),
  tr909Settings: Array(11).fill(null).map(() => ({ ...defaultDrumSettings })),
  globalSettings: { ...defaultGlobalSettings },
  currentPattern: 0
};

export const getTB303Pattern = (synthIndex: number, patternIndex: number): TB303Pattern | null => {
  const store = useSequencerStore.getState();
  if (synthIndex >= 0 && synthIndex < store.tb303Patterns.length && patternIndex >= 0 && patternIndex < store.tb303Patterns[synthIndex].length) {
    return store.tb303Patterns[synthIndex][patternIndex];
  }
  return null;
};

export const getTR808Pattern = (drumMachineIndex: number, patternIndex: number, instrumentIndex: number): DrumPattern | null => {
  const store = useSequencerStore.getState();
  if (drumMachineIndex >= 0 && drumMachineIndex < store.tr808Patterns.length && patternIndex >= 0 && patternIndex < store.tr808Patterns[drumMachineIndex].length && instrumentIndex >= 0 && instrumentIndex < store.tr808Patterns[drumMachineIndex][patternIndex].length) {
    return store.tr808Patterns[drumMachineIndex][patternIndex][instrumentIndex];
  }
  return null;
};

export const getTR909Pattern = (drumMachineIndex: number, patternIndex: number, instrumentIndex: number): DrumPattern | null => {
  const store = useSequencerStore.getState();
  if (drumMachineIndex >= 0 && drumMachineIndex < store.tr909Patterns.length && patternIndex >= 0 && patternIndex < store.tr909Patterns[drumMachineIndex].length && instrumentIndex >= 0 && instrumentIndex < store.tr909Patterns[drumMachineIndex][patternIndex].length) {
    return store.tr909Patterns[drumMachineIndex][patternIndex][instrumentIndex];
  }
  return null;
};

interface SequencerStoreActions {
  setTB303Pattern: (synthIndex: number, patternIndex: number, pattern: TB303Pattern) => void;
  setTR808Pattern: (drumMachineIndex: number, patternIndex: number, instrumentIndex: number, pattern: DrumPattern) => void;
  setTR909Pattern: (drumMachineIndex: number, patternIndex: number, instrumentIndex: number, pattern: DrumPattern) => void;
  setTB303Setting: (synthIndex: number, setting: keyof TB303Settings, value: number) => void;
  setTR808Setting: (drumIndex: number, setting: keyof DrumSettings, value: number) => void;
  setTR909Setting: (drumIndex: number, setting: keyof DrumSettings, value: number) => void;
  setGlobalSetting: (setting: keyof GlobalSettings, value: number) => void;
  setCurrentPattern: (patternIndex: number) => void;
}

type SequencerStore = SequencerStoreState & SequencerStoreActions;

export const useSequencerStore = create<SequencerStore>((set, get) => ({
  ...initialState,
  setTB303Pattern: (synthIndex: number, patternIndex: number, pattern: TB303Pattern) => {
    set({ tb303Patterns: get().tb303Patterns.map((synthPatterns, i) => i === synthIndex ? synthPatterns.map((p, j) => j === patternIndex ? pattern : p) : synthPatterns) });
  },
  setTR808Pattern: (drumMachineIndex: number, patternIndex: number, instrumentIndex: number, pattern: DrumPattern) => {
    set({ tr808Patterns: get().tr808Patterns.map((drumPatterns, i) => i === drumMachineIndex ? drumPatterns.map((instrPatterns, j) => j === patternIndex ? instrPatterns.map((p, k) => k === instrumentIndex ? pattern : p) : instrPatterns) : drumPatterns) });
  },
  setTR909Pattern: (drumMachineIndex: number, patternIndex: number, instrumentIndex: number, pattern: DrumPattern) => {
    set({ tr909Patterns: get().tr909Patterns.map((drumPatterns, i) => i === drumMachineIndex ? drumPatterns.map((instrPatterns, j) => j === patternIndex ? instrPatterns.map((p, k) => k === instrumentIndex ? pattern : p) : instrPatterns) : drumPatterns) });
  },
  setTB303Setting: (synthIndex: number, setting: keyof TB303Settings, value: number) => {
    set({ tb303Settings: get().tb303Settings.map((settings, i) => i === synthIndex ? { ...settings, [setting]: value } : settings) });
  },
  setTR808Setting: (drumIndex: number, setting: keyof DrumSettings, value: number) => {
    set({ tr808Settings: get().tr808Settings.map((settings, i) => i === drumIndex ? { ...settings, [setting]: value } : settings) });
  },
  setTR909Setting: (drumIndex: number, setting: keyof DrumSettings, value: number) => {
    set({ tr909Settings: get().tr909Settings.map((settings, i) => i === drumIndex ? { ...settings, [setting]: value } : settings) });
  },
  setGlobalSetting: (setting: keyof GlobalSettings, value: number) => {
    set({ globalSettings: { ...get().globalSettings, [setting]: value } });
  },
  setCurrentPattern: (patternIndex: number) => {
    set({ currentPattern: patternIndex });
  }
}));
