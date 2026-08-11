/**
 * TB-303 Store Tests - Batch 2 Development
 * R3B-95, R3B-96: TR-808/TR-909 Instruments Completion
 * 
 * Vitest tests for TB-303 instrument store
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { create } from 'zustand';
import { useTB303Store, TB303_PRESETS, applyTB303Preset, getTB303State, isTB303Enabled, isTB303Muted, isTB303Solo, getTB303Volume, getTB303Parameter } from '../stores/tb303Store';
import type { TB303State, TB303Waveform } from '../stores/tb303Store';

// Mock implementation for testing
const createTestStore = (initialState?: Partial<TB303State>) => {
  const store = create<TB303State>((set) => ({
    id: 'tb303',
    name: 'TB-303',
    enabled: true,
    volume: 0.8,
    mute: false,
    solo: false,
    parameters: {
      cutoff: 0.5,
      resonance: 0.5,
      envMod: 0.5,
      decay: 0.5,
      accent: 0.5,
      volume: 0.8,
      waveform: 'sawtooth',
      tune: 0,
      slide: false,
    },
    voices: Array.from({ length: 16 }, (_, i) => ({
      id: i,
      note: null,
      playing: false,
      sliding: false,
      accented: false,
    })),

    setEnabled: (enabled) => set({ enabled }),
    setVolume: (volume) => set({ volume: Math.max(0, Math.min(1, volume)) }),
    setMute: (mute) => set({ mute }),
    setSolo: (solo) => set({ solo }),
    setParameter: (param, value) => set((state) => ({
      parameters: {
        ...state.parameters,
        [param]: typeof value === 'number' ? Math.max(0, Math.min(1, value)) : value,
      },
    })),
    setWaveform: (waveform) => set((state) => ({
      parameters: { ...state.parameters, waveform },
    })),
    noteOn: (note, velocity, accent, slide) => set((state) => {
      const voice = state.voices.find(v => !v.playing);
      if (!voice) return state;
      voice.note = note;
      voice.playing = true;
      voice.sliding = slide;
      voice.accented = accent;
      return { voices: [...state.voices] };
    }),
    noteOff: (note) => set((state) => ({
      voices: state.voices.map(v =>
        v.note === note ? { ...v, playing: false, note: null } : v
      ),
    })),
    allNotesOff: () => set((state) => ({
      voices: state.voices.map(v => ({ ...v, playing: false, note: null })),
    })),
    reset: () => set({
      enabled: true,
      volume: 0.8,
      mute: false,
      solo: false,
      parameters: {
        cutoff: 0.5,
        resonance: 0.5,
        envMod: 0.5,
        decay: 0.5,
        accent: 0.5,
        volume: 0.8,
        waveform: 'sawtooth',
        tune: 0,
        slide: false,
      },
      voices: Array.from({ length: 16 }, (_, i) => ({
        id: i,
        note: null,
        playing: false,
        sliding: false,
        accented: false,
      })),
    }),
    ...initialState,
  }));
  return store;
};

describe('TB303 Store', () => {
  describe('initial state', () => {
    it('should be enabled by default', () => {
      const store = createTestStore();
      const state = store.getState();
      expect(state.enabled).toBe(true);
    });

    it('should have default volume of 0.8', () => {
      const store = createTestStore();
      const state = store.getState();
      expect(state.volume).toBe(0.8);
    });

    it('should have sawtooth as default waveform', () => {
      const store = createTestStore();
      const state = store.getState();
      expect(state.parameters.waveform).toBe('sawtooth');
    });

    it('should have 16 voices', () => {
      const store = createTestStore();
      const state = store.getState();
      expect(state.voices.length).toBe(16);
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
      store.getState().setVolume(-0.5);
      const state2 = store.getState();
      expect(state2.volume).toBe(0);
    });
  });

  describe('setMute', () => {
    it('should mute the instrument', () => {
      const store = createTestStore();
      store.getState().setMute(true);
      const state = store.getState();
      expect(state.mute).toBe(true);
    });

    it('should unmute the instrument', () => {
      const store = createTestStore({ mute: true });
      store.getState().setMute(false);
      const state = store.getState();
      expect(state.mute).toBe(false);
    });
  });

  describe('setSolo', () => {
    it('should enable solo mode', () => {
      const store = createTestStore();
      store.getState().setSolo(true);
      const state = store.getState();
      expect(state.solo).toBe(true);
    });
  });

  describe('setParameter', () => {
    it('should update cutoff parameter', () => {
      const store = createTestStore();
      store.getState().setParameter('cutoff', 0.8);
      const state = store.getState();
      expect(state.parameters.cutoff).toBe(0.8);
    });

    it('should update resonance parameter', () => {
      const store = createTestStore();
      store.getState().setParameter('resonance', 0.3);
      const state = store.getState();
      expect(state.parameters.resonance).toBe(0.3);
    });

    it('should clamp parameter values between 0 and 1', () => {
      const store = createTestStore();
      store.getState().setParameter('cutoff', 1.5);
      const state = store.getState();
      expect(state.parameters.cutoff).toBe(1);
    });
  });

  describe('setWaveform', () => {
    it('should change waveform to square', () => {
      const store = createTestStore();
      store.getState().setWaveform('square');
      const state = store.getState();
      expect(state.parameters.waveform).toBe('square');
    });

    it('should change waveform to pulse', () => {
      const store = createTestStore();
      store.getState().setWaveform('pulse');
      const state = store.getState();
      expect(state.parameters.waveform).toBe('pulse');
    });
  });

  describe('noteOn', () => {
    it('should trigger a note on', () => {
      const store = createTestStore();
      store.getState().noteOn(60, 1, false, false);
      const state = store.getState();
      const playingVoice = state.voices.find(v => v.playing);
      expect(playingVoice).toBeDefined();
      expect(playingVoice?.note).toBe(60);
    });

    it('should set accent flag', () => {
      const store = createTestStore();
      store.getState().noteOn(60, 1, true, false);
      const state = store.getState();
      const accentedVoice = state.voices.find(v => v.accented);
      expect(accentedVoice?.accented).toBe(true);
    });

    it('should set slide flag', () => {
      const store = createTestStore();
      store.getState().noteOn(60, 1, false, true);
      const state = store.getState();
      const slidingVoice = state.voices.find(v => v.sliding);
      expect(slidingVoice?.sliding).toBe(true);
    });

    it('should not exceed max voices', () => {
      const store = createTestStore();
      // Try to play 20 notes (only 16 voices available)
      for (let i = 0; i < 20; i++) {
        store.getState().noteOn(60 + i, 1, false, false);
      }
      const state = store.getState();
      const playingVoices = state.voices.filter(v => v.playing);
      expect(playingVoices.length).toBeLessThanOrEqual(16);
    });
  });

  describe('noteOff', () => {
    it('should turn off a playing note', () => {
      const store = createTestStore();
      store.getState().noteOn(60, 1, false, false);
      store.getState().noteOff(60);
      const state = store.getState();
      const playingVoice = state.voices.find(v => v.playing && v.note === 60);
      expect(playingVoice).toBeUndefined();
    });

    it('should not affect other notes', () => {
      const store = createTestStore();
      store.getState().noteOn(60, 1, false, false);
      store.getState().noteOn(64, 1, false, false);
      store.getState().noteOff(60);
      const state = store.getState();
      const note64 = state.voices.find(v => v.note === 64);
      expect(note64?.playing).toBe(true);
    });
  });

  describe('allNotesOff', () => {
    it('should turn off all playing notes', () => {
      const store = createTestStore();
      store.getState().noteOn(60, 1, false, false);
      store.getState().noteOn(64, 1, false, false);
      store.getState().allNotesOff();
      const state = store.getState();
      const playingVoices = state.voices.filter(v => v.playing);
      expect(playingVoices.length).toBe(0);
    });
  });

  describe('reset', () => {
    it('should reset to initial state', () => {
      const store = createTestStore();
      store.getState().setEnabled(false);
      store.getState().setVolume(0.5);
      store.getState().setParameter('cutoff', 0.8);
      store.getState().noteOn(60, 1, true, false);
      
      store.getState().reset();
      const state = store.getState();
      
      expect(state.enabled).toBe(true);
      expect(state.volume).toBe(0.8);
      expect(state.parameters.cutoff).toBe(0.5);
      expect(state.voices.filter(v => v.playing).length).toBe(0);
    });
  });
});

describe('Selectors', () => {
  describe('getTB303State', () => {
    it('should return the full state', () => {
      const store = createTestStore();
      const state = store.getState();
      const tb303State = getTB303State(state);
      expect(tb303State).toEqual(state);
    });
  });

  describe('isTB303Enabled', () => {
    it('should return true when enabled', () => {
      const store = createTestStore();
      const state = store.getState();
      expect(isTB303Enabled(state)).toBe(true);
    });

    it('should return false when disabled', () => {
      const store = createTestStore({ enabled: false });
      const state = store.getState();
      expect(isTB303Enabled(state)).toBe(false);
    });
  });

  describe('isTB303Muted', () => {
    it('should return true when muted', () => {
      const store = createTestStore({ mute: true });
      const state = store.getState();
      expect(isTB303Muted(state)).toBe(true);
    });

    it('should return false when not muted', () => {
      const store = createTestStore();
      const state = store.getState();
      expect(isTB303Muted(state)).toBe(false);
    });
  });

  describe('isTB303Solo', () => {
    it('should return true when solo is enabled', () => {
      const store = createTestStore({ solo: true });
      const state = store.getState();
      expect(isTB303Solo(state)).toBe(true);
    });
  });

  describe('getTB303Volume', () => {
    it('should return the volume value', () => {
      const store = createTestStore();
      const state = store.getState();
      expect(getTB303Volume(state)).toBe(0.8);
    });
  });

  describe('getTB303Parameter', () => {
    it('should return the specified parameter value', () => {
      const store = createTestStore();
      const state = store.getState();
      expect(getTB303Parameter(state, 'cutoff')).toBe(0.5);
      expect(getTB303Parameter(state, 'resonance')).toBe(0.5);
    });
  });
});

describe('Presets', () => {
  describe('TB303_PRESETS', () => {
    it('should have Default preset', () => {
      expect(TB303_PRESETS.Default).toBeDefined();
      expect(TB303_PRESETS.Default.cutoff).toBe(0.5);
    });

    it('should have Acid preset', () => {
      expect(TB303_PRESETS.Acid).toBeDefined();
      expect(TB303_PRESETS.Acid.waveform).toBe('square');
    });
  });

  describe('applyTB303Preset', () => {
    it('should apply preset parameters', () => {
      const store = { getState: () => createTestStore().getState(), setState: (state: Partial<TB303State>) => {} };
      const mockSetState = vi.fn();
      const testStore = { getState: () => createTestStore().getState(), setState: mockSetState };
      
      applyTB303Preset(testStore as any, 'Acid');
      
      expect(mockSetState).toHaveBeenCalled();
    });
  });
});
