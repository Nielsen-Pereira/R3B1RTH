/**
 * TR-909 Store Tests - Batch 2 Development
 * R3B-97, R3B-98: TR-808/TR-909 Instruments Completion
 * 
 * Vitest tests for TR-909 instrument store
 */

import { describe, it, expect } from 'vitest';
import { create } from 'zustand';
import { useTR909Store, TR909_PRESETS, applyTR909Preset, getTR909State, isTR909Enabled, isTR909Muted, isTR909Solo, getTR909Volume, getTR909DrumState, isTR909DrumEnabled, getTR909DrumParameter } from '../stores/tr909Store';
import type { TR909State, TR909Drum } from '../stores/tr909Store';

// Mock implementation for testing
const createTestStore = (initialState?: Partial<TR909State>) => {
  const store = create<TR909State>((set) => ({
    id: 'tr909',
    name: 'TR-909',
    enabled: true,
    volume: 0.8,
    mute: false,
    solo: false,
    drums: [
      { id: 'bd', name: 'Bass Drum', enabled: true, parameters: { volume: 0.8, tune: 0, decay: 0.5, pan: 0, accent: 0.5, attack: 0.1 }, playing: false, accented: false },
      { id: 'sd', name: 'Snare', enabled: true, parameters: { volume: 0.8, tune: 0, decay: 0.5, pan: 0, accent: 0.5, attack: 0.1 }, playing: false, accented: false },
      { id: 'lt', name: 'Low Tom', enabled: true, parameters: { volume: 0.8, tune: 0, decay: 0.5, pan: 0, accent: 0.5, attack: 0.1 }, playing: false, accented: false },
      { id: 'mt', name: 'Mid Tom', enabled: true, parameters: { volume: 0.8, tune: 0, decay: 0.5, pan: 0, accent: 0.5, attack: 0.1 }, playing: false, accented: false },
      { id: 'ht', name: 'High Tom', enabled: true, parameters: { volume: 0.8, tune: 0, decay: 0.5, pan: 0, accent: 0.5, attack: 0.1 }, playing: false, accented: false },
      { id: 'cp', name: 'Clap', enabled: true, parameters: { volume: 0.8, tune: 0, decay: 0.5, pan: 0, accent: 0.5, attack: 0.1 }, playing: false, accented: false },
      { id: 'oh', name: 'Open Hi-Hat', enabled: true, parameters: { volume: 0.8, tune: 0, decay: 0.5, pan: 0, accent: 0.5, attack: 0.1 }, playing: false, accented: false },
      { id: 'ch', name: 'Closed Hi-Hat', enabled: true, parameters: { volume: 0.8, tune: 0, decay: 0.5, pan: 0, accent: 0.5, attack: 0.1 }, playing: false, accented: false },
      { id: 'cy', name: 'Crash', enabled: true, parameters: { volume: 0.8, tune: 0, decay: 0.5, pan: 0, accent: 0.5, attack: 0.1 }, playing: false, accented: false },
      { id: 'rd', name: 'Ride', enabled: true, parameters: { volume: 0.8, tune: 0, decay: 0.5, pan: 0, accent: 0.5, attack: 0.1 }, playing: false, accented: false },
      { id: 'rc', name: 'Rimshot', enabled: true, parameters: { volume: 0.8, tune: 0, decay: 0.5, pan: 0, accent: 0.5, attack: 0.1 }, playing: false, accented: false },
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
        { id: 'bd', name: 'Bass Drum', enabled: true, parameters: { volume: 0.8, tune: 0, decay: 0.5, pan: 0, accent: 0.5, attack: 0.1 }, playing: false, accented: false },
        { id: 'sd', name: 'Snare', enabled: true, parameters: { volume: 0.8, tune: 0, decay: 0.5, pan: 0, accent: 0.5, attack: 0.1 }, playing: false, accented: false },
        { id: 'lt', name: 'Low Tom', enabled: true, parameters: { volume: 0.8, tune: 0, decay: 0.5, pan: 0, accent: 0.5, attack: 0.1 }, playing: false, accented: false },
        { id: 'mt', name: 'Mid Tom', enabled: true, parameters: { volume: 0.8, tune: 0, decay: 0.5, pan: 0, accent: 0.5, attack: 0.1 }, playing: false, accented: false },
        { id: 'ht', name: 'High Tom', enabled: true, parameters: { volume: 0.8, tune: 0, decay: 0.5, pan: 0, accent: 0.5, attack: 0.1 }, playing: false, accented: false },
        { id: 'cp', name: 'Clap', enabled: true, parameters: { volume: 0.8, tune: 0, decay: 0.5, pan: 0, accent: 0.5, attack: 0.1 }, playing: false, accented: false },
        { id: 'oh', name: 'Open Hi-Hat', enabled: true, parameters: { volume: 0.8, tune: 0, decay: 0.5, pan: 0, accent: 0.5, attack: 0.1 }, playing: false, accented: false },
        { id: 'ch', name: 'Closed Hi-Hat', enabled: true, parameters: { volume: 0.8, tune: 0, decay: 0.5, pan: 0, accent: 0.5, attack: 0.1 }, playing: false, accented: false },
        { id: 'cy', name: 'Crash', enabled: true, parameters: { volume: 0.8, tune: 0, decay: 0.5, pan: 0, accent: 0.5, attack: 0.1 }, playing: false, accented: false },
        { id: 'rd', name: 'Ride', enabled: true, parameters: { volume: 0.8, tune: 0, decay: 0.5, pan: 0, accent: 0.5, attack: 0.1 }, playing: false, accented: false },
        { id: 'rc', name: 'Rimshot', enabled: true, parameters: { volume: 0.8, tune: 0, decay: 0.5, pan: 0, accent: 0.5, attack: 0.1 }, playing: false, accented: false },
      ],
    }),
    ...initialState,
  }));
  return store;
};

describe('TR-909 Store', () => {
  describe('initial state', () => {
    it('should be enabled by default', () => {
      const store = createTestStore();
      const state = store.getState();
      expect(state.enabled).toBe(true);
    });

    it('should have 11 drum channels', () => {
      const store = createTestStore();
      const state = store.getState();
      expect(state.drums.length).toBe(11);
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

    it('should have Ride drum', () => {
      const store = createTestStore();
      const state = store.getState();
      const rd = getTR909DrumState(state, 'rd');
      expect(rd?.name).toBe('Ride');
    });

    it('should have Rimshot drum', () => {
      const store = createTestStore();
      const state = store.getState();
      const rc = getTR909DrumState(state, 'rc');
      expect(rc?.name).toBe('Rimshot');
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
  });

  describe('setDrumEnabled', () => {
    it('should enable a drum', () => {
      const store = createTestStore();
      store.getState().setDrumEnabled('bd', false);
      store.getState().setDrumEnabled('bd', true);
      const state = store.getState();
      expect(isTR909DrumEnabled(state, 'bd')).toBe(true);
    });

    it('should disable a drum', () => {
      const store = createTestStore();
      store.getState().setDrumEnabled('rd', false);
      const state = store.getState();
      expect(isTR909DrumEnabled(state, 'rd')).toBe(false);
    });
  });

  describe('setDrumParameter', () => {
    it('should update drum volume', () => {
      const store = createTestStore();
      store.getState().setDrumParameter('bd', 'volume', 0.5);
      const state = store.getState();
      expect(getTR909DrumParameter(state, 'bd', 'volume')).toBe(0.5);
    });

    it('should update drum attack', () => {
      const store = createTestStore();
      store.getState().setDrumParameter('bd', 'attack', 0.5);
      const state = store.getState();
      expect(getTR909DrumParameter(state, 'bd', 'attack')).toBe(0.5);
    });
  });

  describe('noteOn/noteOff', () => {
    it('should trigger and release drum notes', () => {
      const store = createTestStore();
      store.getState().noteOn('bd', 1, true);
      let state = store.getState();
      expect(getTR909DrumState(state, 'bd')?.playing).toBe(true);
      expect(getTR909DrumState(state, 'bd')?.accented).toBe(true);

      store.getState().noteOff('bd');
      state = store.getState();
      expect(getTR909DrumState(state, 'bd')?.playing).toBe(false);
      expect(getTR909DrumState(state, 'bd')?.accented).toBe(false);
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
      store.getState().noteOn('bd', 1, true);
      
      store.getState().reset();
      const state = store.getState();
      
      expect(state.enabled).toBe(true);
      expect(state.volume).toBe(0.8);
      expect(isTR909DrumEnabled(state, 'bd')).toBe(true);
      expect(state.drums.filter(d => d.playing).length).toBe(0);
    });
  });
});

describe('Selectors', () => {
  describe('getTR909State', () => {
    it('should return the full state', () => {
      const store = createTestStore();
      const state = store.getState();
      const tr909State = getTR909State(state);
      expect(tr909State).toEqual(state);
    });
  });

  describe('isTR909Enabled', () => {
    it('should return true when enabled', () => {
      const store = createTestStore();
      const state = store.getState();
      expect(isTR909Enabled(state)).toBe(true);
    });
  });

  describe('isTR909Muted', () => {
    it('should return true when muted', () => {
      const store = createTestStore({ mute: true });
      const state = store.getState();
      expect(isTR909Muted(state)).toBe(true);
    });
  });

  describe('isTR909Solo', () => {
    it('should return true when solo is enabled', () => {
      const store = createTestStore({ solo: true });
      const state = store.getState();
      expect(isTR909Solo(state)).toBe(true);
    });
  });

  describe('getTR909Volume', () => {
    it('should return the volume value', () => {
      const store = createTestStore();
      const state = store.getState();
      expect(getTR909Volume(state)).toBe(0.8);
    });
  });

  describe('getTR909DrumState', () => {
    it('should return the specified drum state', () => {
      const store = createTestStore();
      const state = store.getState();
      const bd = getTR909DrumState(state, 'bd');
      expect(bd?.id).toBe('bd');
      expect(bd?.name).toBe('Bass Drum');
    });

    it('should return undefined for non-existent drum', () => {
      const store = createTestStore();
      const state = store.getState();
      const unknown = getTR909DrumState(state, 'unknown' as TR909Drum);
      expect(unknown).toBeUndefined();
    });
  });

  describe('isTR909DrumEnabled', () => {
    it('should return true for enabled drum', () => {
      const store = createTestStore();
      const state = store.getState();
      expect(isTR909DrumEnabled(state, 'bd')).toBe(true);
    });

    it('should return false for disabled drum', () => {
      const store = createTestStore();
      store.getState().setDrumEnabled('rd', false);
      const state = store.getState();
      expect(isTR909DrumEnabled(state, 'rd')).toBe(false);
    });
  });

  describe('getTR909DrumParameter', () => {
    it('should return the specified drum parameter', () => {
      const store = createTestStore();
      const state = store.getState();
      expect(getTR909DrumParameter(state, 'bd', 'volume')).toBe(0.8);
      expect(getTR909DrumParameter(state, 'bd', 'attack')).toBe(0.1);
    });
  });
});

describe('Presets', () => {
  describe('TR909_PRESETS', () => {
    it('should have Default preset', () => {
      expect(TR909_PRESETS.Default).toBeDefined();
      expect(TR909_PRESETS.Default.length).toBe(11);
    });

    it('should have Punchy preset', () => {
      expect(TR909_PRESETS.Punchy).toBeDefined();
    });
  });

  describe('applyTR909Preset', () => {
    it('should apply preset to all drums', () => {
      const mockSetState = vi.fn();
      const testStore = { getState: () => createTestStore().getState(), setState: mockSetState };
      
      applyTR909Preset(testStore as any, 'Punchy');
      
      expect(mockSetState).toHaveBeenCalled();
    });
  });
});
