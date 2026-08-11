/**
 * Pattern Store - Enhanced for Batch 4
 * R3B-99 to R3B-102: Pattern Editing Features
 * R3B-106: TB-303 Advanced Features
 * R3B-137: Pattern Copy/Paste/Clone
 */

import { create } from 'zustand';
import type { Pattern, InstrumentType } from '../types';
import { createEmptyPattern, rotatePattern, reversePattern, invertPattern, countActiveSteps } from '../utils/patternUtils';

export type PatternMode = 'pattern' | 'song';

export type PatternState = {
  mode: PatternMode;
  patterns: Pattern[];
  currentPatternId: string | null;
  currentInstrument: InstrumentType;
  patternLength: number;
  swing: number;
  shuffle: number;
  clipboard: Pattern | null;
  
  setMode: (mode: PatternMode) => void;
  addPattern: (pattern?: Partial<Pattern>) => Pattern;
  deletePattern: (id: string) => void;
  updatePattern: (id: string, updates: Partial<Pattern>) => void;
  setCurrentPattern: (id: string | null) => void;
  setCurrentInstrument: (instrument: InstrumentType) => void;
  setPatternLength: (length: number) => void;
  setSwing: (swing: number) => void;
  setShuffle: (shuffle: number) => void;
  
  clonePattern: (id: string) => Pattern;
  copyPattern: (id: string) => void;
  pastePattern: (targetInstrument?: InstrumentType) => Pattern | null;
  clearPattern: (id: string) => void;
  rotatePattern: (id: string, positions: number) => void;
  reversePattern: (id: string) => void;
  invertPattern: (id: string) => void;
  
  toggleStep: (patternId: string, stepId: number) => void;
  toggleAccent: (patternId: string, stepId: number) => void;
  toggleSlide: (patternId: string, stepId: number) => void;
  setStepValue: (patternId: string, stepId: number, value: number) => void;
  
  clearAllPatterns: () => void;
  reset: () => void;
};

export const usePatternStore = create<PatternState>((set, get) => ({
  mode: 'pattern',
  patterns: [
    createEmptyPattern('tb303', 16),
    createEmptyPattern('tr808', 16),
    createEmptyPattern('tr909', 16),
  ],
  currentPatternId: null,
  currentInstrument: 'tb303',
  patternLength: 16,
  swing: 0,
  shuffle: 0,
  clipboard: null,

  setMode: (mode) => set({ mode }),

  addPattern: (pattern = {}) => {
    const newPattern = createEmptyPattern(
      pattern.instrument || get().currentInstrument,
      pattern.length || get().patternLength
    );
    set((state) => ({
      patterns: [...state.patterns, newPattern],
      currentPatternId: newPattern.id,
    }));
    return newPattern;
  },

  deletePattern: (id) => set((state) => ({
    patterns: state.patterns.filter(p => p.id !== id),
    currentPatternId: state.currentPatternId === id ? null : state.currentPatternId,
  })),

  updatePattern: (id, updates) => set((state) => ({
    patterns: state.patterns.map(p =>
      p.id === id ? { ...p, ...updates } : p
    ),
  })),

  setCurrentPattern: (id) => set({ currentPatternId: id }),

  setCurrentInstrument: (instrument) => set({ currentInstrument: instrument }),

  setPatternLength: (length) => set({ patternLength: Math.max(1, Math.min(32, length)) }),

  setSwing: (swing) => set({ swing: Math.max(-100, Math.min(100, swing)) }),

  setShuffle: (shuffle) => set({ shuffle: Math.max(0, Math.min(100, shuffle)) }),

  clonePattern: (id) => {
    const state = get();
    const pattern = state.patterns.find(p => p.id === id);
    if (!pattern) return state.patterns[0];
    const newPattern = { ...pattern, id: Date.now().toString(), name: pattern.name + ' (Copy)' };
    set((state) => ({
      patterns: [...state.patterns, newPattern],
      currentPatternId: newPattern.id,
    }));
    return newPattern;
  },

  copyPattern: (id) => set((state) => {
    const pattern = state.patterns.find(p => p.id === id);
    return { clipboard: pattern ? { ...pattern, id: '', name: pattern.name + ' (Copied)' } : null };
  }),

  pastePattern: (targetInstrument?: InstrumentType) => {
    const state = get();
    if (!state.clipboard) return null;
    
    const instrument = targetInstrument || state.currentInstrument;
    const newPattern = {
      ...state.clipboard,
      id: Date.now().toString(),
      instrument,
      length: state.patternLength,
    };
    
    set((state) => ({
      patterns: [...state.patterns, newPattern],
      currentPatternId: newPattern.id,
    }));
    
    return newPattern;
  },

  clearPattern: (id) => set((state) => ({
    patterns: state.patterns.map(p =>
      p.id === id ? createEmptyPattern(p.instrument, p.length) : p
    ),
  })),

  rotatePattern: (id, positions) => set((state) => ({
    patterns: state.patterns.map(p =>
      p.id === id ? rotatePattern(p, positions) : p
    ),
  })),

  reversePattern: (id) => set((state) => ({
    patterns: state.patterns.map(p =>
      p.id === id ? reversePattern(p) : p
    ),
  })),

  invertPattern: (id) => set((state) => ({
    patterns: state.patterns.map(p =>
      p.id === id ? invertPattern(p) : p
    ),
  })),

  toggleStep: (patternId, stepId) => set((state) => ({
    patterns: state.patterns.map(p =>
      p.id === patternId
        ? { ...p, steps: p.steps.map(s => s.id === stepId ? { ...s, active: !s.active } : s) }
        : p
    ),
  })),

  toggleAccent: (patternId, stepId) => set((state) => ({
    patterns: state.patterns.map(p =>
      p.id === patternId
        ? { ...p, steps: p.steps.map(s => s.id === stepId ? { ...s, accent: !s.accent } : s) }
        : p
    ),
  })),

  toggleSlide: (patternId, stepId) => set((state) => ({
    patterns: state.patterns.map(p =>
      p.id === patternId
        ? { ...p, steps: p.steps.map(s => s.id === stepId ? { ...s, slide: !s.slide } : s) }
        : p
    ),
  })),

  setStepValue: (patternId, stepId, value) => set((state) => ({
    patterns: state.patterns.map(p =>
      p.id === patternId
        ? { ...p, steps: p.steps.map(s => s.id === stepId ? { ...s, value: Math.max(0, Math.min(1, value)) } : s) }
        : p
    ),
  })),

  clearAllPatterns: () => set((state) => ({
    patterns: state.patterns.map(p => createEmptyPattern(p.instrument, p.length)),
  })),

  reset: () => set({
    mode: 'pattern',
    patterns: [
      createEmptyPattern('tb303', 16),
      createEmptyPattern('tr808', 16),
      createEmptyPattern('tr909', 16),
    ],
    currentPatternId: null,
    currentInstrument: 'tb303',
    patternLength: 16,
    swing: 0,
    shuffle: 0,
    clipboard: null,
  }),
}));

export const getPatternState = (state: PatternState) => state;

export const getCurrentPattern = (state: PatternState): Pattern | null =>
  state.patterns.find(p => p.id === state.currentPatternId) || null;

export const getPatternsByInstrument = (state: PatternState, instrument: InstrumentType): Pattern[] =>
  state.patterns.filter(p => p.instrument === instrument);

export const getAllPatterns = (state: PatternState): Pattern[] => state.patterns;

export const getPatternCount = (state: PatternState): number => state.patterns.length;

export const isPatternMode = (state: PatternState): boolean => state.mode === 'pattern';

export const isSongMode = (state: PatternState): boolean => state.mode === 'song';

export const getCurrentInstrument = (state: PatternState): InstrumentType => state.currentInstrument;

export const getPatternLength = (state: PatternState): number => state.patternLength;

export const getSwing = (state: PatternState): number => state.swing;

export const getShuffle = (state: PatternState): number => state.shuffle;

export const getPatternById = (state: PatternState, id: string): Pattern | null =>
  state.patterns.find(p => p.id === id) || null;

export const getPatternByIndex = (state: PatternState, index: number): Pattern | null =>
  state.patterns[index] || null;

export const getActivePatterns = (state: PatternState): Pattern[] =>
  state.patterns.filter(p => p.steps.some(s => s.active));

export const getEmptyPatterns = (state: PatternState): Pattern[] =>
  state.patterns.filter(p => !p.steps.some(s => s.active));

export const getClipboardPattern = (state: PatternState): Pattern | null => state.clipboard;

export const hasClipboardContent = (state: PatternState): boolean => state.clipboard !== null;

export const getPatternStats = (pattern: Pattern) => ({
  activeSteps: countActiveSteps(pattern),
  accentSteps: pattern.steps.filter(s => s.accent).length,
  slideSteps: pattern.steps.filter(s => s.slide).length,
  density: countActiveSteps(pattern) / pattern.length,
});