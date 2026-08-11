/**
 * Song Store Tests - Batch 1 Development
 * R3B-90 to R3B-94: Song Mode Implementation
 * 
 * Vitest tests for songStore functionality
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { create } from 'zustand';
import { useSongStore, SongState, getCurrentSong, isRecording, isPlaying } from '../stores/songStore';

// Create a test version of the store
const createTestStore = (initialState?: Partial<SongState>) => {
  const store = create<SongState>((set) => ({
    songs: [{
      id: 'test-song',
      name: 'Test Song',
      tempo: 120,
      patterns: [],
      isRecording: false,
      isPlaying: false,
      currentPosition: 0,
    }],
    currentSongId: 'test-song',
    automation: {},
    isRecordingAutomation: false,
    ...initialState,

    addSong: (song) => set((state) => ({
      songs: [...state.songs, { ...song, id: Date.now().toString() }],
    })),
    deleteSong: (id) => set((state) => ({
      songs: state.songs.filter((s) => s.id !== id),
      currentSongId: state.currentSongId === id ? null : state.currentSongId,
    })),
    updateSong: (id, updates) => set((state) => ({
      songs: state.songs.map((s) => (s.id === id ? { ...s, ...updates } : s)),
    })),
    setCurrentSong: (id) => set({ currentSongId: id }),
    startRecording: () => set((state) => ({
      songs: state.songs.map((s) =>
        s.id === state.currentSongId ? { ...s, isRecording: true } : s
      ),
    })),
    stopRecording: () => set((state) => ({
      songs: state.songs.map((s) =>
        s.id === state.currentSongId ? { ...s, isRecording: false } : s
      ),
    })),
    startPlayback: () => set((state) => ({
      songs: state.songs.map((s) =>
        s.id === state.currentSongId ? { ...s, isPlaying: true } : s
      ),
    })),
    stopPlayback: () => set((state) => ({
      songs: state.songs.map((s) =>
        s.id === state.currentSongId ? { ...s, isPlaying: false, currentPosition: 0 } : s
      ),
    })),
    recordAutomation: (controlId, value) => set((state) => ({
      automation: {
        ...state.automation,
        [controlId]: [...(state.automation[controlId] || []), value],
      },
    })),
    clearAutomation: (controlId) => set((state) => ({
      automation: { ...state.automation, [controlId]: [] },
    })),
  }));
  return store;
};

describe('songStore', () => {
  describe('initial state', () => {
    it('should have default song', () => {
      const store = createTestStore();
      const state = store.getState();
      expect(state.songs.length).toBe(1);
      expect(state.currentSongId).toBe('test-song');
    });

    it('should have empty automation initially', () => {
      const store = createTestStore();
      const state = store.getState();
      expect(state.automation).toEqual({});
    });
  });

  describe('addSong', () => {
    it('should add a new song to the store', () => {
      const store = createTestStore();
      const newSong = {
        name: 'New Song',
        tempo: 140,
        patterns: [],
        isRecording: false,
        isPlaying: false,
        currentPosition: 0,
      };

      store.getState().addSong(newSong);
      const state = store.getState();
      expect(state.songs.length).toBe(2);
      expect(state.songs[1].name).toBe('New Song');
      expect(state.songs[1].tempo).toBe(140);
    });
  });

  describe('deleteSong', () => {
    it('should remove a song from the store', () => {
      const store = createTestStore();
      store.getState().addSong({
        name: 'Song to delete',
        tempo: 100,
        patterns: [],
        isRecording: false,
        isPlaying: false,
        currentPosition: 0,
      });

      const stateBefore = store.getState();
      const songIdToDelete = stateBefore.songs[1].id;
      store.getState().deleteSong(songIdToDelete);

      const stateAfter = store.getState();
      expect(stateAfter.songs.length).toBe(1);
      expect(stateAfter.songs[0].name).toBe('Test Song');
    });

    it('should reset currentSongId if deleted song was current', () => {
      const store = createTestStore({ currentSongId: 'test-song' });
      store.getState().deleteSong('test-song');
      const state = store.getState();
      expect(state.currentSongId).toBeNull();
    });
  });

  describe('setCurrentSong', () => {
    it('should change the current song', () => {
      const store = createTestStore();
      store.getState().addSong({
        name: 'Second Song',
        tempo: 100,
        patterns: [],
        isRecording: false,
        isPlaying: false,
        currentPosition: 0,
      });

      const stateBefore = store.getState();
      const secondSongId = stateBefore.songs[1].id;
      store.getState().setCurrentSong(secondSongId);

      const stateAfter = store.getState();
      expect(stateAfter.currentSongId).toBe(secondSongId);
    });
  });

  describe('recording controls', () => {
    it('should start recording for current song', () => {
      const store = createTestStore();
      store.getState().startRecording();
      const state = store.getState();
      expect(state.songs[0].isRecording).toBe(true);
    });

    it('should stop recording for current song', () => {
      const store = createTestStore();
      store.getState().startRecording();
      store.getState().stopRecording();
      const state = store.getState();
      expect(state.songs[0].isRecording).toBe(false);
    });
  });

  describe('playback controls', () => {
    it('should start playback for current song', () => {
      const store = createTestStore();
      store.getState().startPlayback();
      const state = store.getState();
      expect(state.songs[0].isPlaying).toBe(true);
    });

    it('should stop playback and reset position', () => {
      const store = createTestStore();
      store.getState().startPlayback();
      store.getState().updateSong('test-song', { currentPosition: 100 });
      store.getState().stopPlayback();
      const state = store.getState();
      expect(state.songs[0].isPlaying).toBe(false);
      expect(state.songs[0].currentPosition).toBe(0);
    });
  });

  describe('automation', () => {
    it('should record automation values', () => {
      const store = createTestStore();
      store.getState().recordAutomation('tb303_cutoff', 0.5);
      store.getState().recordAutomation('tb303_cutoff', 0.7);
      const state = store.getState();
      expect(state.automation['tb303_cutoff']).toEqual([0.5, 0.7]);
    });

    it('should clear automation for a control', () => {
      const store = createTestStore();
      store.getState().recordAutomation('tb303_cutoff', 0.5);
      store.getState().clearAutomation('tb303_cutoff');
      const state = store.getState();
      expect(state.automation['tb303_cutoff']).toEqual([]);
    });
  });
});

describe('selectors', () => {
  describe('getCurrentSong', () => {
    it('should return the current song', () => {
      const store = createTestStore();
      const state = store.getState();
      const currentSong = getCurrentSong(state);
      expect(currentSong?.name).toBe('Test Song');
    });

    it('should return null if no current song', () => {
      const store = createTestStore({ currentSongId: null });
      const state = store.getState();
      const currentSong = getCurrentSong(state);
      expect(currentSong).toBeNull();
    });
  });

  describe('isRecording', () => {
    it('should return true if current song is recording', () => {
      const store = createTestStore();
      store.getState().startRecording();
      const state = store.getState();
      expect(isRecording(state)).toBe(true);
    });

    it('should return false if current song is not recording', () => {
      const store = createTestStore();
      const state = store.getState();
      expect(isRecording(state)).toBe(false);
    });
  });

  describe('isPlaying', () => {
    it('should return true if current song is playing', () => {
      const store = createTestStore();
      store.getState().startPlayback();
      const state = store.getState();
      expect(isPlaying(state)).toBe(true);
    });

    it('should return false if current song is not playing', () => {
      const store = createTestStore();
      const state = store.getState();
      expect(isPlaying(state)).toBe(false);
    });
  });
});
