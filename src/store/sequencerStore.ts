import { create } from 'zustand';
import { SequencerStoreState, TB303Pattern, DrumPattern, TB303Settings, DrumSettings, GlobalSettings, TR808Instrument, TR909Instrument } from '../types/audio';

const createDefaultTB303Pattern = (): TB303Pattern => ({
  id: `tb303-${Date.now()}`,
  name: 'Pattern 1',
  type: 'TB303',
  steps: Array(16).fill(null).map(() => ({ active: false })),
  length: 16
});

const createDefaultDrumPattern = (instrument: TR808Instrument | TR909Instrument): DrumPattern => ({
  id: `${instrument}-${Date.now()}`,
  name: 'Pattern 1',
  type: 'drum',
  instrument,
  steps: Array(16).fill(null).map(() => ({ active: false })),
  length: 16
});

const defaultTB303Settings: TB303Settings = { filterCutoff: 1000, filterResonance: 0.5, filterEnvelope: 0.5, accent: 0.5, slide: 0.5, volume: 0.8, pan: 0 };
const defaultDrumSettings: DrumSettings = { decay: 0.5, tone: 0.5, volume: 0.8, pan: 0 };
const defaultGlobalSettings: GlobalSettings = { bpm: 120, swing: 0, masterVolume: 0.7 };

const tr808Instruments: TR808Instrument[] = ['BD', 'SD', 'LT', 'MT', 'HT', 'RS', 'CP', 'CB', 'CY', 'OH', 'CH'];
const tr909Instruments: TR909Instrument[] = ['BD', 'SD', 'LT', 'MT', 'HT', 'RS', 'CP', 'CH', 'OH', 'CC', 'RC'];

const initialState: SequencerStoreState = {
  tb303Patterns: [
    Array(4).fill(null).map(() => createDefaultTB303Pattern()),
    Array(4).fill(null).map(() => createDefaultTB303Pattern())
  ],
  tr808Patterns: tr808Instruments.map(instrument =>
    Array(4).fill(null).map(() => createDefaultDrumPattern(instrument))
  ),
  tr909Patterns: tr909Instruments.map(instrument =>
    Array(4).fill(null).map(() => createDefaultDrumPattern(instrument))
  ),
  tb303Settings: [{ ...defaultTB303Settings }, { ...defaultTB303Settings }],
  tr808Settings: Array(11).fill(null).map(() => ({ ...defaultDrumSettings })),
  tr909Settings: Array(11).fill(null).map(() => ({ ...defaultDrumSettings })),
  globalSettings: { ...defaultGlobalSettings },
  currentPattern: 0
};

interface SequencerStoreActions {
  setTB303Pattern: (synthIndex: number, patternIndex: number, pattern: TB303Pattern) => void;
  setTR808Pattern: (instrumentIndex: number, patternIndex: number, pattern: DrumPattern) => void;
  setTR909Pattern: (instrumentIndex: number, patternIndex: number, pattern: DrumPattern) => void;
  setTB303Setting: (synthIndex: number, setting: keyof TB303Settings, value: number) => void;
  setTR808Setting: (drumIndex: number, setting: keyof DrumSettings, value: number) => void;
  setTR909Setting: (drumIndex: number, setting: keyof DrumSettings, value: number) => void;
  setGlobalSetting: (setting: keyof GlobalSettings, value: number) => void;
  setCurrentPattern: (patternIndex: number) => void;
  copyPattern: (patternType: 'TB303' | 'TR808' | 'TR909', index: number, patternIndex: number) => void;
  pastePattern: (patternType: 'TB303' | 'TR808' | 'TR909', index: number, patternIndex: number) => void;
}

type SequencerStore = SequencerStoreState & SequencerStoreActions;

let clipboardPattern: TB303Pattern | DrumPattern | null = null;

export const useSequencerStore = create<SequencerStore>((set, get) => ({
  ...initialState,
  setTB303Pattern: (synthIndex: number, patternIndex: number, pattern: TB303Pattern) => {
    set({
      tb303Patterns: get().tb303Patterns.map((synthPatterns, i) =>
        i === synthIndex ? synthPatterns.map((p, j) => j === patternIndex ? pattern : p) : synthPatterns
      )
    });
  },
  setTR808Pattern: (instrumentIndex: number, patternIndex: number, pattern: DrumPattern) => {
    set({
      tr808Patterns: get().tr808Patterns.map((instrPatterns, i) =>
        i === instrumentIndex ? instrPatterns.map((p, j) => j === patternIndex ? pattern : p) : instrPatterns
      )
    });
  },
  setTR909Pattern: (instrumentIndex: number, patternIndex: number, pattern: DrumPattern) => {
    set({
      tr909Patterns: get().tr909Patterns.map((instrPatterns, i) =>
        i === instrumentIndex ? instrPatterns.map((p, j) => j === patternIndex ? pattern : p) : instrPatterns
      )
    });
  },
  setTB303Setting: (synthIndex: number, setting: keyof TB303Settings, value: number) => {
    set({
      tb303Settings: get().tb303Settings.map((settings, i) =>
        i === synthIndex ? { ...settings, [setting]: value } : settings
      )
    });
  },
  setTR808Setting: (drumIndex: number, setting: keyof DrumSettings, value: number) => {
    set({
      tr808Settings: get().tr808Settings.map((settings, i) =>
        i === drumIndex ? { ...settings, [setting]: value } : settings
      )
    });
  },
  setTR909Setting: (drumIndex: number, setting: keyof DrumSettings, value: number) => {
    set({
      tr909Settings: get().tr909Settings.map((settings, i) =>
        i === drumIndex ? { ...settings, [setting]: value } : settings
      )
    });
  },
  setGlobalSetting: (setting: keyof GlobalSettings, value: number) => {
    set({
      globalSettings: { ...get().globalSettings, [setting]: value }
    });
  },
  setCurrentPattern: (patternIndex: number) => {
    set({ currentPattern: patternIndex });
  },
  copyPattern: (patternType: 'TB303' | 'TR808' | 'TR909', index: number, patternIndex: number) => {
    const store = get();
    if (patternType === 'TB303') {
      const pattern = store.tb303Patterns[index]?.[patternIndex];
      if (pattern) clipboardPattern = { ...pattern };
    } else if (patternType === 'TR808') {
      const pattern = store.tr808Patterns[index]?.[patternIndex];
      if (pattern) clipboardPattern = { ...pattern };
    } else if (patternType === 'TR909') {
      const pattern = store.tr909Patterns[index]?.[patternIndex];
      if (pattern) clipboardPattern = { ...pattern };
    }
  },
  pastePattern: (patternType: 'TB303' | 'TR808' | 'TR909', index: number, patternIndex: number) => {
    if (!clipboardPattern) return;
    if (patternType === 'TB303') {
      get().setTB303Pattern(index, patternIndex, clipboardPattern as TB303Pattern);
    } else if (patternType === 'TR808') {
      get().setTR808Pattern(index, patternIndex, clipboardPattern as DrumPattern);
    } else if (patternType === 'TR909') {
      get().setTR909Pattern(index, patternIndex, clipboardPattern as DrumPattern);
    }
  }
}));