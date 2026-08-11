/**
 * TR-808 Store Tests - Batch 2 Development
 * R3B-97, R3B-98: TR-808/TR-909 Instruments Completion
 * 
 * Vitest tests for TR-808 instrument store
 */

import { describe, it, expect } from 'vitest';
import { create } from 'zustand';
import { useTR808Store, TR808_PRESETS, applyTR808Preset, getTR808State, isTR808Enabled, isTR808Muted, isTR808Solo, getTR808Volume, getDrumState, isDrumEnabled, getDrumParameter } from '../stores/tr808Store';
import type { TR808State, TR808Drum } from '../stores/tr808Store';

// Mock implementation for testing
const createTestStore = (initialState?: Partial<TR808State>) => {
  const store = create<TR808State>((set) => ({
    id: 'tr808',
    name: 'TR-808',
    enabled: true,
    volume: 0.8,
    mute: false,
    solo: false,
    drums: [
      { id: 'bd', name: 'Bass Drum', enabled: true, parameters: { volume: 0.8, tune: 0, decay: 0.5, pan: 0, accent: 0.5 }, playing: false, accented: false },
      { id: 'sd', name: 'Snare', enabled: true, parameters: { volume: 0.8, tune: 0, decay: 0.5, pan: 0, accent: 0.5 }, playing: false, accented: false },
      { id: 'lt', name: 'Low Tom', enabled: true, parameters: { volume: 0.8, tune: 0, decay: 0.5, pan: 0, accent: 0.5 }, playing: false, accented: false },
      { id: 'mt', name: 'Mid Tom', enabled: true, parameters: { volume: 0.8, tune: 0, decay: 0.5, pan: 0, accent: 0.5 }, playing: false, accented: false },
      { id: 'ht', name: 'High Tom', enabled: true, parameters: { volume: 0.8, tune: 0, decay: 0.5, pan: 0, accent: 0.5 }, playing: false, accented: false },
      { id: 'cp', name: 'Clap', enabled: true, parameters: { volume: 0.8, tune: 0, decay: 0.5, pan: 0, accent: 0.5 }, playing: false, accented: false },
      { id: 'oh', name: 'Open Hi-Hat', enabled: true, parameters: { volume: 0.8, tune: 0, decay: 0.5, pan: 0, accent: 0.5 }, playing: false, accented: false },
      { id: 'ch', name: 'Closed Hi-Hat', enabled: true, parameters: { volume: 0.8, tune: 0, decay: 0.5, pan: 0, accent: 0.5 }, playing: false, accented: false },
      { id: 'cy', name: 'Crash', enabled: true, parameters: { volume: 0.8, tune: 0, decay: 0.5, pan: 0, accent: 0.5 }, playing: false, accented: false },
      { id: 'cl', name: 'Claves', enabled: true, parameters: { volume: 0.8, tune: 0, decay: 0.5, pan: 0, accent: 0.5 }, playing: false, accented: false },
    ],

    setEnabled: (enabled) => set({ enabled }),
    setVolume: (volume) => set({ volume: Math.max(0, Math.min(1, volume)) }),
    setMute: (mute) => set({ mute }),
    setSolo: (solo) => set({ solo }),
    setDrumParameter: (drumId, param, value) => set((state) => ({
      drums: state.drums.map(drum =>
        drum.id === drumId
          ? { ...drum, parameters: { ...drum.parameters, [param]: Math.max(0, Math.min(1, value)) } }
          : drum
      ),
    })),
    setDrumEnabled: (drumId, enabled) => set((state) => ({
      drums: state.drums.map(drum =>
        drum.id === drumId ? { ...drum, enabled } : drum
      ),
    })),
    noteOn: (drumId, velocity, accent) => set((state) => ({
      drums: state.drums.map(drum =>
        drum.id === drumId
          ? { ...drum, playing: true, accented: accent }
          : drum
      ),
    })),
    noteOff: (drumId) => set((state) => ({
      drums: state.drums.map(drum =>
        drum.id === drumId ? { ...drum, playing: false, accented: false } : drum
      ),
    })),
    allNotesOff: () => set((state) => ({
      drums: state.drums.map(drum => ({ ...drum, playing: false, accented: false })),
    })),
    reset: () => set({
      enabled: true,
      volume: 0.8,
      mute: false,
      solo: false,
      drums: [
        { id: 'bd', name: 'Bass Drum', enabled: true, parameters: { volume: 0.8, tune: 0, decay: 0.5, pan: 0, accent: 0.5 }, playing: false, accented: false },
        { id: 'sd', name: 'Snare', enabled: true, parameters: { volume: 0.8, tune: 0, decay: 0.5, pan: 0, accent: 0.5 }, playing: false, accented: false },
        { id: 'lt', name: 'Low Tom', enabled: true, parameters: { volume: 0.8, tune: 0, decay: 0.5, pan: 0, accent: 0.5 }, playing: false, accented: false },
        { id: 'mt', name: 'Mid Tom', enabled: true, parameters: { volume: 0.8, tune: 0, decay: 0.5, pan: 0, accent: 0.5 }, playing: false, accented: false },
        { id: 'ht', name: 'High Tom', enabled: true, parameters: { volume: 0.8, tune: 0, decay: 0.5, pan: 0, accent: 0.5 }, playing: false, accented: false },
        { id: 'cp', name: 'Clap', enabled: true, parameters: { volume: 0.8, tune: 0, decay: 0.5, pan: 0, accent: 0.5 }, playing: false, accented: false },
        { id: 'oh', name: 'Open Hi-Hat', enabled: true, parameters: { volume: 0.8, tune: 0, decay: 0.5, pan: 0, accent: 0.5 }, playing: false, accented: false },
        { id: 'ch', name: 'Closed Hi-Hat', enabled: true, parameters: { volume: 0.8, tune: 0, decay: 0.5, pan: 0, accent: 0.5 }, playing: false, accented: false },
        { id: 'cy', name: 'Crash', enabled: true, parameters: { volume: 0.8, tune: 0, decay: 0.5, pan: 0, accent: 0.5 }, playing: false, accented: false },
        { id: 'cl', name: 'Claves', enabled: true, parameters: { volume: 0.8, tune: 0, decay: 0.5, pan: 0, accent: 0.5 }, playing: false, accented: false },
      ],
    }),
    ...initialState,
  }));
  return store;
};

describe('TR-808 Store', () => {
  describe('initial state', () => {
    it('should be enabled by default', () => {
      const store = createTestStore();
      const state = store.getState();
      expect(state.enabled).toBe(true);
    });

    it('should have 10 drum channels', () => {
      const store = createTestStore();
      const state = store.getState();
      expect(state.drums.length).toBe(10);
    });

    it('should have all drums enabled by default', () => {
      const store = createTestStore();
      const state = store.getState();
      expect(state.drums.every(d => d.enabled)).toBe(true);
    });

    it('should have default volume of 0.8', () => {
      const store = createTestStore();
      const state = store.getState();
      expect(state.volume).toBe(0.8);
    });
  });

  describe('setEnabled', () => {
    it('should enable the instrument', () => {
      const store = createTestStore({ enabled: false });
      store.getState().setEnabled(true);
      const state = store.getState();
      expect(state.enabled).toBe(true);
    });

    it('should disable the instrument', () => {
      const store = createTestStore();
      store.getState().setEnabled(false);
      const state = store.getState();
      expect(state.enabled).toBe(false);
    });
  });

  describe('setVolume', () => {
    it('should update volume', () => {
      const store = createTestStore();
      store.getState().setVolume(0.5);
      const state = store.getState();
      expect(state.volume).toBe(0.5);
    });

    it('should clamp volume between 0 and 1', () => {
      const store = createTestStore();
      store.getState().setVolume(1.5);
      const state = store.getState();
      expect(state.volume).toBe(1);
    });
  });

  describe('setDrumEnabled', () => {
    it('should enable a drum', () => {
      const store = createTestStore();
      store.getState().setDrumEnabled('bd', false);
      store.getState().setDrumEnabled('bd', true);
      const state = store.getState();
      expect(isDrumEnabled(state, 'bd')).toBe(true);
    });

    it('should disable a drum', () => {
      const store = createTestStore();
      store.getState().setDrumEnabled('bd', false);
      const state = store.getState();
      expect(isDrumEnabled(state, 'bd')).toBe(false);
    });
  });

  describe('setDrumParameter', () => {
    it('should update drum volume', () => {
      const store = createTestStore();
      store.getState().setDrumParameter('bd', 'volume', 0.5);
      const state = store.getState();
      expect(getDrumParameter(state, 'bd', 'volume')).toBe(0.5);
    });

    it('should update drum tune', () => {
      const store = createTestStore();
      store.getState().setDrumParameter('bd', 'tune', -12);
      const state = store.getState();
      expect(getDrumParameter(state, 'bd', 'tune')).toBe(-12);
    });

    it('should update drum decay', () => {
      const store = createTestStore();
      store.getState().setDrumParameter('bd', 'decay', 0.8);
      const state = store.getState();
      expect(getDrumParameter(state, 'bd', 'decay')).toBe(0.8);
    });
  });

  describe('noteOn', () => {
    it('should trigger a drum note on', () => {
      const store = createTestStore();
      store.getState().noteOn('bd', 1, true);
      const state = store.getState();
      const bd = getDrumState(state, 'bd');
      expect(bd?.playing).toBe(true);
      expect(bd?.accented).toBe(true);
    });

    it('should trigger multiple drum notes', () => {
      const store = createTestStore();
      store.getState().noteOn('bd', 1, false);
      store.getState().noteOn('sd', 1, false);
      const state = store.getState();
      expect(getDrumState(state, 'bd')?.playing).toBe(true);
      expect(getDrumState(state, 'sd')?.playing).toBe(true);
    });
  });

  describe('noteOff', () => {
    it('should turn off a playing drum', () => {
      const store = createTestStore();
      store.getState().noteOn('bd', 1, false);
      store.getState().noteOff('bd');
      const state = store.getState();
      const bd = getDrumState(state, 'bd');
      expect(bd?.playing).toBe(false);
      expect(bd?.accented).toBe(false);
    });
  });

  describe('allNotesOff', () => {
    it('should turn off all playing drums', () => {
      const store = createTestStore();
      store.getState().noteOn('bd', 1, false);
      store.getState().noteOn('sd', 1, false);
      store.getState().allNotesOff();
      const state = store.getState();
      const playingDrums = state.drums.filter(d => d.playing);
      expect(playingDrums.length).toBe(0);
    });
  });

  describe('reset', () => {
    it('should reset to initial state', () => {
      const store = createTestStore();
      store.getState().setEnabled(false);
      store.getState().setVolume(0.5);
      store.getState().setDrumEnabled('bd', false);
      store.getState().setDrumParameter('bd', 'volume', 0.3);
      store.getState().noteOn('bd', 1, true);
      
      store.getState().reset();
      const state = store.getState();
      
      expect(state.enabled).toBe(true);
      expect(state.volume).toBe(0.8);
      expect(isDrumEnabled(state, 'bd')).toBe(true);
      expect(getDrumParameter(state, 'bd', 'volume')).toBe(0.8);
      expect(state.drums.filter(d => d.playing).length).toBe(0);
    });
  });
});

describe('Selectors', () => {
  describe('getTR808State', () => {
    it('should return the full state', () => {
      const store = createTestStore();
      const state = store.getState();
      const tr808State = getTR808State(state);
      expect(tr808State).toEqual(state);
    });
  });

  describe('isTR808Enabled', () => {
    it('should return true when enabled', () => {
      const store = createTestStore();
      const state = store.getState();
      expect(isTR808Enabled(state)).toBe(true);
    });

    it('should return false when disabled', () => {
      const store = createTestStore({ enabled: false });
      const state = store.getState();
      expect(isTR808Enabled(state)).toBe(false);
    });
  });

  describe('isTR808Muted', () => {
    it('should return true when muted', () => {
      const store = createTestStore({ mute: true });
      const state = store.getState();
      expect(isTR808Muted(state)).toBe(true);
    });
  });

  describe('isTR808Solo', () => {
    it('should return true when solo is enabled', () => {
      const store = createTestStore({ solo: true });
      const state = store.getState();
      expect(isTR808Solo(state)).toBe(true);
    });
  });

  describe('getTR808Volume', () => {
    it('should return the volume value', () => {
      const store = createTestStore();
      const state = store.getState();
      expect(getTR808Volume(state)).toBe(0.8);
    });
  });

  describe('getDrumState', () => {
    it('should return the specified drum state', () => {
      const store = createTestStore();
      const state = store.getState();
      const bd = getDrumState(state, 'bd');
      expect(bd?.id).toBe('bd');
      expect(bd?.name).toBe('Bass Drum');
    });

    it('should return undefined for non-existent drum', () => {
      const store = createTestStore();
      const state = store.getState();
      const unknown = getDrumState(state, 'unknown' as TR808Drum);
      expect(unknown).toBeUndefined();
    });
  });

  describe('isDrumEnabled', () => {
    it('should return true for enabled drum', () => {
      const store = createTestStore();
      const state = store.getState();
      expect(isDrumEnabled(state, 'bd')).toBe(true);
    });

    it('should return false for disabled drum', () => {
      const store = createTestStore();
      store.getState().setDrumEnabled('bd', false);
      const state = store.getState();
      expect(isDrumEnabled(state, 'bd')).toBe(false);
    });
  });

  describe('getDrumParameter', () => {
    it('should return the specified drum parameter', () => {
      const store = createTestStore();
      const state = store.getState();
      expect(getDrumParameter(state, 'bd', 'volume')).toBe(0.8);
      expect(getDrumParameter(state, 'bd', 'tune')).toBe(0);
    });
  });
});

describe('Presets', () => {
  describe('TR808_PRESETS', () => {
    it('should have Default preset', () => {
      expect(TR808_PRESETS.Default).toBeDefined();
      expect(TR808_PRESETS.Default.length).toBe(10);
    });

    it('should have Punchy preset', () => {
      expect(TR808_PRESETS.Punchy).toBeDefined();
    });
  });

  describe('applyTR808Preset', () => {
    it('should apply preset to all drums', () => {
      const store = { getState: () => createTestStore().getState(), setState: (state: Partial<TR808State>) => {} };
      const mockSetState = vi.fn();
      const testStore = { getState: () => createTestStore().getState(), setState: mockSetState };
      
      applyTR808Preset(testStore as any, 'Punchy');
      
      expect(mockSetState).toHaveBeenCalled();
    });
  });
});
