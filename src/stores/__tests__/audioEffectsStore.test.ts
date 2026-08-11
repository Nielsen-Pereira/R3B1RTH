/**
 * Audio Effects Store Tests - Batch 1 Development
 * R3B-94: Audio Effects Routing & Completion
 * 
 * Vitest tests for audioEffectsStore functionality
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { create } from 'zustand';
import { useAudioEffectsStore, getEffectConfig, getInstrumentRouting, getMasterRouting, isEffectUsed } from '../stores/audioEffectsStore';
import type { AudioEffectsState, EffectType, EffectRouting } from '../types';

// Mock implementation for testing
const createTestStore = (initialState?: Partial<AudioEffectsState>) => {
  const store = create<AudioEffectsState>((set) => ({
    distortion: {
      enabled: false,
      wetDryMix: 0.5,
      bypass: false,
      parameters: { drive: 0.5, tone: 0.5 },
    },
    pcf: {
      enabled: false,
      wetDryMix: 0.5,
      bypass: false,
      parameters: { cutoff: 0.5, resonance: 0.5 },
    },
    compressor: {
      enabled: false,
      wetDryMix: 1.0,
      bypass: false,
      parameters: { threshold: -20, ratio: 4, attack: 0.01, release: 0.1 },
    },
    delay: {
      enabled: false,
      wetDryMix: 0.5,
      bypass: false,
      parameters: { time: 0.5, feedback: 0.3 },
    },
    tb303Routing: { insert: [], send: [] },
    tr808Routing: { insert: [], send: [] },
    tr909Routing: { insert: [], send: [] },
    masterRouting: { insert: [], send: [] },
    
    setEffectConfig: (effect, config) => set((state) => ({
      [effect]: { ...state[effect as EffectType], ...config },
    })),
    setInstrumentRouting: (instrument, routing) => set((state) => ({
      [instrument + 'Routing']: routing,
    })),
    setMasterRouting: (routing) => set({ masterRouting: routing }),
    toggleEffect: (effect, enabled) => set((state) => ({
      [effect]: { ...state[effect as EffectType], enabled },
    })),
    resetAll: () => set({
      distortion: { enabled: false, wetDryMix: 0.5, bypass: false, parameters: { drive: 0.5, tone: 0.5 } },
      pcf: { enabled: false, wetDryMix: 0.5, bypass: false, parameters: { cutoff: 0.5, resonance: 0.5 } },
      compressor: { enabled: false, wetDryMix: 1.0, bypass: false, parameters: { threshold: -20, ratio: 4, attack: 0.01, release: 0.1 } },
      delay: { enabled: false, wetDryMix: 0.5, bypass: false, parameters: { time: 0.5, feedback: 0.3 } },
      tb303Routing: { insert: [], send: [] },
      tr808Routing: { insert: [], send: [] },
      tr909Routing: { insert: [], send: [] },
      masterRouting: { insert: [], send: [] },
    }),
    ...initialState,
  }));
  return store;
};

describe('audioEffectsStore', () => {
  describe('initial state', () => {
    it('should have all effects disabled by default', () => {
      const store = createTestStore();
      const state = store.getState();
      expect(state.distortion.enabled).toBe(false);
      expect(state.pcf.enabled).toBe(false);
      expect(state.compressor.enabled).toBe(false);
      expect(state.delay.enabled).toBe(false);
    });

    it('should have empty routing by default', () => {
      const store = createTestStore();
      const state = store.getState();
      expect(state.tb303Routing.insert).toEqual([]);
      expect(state.tb303Routing.send).toEqual([]);
      expect(state.masterRouting.insert).toEqual([]);
      expect(state.masterRouting.send).toEqual([]);
    });

    it('should have default parameter values', () => {
      const store = createTestStore();
      const state = store.getState();
      expect(state.distortion.parameters.drive).toBe(0.5);
      expect(state.distortion.parameters.tone).toBe(0.5);
      expect(state.pcf.parameters.cutoff).toBe(0.5);
      expect(state.compressor.parameters.threshold).toBe(-20);
    });
  });

  describe('setEffectConfig', () => {
    it('should update effect configuration', () => {
      const store = createTestStore();
      store.getState().setEffectConfig('distortion', {
        parameters: { drive: 0.8, tone: 0.3 },
      });
      const state = store.getState();
      expect(state.distortion.parameters.drive).toBe(0.8);
      expect(state.distortion.parameters.tone).toBe(0.3);
    });

    it('should preserve other parameters', () => {
      const store = createTestStore();
      store.getState().setEffectConfig('distortion', {
        parameters: { drive: 0.8 },
      });
      const state = store.getState();
      expect(state.distortion.parameters.drive).toBe(0.8);
      expect(state.distortion.parameters.tone).toBe(0.5); // unchanged
    });
  });

  describe('toggleEffect', () => {
    it('should enable an effect', () => {
      const store = createTestStore();
      store.getState().toggleEffect('distortion', true);
      const state = store.getState();
      expect(state.distortion.enabled).toBe(true);
    });

    it('should disable an effect', () => {
      const store = createTestStore();
      store.getState().toggleEffect('distortion', true);
      store.getState().toggleEffect('distortion', false);
      const state = store.getState();
      expect(state.distortion.enabled).toBe(false);
    });
  });

  describe('setInstrumentRouting', () => {
    it('should update instrument routing', () => {
      const store = createTestStore();
      const newRouting: EffectRouting = {
        insert: ['distortion'],
        send: ['delay'],
      };
      store.getState().setInstrumentRouting('tb303', newRouting);
      const state = store.getState();
      expect(state.tb303Routing.insert).toEqual(['distortion']);
      expect(state.tb303Routing.send).toEqual(['delay']);
    });

    it('should not affect other instrument routings', () => {
      const store = createTestStore();
      const newRouting: EffectRouting = {
        insert: ['distortion'],
        send: [],
      };
      store.getState().setInstrumentRouting('tb303', newRouting);
      const state = store.getState();
      expect(state.tr808Routing.insert).toEqual([]);
      expect(state.tr909Routing.insert).toEqual([]);
    });
  });

  describe('setMasterRouting', () => {
    it('should update master routing', () => {
      const store = createTestStore();
      const newRouting: EffectRouting = {
        insert: ['compressor'],
        send: ['delay'],
      };
      store.getState().setMasterRouting(newRouting);
      const state = store.getState();
      expect(state.masterRouting.insert).toEqual(['compressor']);
      expect(state.masterRouting.send).toEqual(['delay']);
    });
  });

  describe('resetAll', () => {
    it('should reset all effects to default', () => {
      const store = createTestStore();
      store.getState().setEffectConfig('distortion', {
        enabled: true,
        parameters: { drive: 0.8 },
      });
      store.getState().setInstrumentRouting('tb303', {
        insert: ['distortion'],
        send: [],
      });
      
      store.getState().resetAll();
      const state = store.getState();
      
      expect(state.distortion.enabled).toBe(false);
      expect(state.distortion.parameters.drive).toBe(0.5);
      expect(state.tb303Routing.insert).toEqual([]);
    });
  });
});

describe('selectors', () => {
  describe('getEffectConfig', () => {
    it('should return the correct effect config', () => {
      const store = createTestStore();
      const state = store.getState();
      const config = getEffectConfig(state, 'distortion');
      expect(config.parameters.drive).toBe(0.5);
      expect(config.parameters.tone).toBe(0.5);
    });
  });

  describe('getInstrumentRouting', () => {
    it('should return the correct instrument routing', () => {
      const store = createTestStore();
      store.getState().setInstrumentRouting('tb303', {
        insert: ['distortion'],
        send: ['delay'],
      });
      const state = store.getState();
      const routing = getInstrumentRouting(state, 'tb303');
      expect(routing.insert).toEqual(['distortion']);
      expect(routing.send).toEqual(['delay']);
    });
  });

  describe('getMasterRouting', () => {
    it('should return the master routing', () => {
      const store = createTestStore();
      store.getState().setMasterRouting({
        insert: ['compressor'],
        send: [],
      });
      const state = store.getState();
      const routing = getMasterRouting(state);
      expect(routing.insert).toEqual(['compressor']);
    });
  });

  describe('isEffectUsed', () => {
    it('should return true if effect is in any routing', () => {
      const store = createTestStore();
      store.getState().setInstrumentRouting('tb303', {
        insert: ['distortion'],
        send: [],
      });
      const state = store.getState();
      expect(isEffectUsed(state, 'distortion')).toBe(true);
    });

    it('should return false if effect is not in any routing', () => {
      const store = createTestStore();
      const state = store.getState();
      expect(isEffectUsed(state, 'distortion')).toBe(false);
    });

    it('should check send routing', () => {
      const store = createTestStore();
      store.getState().setInstrumentRouting('tb303', {
        insert: [],
        send: ['delay'],
      });
      const state = store.getState();
      expect(isEffectUsed(state, 'delay')).toBe(true);
    });

    it('should check master routing', () => {
      const store = createTestStore();
      store.getState().setMasterRouting({
        insert: ['compressor'],
        send: [],
      });
      const state = store.getState();
      expect(isEffectUsed(state, 'compressor')).toBe(true);
    });
  });
});
