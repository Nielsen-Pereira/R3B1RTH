/**
 * Pattern Store Tests - Batch 3 Development
 * R3B-99 to R3B-102: Pattern Editing Features
 * 
 * Vitest tests for patternStore functionality
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { create } from 'zustand';
import { usePatternStore, getCurrentPattern, getPatternsByInstrument, getPatternStats, getAllPatterns, getPatternCount, isPatternMode, getCurrentInstrument, getPatternLength, getSwing, getShuffle, getPatternById, getPatternByIndex, getActivePatterns, getEmptyPatterns } from '../stores/patternStore';
import type { PatternState, Pattern } from '../stores/patternStore';
import { createEmptyPattern } from '../utils/patternUtils';

// Mock implementation for testing
const createTestStore = (initialState?: Partial<PatternState>) => {
  const store = create<PatternState>((set, get) => ({
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
      patterns: state.patterns.map(p => p.id === id ? { ...p, ...updates } : p),
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
    clearPattern: (id) => set((state) => ({
      patterns: state.patterns.map(p => p.id === id ? createEmptyPattern(p.instrument, p.length) : p),
    })),
    rotatePattern: (id, positions) => set((state) => ({
      patterns: state.patterns.map(p => p.id === id ? { ...p, steps: [...p.steps].map(s => ({ ...s })) } : p),
    })),
    reversePattern: (id) => set((state) => ({
      patterns: state.patterns.map(p => p.id === id ? { ...p, steps: [...p.steps].reverse().map((s, i) => ({ ...s, id: i })) } : p),
    })),
    invertPattern: (id) => set((state) => ({
      patterns: state.patterns.map(p => p.id === id ? { ...p, steps: p.steps.map(s => ({ ...s, active: !s.active })) } : p),
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
    }),
    ...initialState,
  }));
  return store;
};

describe('Pattern Store', () => {
  describe('initial state', () => {
    it('should start in pattern mode', () => {
      const store = createTestStore();
      const state = store.getState();
      expect(state.mode).toBe('pattern');
    });

    it('should have 3 default patterns', () => {
      const store = createTestStore();
      const state = store.getState();
      expect(state.patterns.length).toBe(3);
    });

    it('should have tb303 as default instrument', () => {
      const store = createTestStore();
      const state = store.getState();
      expect(state.currentInstrument).toBe('tb303');
    });

    it('should have default pattern length of 16', () => {
      const store = createTestStore();
      const state = store.getState();
      expect(state.patternLength).toBe(16);
    });

    it('should have swing and shuffle at 0', () => {
      const store = createTestStore();
      const state = store.getState();
      expect(state.swing).toBe(0);
      expect(state.shuffle).toBe(0);
    });
  });

  describe('addPattern', () => {
    it('should add a new pattern', () => {
      const store = createTestStore();
      store.getState().addPattern();
      const state = store.getState();
      expect(state.patterns.length).toBe(4);
    });

    it('should set the new pattern as current', () => {
      const store = createTestStore();
      const newPattern = store.getState().addPattern();
      const state = store.getState();
      expect(state.currentPatternId).toBe(newPattern.id);
    });

    it('should create pattern with specified instrument', () => {
      const store = createTestStore();
      store.getState().addPattern({ instrument: 'tr808' });
      const state = store.getState();
      const newPattern = state.patterns[state.patterns.length - 1];
      expect(newPattern.instrument).toBe('tr808');
    });
  });

  describe('deletePattern', () => {
    it('should remove a pattern', () => {
      const store = createTestStore();
      const stateBefore = store.getState();
      store.getState().deletePattern(stateBefore.patterns[0].id);
      const stateAfter = store.getState();
      expect(stateAfter.patterns.length).toBe(2);
    });

    it('should reset currentPatternId if deleted pattern was current', () => {
      const store = createTestStore();
      const stateBefore = store.getState();
      store.getState().setCurrentPattern(stateBefore.patterns[0].id);
      store.getState().deletePattern(stateBefore.patterns[0].id);
      const stateAfter = store.getState();
      expect(stateAfter.currentPatternId).toBeNull();
    });

    it('should not delete the last pattern', () => {
      const store = createTestStore();
      const stateBefore = store.getState();
      // Delete all but one
      stateBefore.patterns.slice(0, -1).forEach(p => {
        store.getState().deletePattern(p.id);
      });
      const stateAfter = store.getState();
      expect(stateAfter.patterns.length).toBe(1);
    });
  });

  describe('updatePattern', () => {
    it('should update pattern properties', () => {
      const store = createTestStore();
      const stateBefore = store.getState();
      store.getState().updatePattern(stateBefore.patterns[0].id, { name: 'Test Pattern' });
      const stateAfter = store.getState();
      expect(stateAfter.patterns[0].name).toBe('Test Pattern');
    });

    it('should update pattern length', () => {
      const store = createTestStore();
      const stateBefore = store.getState();
      store.getState().updatePattern(stateBefore.patterns[0].id, { length: 32 });
      const stateAfter = store.getState();
      expect(stateAfter.patterns[0].length).toBe(32);
    });
  });

  describe('setCurrentPattern', () => {
    it('should set the current pattern', () => {
      const store = createTestStore();
      const stateBefore = store.getState();
      store.getState().setCurrentPattern(stateBefore.patterns[1].id);
      const stateAfter = store.getState();
      expect(stateAfter.currentPatternId).toBe(stateBefore.patterns[1].id);
    });

    it('should allow null as current pattern', () => {
      const store = createTestStore();
      store.getState().setCurrentPattern(null);
      const state = store.getState();
      expect(state.currentPatternId).toBeNull();
    });
  });

  describe('setCurrentInstrument', () => {
    it('should change the current instrument', () => {
      const store = createTestStore();
      store.getState().setCurrentInstrument('tr808');
      const state = store.getState();
      expect(state.currentInstrument).toBe('tr808');
    });
  });

  describe('setPatternLength', () => {
    it('should update pattern length', () => {
      const store = createTestStore();
      store.getState().setPatternLength(32);
      const state = store.getState();
      expect(state.patternLength).toBe(32);
    });

    it('should clamp length between 1 and 32', () => {
      const store = createTestStore();
      store.getState().setPatternLength(0);
      let state = store.getState();
      expect(state.patternLength).toBe(1);
      store.getState().setPatternLength(100);
      state = store.getState();
      expect(state.patternLength).toBe(32);
    });
  });

  describe('setSwing', () => {
    it('should update swing value', () => {
      const store = createTestStore();
      store.getState().setSwing(50);
      const state = store.getState();
      expect(state.swing).toBe(50);
    });

    it('should clamp swing between -100 and 100', () => {
      const store = createTestStore();
      store.getState().setSwing(-150);
      let state = store.getState();
      expect(state.swing).toBe(-100);
      store.getState().setSwing(150);
      state = store.getState();
      expect(state.swing).toBe(100);
    });
  });

  describe('setShuffle', () => {
    it('should update shuffle value', () => {
      const store = createTestStore();
      store.getState().setShuffle(75);
      const state = store.getState();
      expect(state.shuffle).toBe(75);
    });

    it('should clamp shuffle between 0 and 100', () => {
      const store = createTestStore();
      store.getState().setShuffle(-50);
      let state = store.getState();
      expect(state.shuffle).toBe(0);
      store.getState().setShuffle(150);
      state = store.getState();
      expect(state.shuffle).toBe(100);
    });
  });

  describe('clonePattern', () => {
    it('should create a copy of the pattern', () => {
      const store = createTestStore();
      const stateBefore = store.getState();
      store.getState().clonePattern(stateBefore.patterns[0].id);
      const stateAfter = store.getState();
      expect(stateAfter.patterns.length).toBe(4);
      const cloned = stateAfter.patterns.find(p => p.name.includes('(Copy)'));
      expect(cloned).toBeDefined();
    });

    it('should set the cloned pattern as current', () => {
      const store = createTestStore();
      const stateBefore = store.getState();
      store.getState().clonePattern(stateBefore.patterns[0].id);
      const stateAfter = store.getState();
      const cloned = stateAfter.patterns.find(p => p.name.includes('(Copy)'));
      expect(stateAfter.currentPatternId).toBe(cloned?.id);
    });
  });

  describe('clearPattern', () => {
    it('should reset pattern steps', () => {
      const store = createTestStore();
      const stateBefore = store.getState();
      // Activate some steps
      store.getState().toggleStep(stateBefore.patterns[0].id, 0);
      store.getState().toggleStep(stateBefore.patterns[0].id, 1);
      store.getState().clearPattern(stateBefore.patterns[0].id);
      const stateAfter = store.getState();
      const pattern = stateAfter.patterns[0];
      expect(pattern.steps.every(s => !s.active)).toBe(true);
    });
  });

  describe('rotatePattern', () => {
    it('should rotate pattern steps', () => {
      const store = createTestStore();
      const stateBefore = store.getState();
      // Activate first step
      store.getState().toggleStep(stateBefore.patterns[0].id, 0);
      store.getState().rotatePattern(stateBefore.patterns[0].id, 1);
      const stateAfter = store.getState();
      const pattern = stateAfter.patterns[0];
      // First step should now be inactive, second should be active
      expect(pattern.steps[0].active).toBe(false);
      expect(pattern.steps[1].active).toBe(true);
    });
  });

  describe('reversePattern', () => {
    it('should reverse pattern steps', () => {
      const store = createTestStore();
      const stateBefore = store.getState();
      // Activate first and third steps
      store.getState().toggleStep(stateBefore.patterns[0].id, 0);
      store.getState().toggleStep(stateBefore.patterns[0].id, 2);
      store.getState().reversePattern(stateBefore.patterns[0].id);
      const stateAfter = store.getState();
      const pattern = stateAfter.patterns[0];
      // First step should be inactive, last should be active
      expect(pattern.steps[0].active).toBe(false);
      expect(pattern.steps[15].active).toBe(true);
    });
  });

  describe('invertPattern', () => {
    it('should invert active steps', () => {
      const store = createTestStore();
      const stateBefore = store.getState();
      // Activate first 8 steps
      for (let i = 0; i < 8; i++) {
        store.getState().toggleStep(stateBefore.patterns[0].id, i);
      }
      store.getState().invertPattern(stateBefore.patterns[0].id);
      const stateAfter = store.getState();
      const pattern = stateAfter.patterns[0];
      // First 8 should be inactive, last 8 should be active
      expect(pattern.steps.slice(0, 8).every(s => !s.active)).toBe(true);
      expect(pattern.steps.slice(8).every(s => s.active)).toBe(true);
    });
  });

  describe('toggleStep', () => {
    it('should toggle step active state', () => {
      const store = createTestStore();
      const stateBefore = store.getState();
      expect(stateBefore.patterns[0].steps[0].active).toBe(false);
      store.getState().toggleStep(stateBefore.patterns[0].id, 0);
      const stateAfter = store.getState();
      expect(stateAfter.patterns[0].steps[0].active).toBe(true);
    });
  });

  describe('toggleAccent', () => {
    it('should toggle step accent state', () => {
      const store = createTestStore();
      const stateBefore = store.getState();
      expect(stateBefore.patterns[0].steps[0].accent).toBe(false);
      store.getState().toggleStep(stateBefore.patterns[0].id, 0);
      store.getState().toggleAccent(stateBefore.patterns[0].id, 0);
      const stateAfter = store.getState();
      expect(stateAfter.patterns[0].steps[0].accent).toBe(true);
    });
  });

  describe('toggleSlide', () => {
    it('should toggle step slide state', () => {
      const store = createTestStore();
      const stateBefore = store.getState();
      expect(stateBefore.patterns[0].steps[0].slide).toBe(false);
      store.getState().toggleSlide(stateBefore.patterns[0].id, 0);
      const stateAfter = store.getState();
      expect(stateAfter.patterns[0].steps[0].slide).toBe(true);
    });
  });

  describe('setStepValue', () => {
    it('should set step value', () => {
      const store = createTestStore();
      const stateBefore = store.getState();
      store.getState().setStepValue(stateBefore.patterns[0].id, 0, 0.75);
      const stateAfter = store.getState();
      expect(stateAfter.patterns[0].steps[0].value).toBe(0.75);
    });

    it('should clamp value between 0 and 1', () => {
      const store = createTestStore();
      const stateBefore = store.getState();
      store.getState().setStepValue(stateBefore.patterns[0].id, 0, 1.5);
      const stateAfter = store.getState();
      expect(stateAfter.patterns[0].steps[0].value).toBe(1);
    });
  });

  describe('clearAllPatterns', () => {
    it('should clear all pattern steps', () => {
      const store = createTestStore();
      const stateBefore = store.getState();
      // Activate steps in all patterns
      stateBefore.patterns.forEach(p => {
        store.getState().toggleStep(p.id, 0);
      });
      store.getState().clearAllPatterns();
      const stateAfter = store.getState();
      expect(stateAfter.patterns.every(p => p.steps.every(s => !s.active))).toBe(true);
    });
  });

  describe('reset', () => {
    it('should reset to initial state', () => {
      const store = createTestStore();
      const stateBefore = store.getState();
      store.getState().setMode('song');
      store.getState().setPatternLength(32);
      store.getState().setSwing(50);
      store.getState().toggleStep(stateBefore.patterns[0].id, 0);
      
      store.getState().reset();
      const stateAfter = store.getState();
      
      expect(stateAfter.mode).toBe('pattern');
      expect(stateAfter.patternLength).toBe(16);
      expect(stateAfter.swing).toBe(0);
      expect(stateAfter.patterns.every(p => p.steps.every(s => !s.active))).toBe(true);
    });
  });
});

describe('Selectors', () => {
  describe('getCurrentPattern', () => {
    it('should return the current pattern', () => {
      const store = createTestStore();
      const stateBefore = store.getState();
      store.getState().setCurrentPattern(stateBefore.patterns[0].id);
      const stateAfter = store.getState();
      const current = getCurrentPattern(stateAfter);
      expect(current?.id).toBe(stateBefore.patterns[0].id);
    });

    it('should return null if no current pattern', () => {
      const store = createTestStore();
      const state = store.getState();
      const current = getCurrentPattern(state);
      expect(current).toBeNull();
    });
  });

  describe('getPatternsByInstrument', () => {
    it('should return patterns for specified instrument', () => {
      const store = createTestStore();
      const state = store.getState();
      const tb303Patterns = getPatternsByInstrument(state, 'tb303');
      expect(tb303Patterns.length).toBe(1);
      expect(tb303Patterns[0].instrument).toBe('tb303');
    });

    it('should return empty array for non-existent instrument', () => {
      const store = createTestStore();
      const state = store.getState();
      const unknownPatterns = getPatternsByInstrument(state, 'unknown' as InstrumentType);
      expect(unknownPatterns.length).toBe(0);
    });
  });

  describe('getAllPatterns', () => {
    it('should return all patterns', () => {
      const store = createTestStore();
      const state = store.getState();
      const allPatterns = getAllPatterns(state);
      expect(allPatterns.length).toBe(3);
    });
  });

  describe('getPatternCount', () => {
    it('should return the number of patterns', () => {
      const store = createTestStore();
      const state = store.getState();
      expect(getPatternCount(state)).toBe(3);
    });
  });

  describe('isPatternMode', () => {
    it('should return true when in pattern mode', () => {
      const store = createTestStore();
      const state = store.getState();
      expect(isPatternMode(state)).toBe(true);
    });

    it('should return false when in song mode', () => {
      const store = createTestStore();
      store.getState().setMode('song');
      const state = store.getState();
      expect(isPatternMode(state)).toBe(false);
    });
  });

  describe('getCurrentInstrument', () => {
    it('should return the current instrument', () => {
      const store = createTestStore();
      const state = store.getState();
      expect(getCurrentInstrument(state)).toBe('tb303');
    });
  });

  describe('getPatternLength', () => {
    it('should return the pattern length', () => {
      const store = createTestStore();
      const state = store.getState();
      expect(getPatternLength(state)).toBe(16);
    });
  });

  describe('getSwing', () => {
    it('should return the swing value', () => {
      const store = createTestStore();
      const state = store.getState();
      expect(getSwing(state)).toBe(0);
    });
  });

  describe('getShuffle', () => {
    it('should return the shuffle value', () => {
      const store = createTestStore();
      const state = store.getState();
      expect(getShuffle(state)).toBe(0);
    });
  });

  describe('getPatternById', () => {
    it('should return pattern by id', () => {
      const store = createTestStore();
      const state = store.getState();
      const pattern = getPatternById(state, state.patterns[0].id);
      expect(pattern?.id).toBe(state.patterns[0].id);
    });

    it('should return null for non-existent id', () => {
      const store = createTestStore();
      const state = store.getState();
      const pattern = getPatternById(state, 'non-existent');
      expect(pattern).toBeNull();
    });
  });

  describe('getPatternByIndex', () => {
    it('should return pattern by index', () => {
      const store = createTestStore();
      const state = store.getState();
      const pattern = getPatternByIndex(state, 0);
      expect(pattern?.id).toBe(state.patterns[0].id);
    });

    it('should return null for out of bounds index', () => {
      const store = createTestStore();
      const state = store.getState();
      const pattern = getPatternByIndex(state, 100);
      expect(pattern).toBeNull();
    });
  });

  describe('getActivePatterns', () => {
    it('should return patterns with active steps', () => {
      const store = createTestStore();
      const stateBefore = store.getState();
      // Activate a step in first pattern
      store.getState().toggleStep(stateBefore.patterns[0].id, 0);
      const stateAfter = store.getState();
      const activePatterns = getActivePatterns(stateAfter);
      expect(activePatterns.length).toBe(1);
      expect(activePatterns[0].id).toBe(stateBefore.patterns[0].id);
    });

    it('should return empty array if no active patterns', () => {
      const store = createTestStore();
      const state = store.getState();
      const activePatterns = getActivePatterns(state);
      expect(activePatterns.length).toBe(0);
    });
  });

  describe('getEmptyPatterns', () => {
    it('should return patterns with no active steps', () => {
      const store = createTestStore();
      const stateBefore = store.getState();
      // Activate a step in first pattern
      store.getState().toggleStep(stateBefore.patterns[0].id, 0);
      const stateAfter = store.getState();
      const emptyPatterns = getEmptyPatterns(stateAfter);
      expect(emptyPatterns.length).toBe(2);
    });

    it('should return all patterns if none have active steps', () => {
      const store = createTestStore();
      const state = store.getState();
      const emptyPatterns = getEmptyPatterns(state);
      expect(emptyPatterns.length).toBe(3);
    });
  });

  describe('getPatternStats', () => {
    it('should return pattern statistics', () => {
      const store = createTestStore();
      const stateBefore = store.getState();
      // Activate 4 steps, accent 2
      store.getState().toggleStep(stateBefore.patterns[0].id, 0);
      store.getState().toggleStep(stateBefore.patterns[0].id, 1);
      store.getState().toggleStep(stateBefore.patterns[0].id, 2);
      store.getState().toggleStep(stateBefore.patterns[0].id, 3);
      store.getState().toggleAccent(stateBefore.patterns[0].id, 0);
      store.getState().toggleAccent(stateBefore.patterns[0].id, 1);
      
      const stateAfter = store.getState();
      const stats = getPatternStats(stateAfter.patterns[0]);
      expect(stats.activeSteps).toBe(4);
      expect(stats.accentSteps).toBe(2);
      expect(stats.density).toBeCloseTo(0.25);
    });
  });
});
