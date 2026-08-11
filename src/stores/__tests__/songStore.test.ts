import { describe, it, expect, beforeEach } from 'vitest';
import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { Song, SongPattern, defaultSong, defaultSongState } from '../../types/songTypes';

const createTestSongStore = () => {
  return create<{
    songs: Song[];
    currentSongId: string | null;
    createSong: (name?: string) => Song;
    deleteSong: (songId: string) => void;
    setCurrentSong: (songId: string | null) => void;
    renameSong: (songId: string, newName: string) => void;
    addPatternToSong: (songId: string, pattern: SongPattern) => void;
    removePatternFromSong: (songId: string, patternId: string) => void;
    reorderPatterns: (songId: string, oldIndex: number, newIndex: number) => void;
    updatePatternInSong: (songId: string, patternId: string, updates: Partial<SongPattern>) => void;
    setLoopRange: (songId: string, loop: { start: number; end: number; enabled: boolean }) => void;
    playSong: (songId: string) => void;
    stopSong: (songId: string) => void;
    setCurrentPatternIndex: (songId: string, index: number) => void;
    nextPattern: (songId: string) => void;
    previousPattern: (songId: string) => void;
    getSongById: (songId: string) => Song | undefined;
    getCurrentSong: () => Song | undefined;
    getTotalMeasures: (songId: string) => number;
    canAddPattern: (songId: string) => boolean;
  }>()(
    (set, get) => ({
      ...defaultSongState,
      createSong: (name = 'Untitled Song') => {
        const newSong: Song = {
          ...defaultSong,
          id: crypto.randomUUID(),
          name,
        };
        set((state) => ({
          songs: [...state.songs, newSong],
          currentSongId: newSong.id,
        }));
        return newSong;
      },
      deleteSong: (songId) => {
        set((state) => ({
          songs: state.songs.filter((s) => s.id !== songId),
          currentSongId: state.currentSongId === songId ? null : state.currentSongId,
        }));
      },
      setCurrentSong: (songId) => {
        set({ currentSongId: songId });
      },
      renameSong: (songId, newName) => {
        set((state) => ({
          songs: state.songs.map((s) =>
            s.id === songId ? { ...s, name: newName, updatedAt: new Date().toISOString() } : s
          ),
        }));
      },
      addPatternToSong: (songId, pattern) => {
        set((state) => ({
          songs: state.songs.map((s) => {
            if (s.id !== songId) return s;
            const patternExists = s.patterns.some((p) => p.id === pattern.id);
            if (patternExists) return s;
            if (s.patterns.length >= 96) return s;
            const totalMeasures = s.patterns.reduce((sum, p) => sum + p.length, 0) + pattern.length;
            if (totalMeasures > 896) return s;
            return {
              ...s,
              patterns: [...s.patterns, pattern],
              updatedAt: new Date().toISOString(),
            };
          }),
        }));
      },
      removePatternFromSong: (songId, patternId) => {
        set((state) => ({
          songs: state.songs.map((s) => {
            if (s.id !== songId) return s;
            return {
              ...s,
              patterns: s.patterns.filter((p) => p.id !== patternId),
              currentPatternIndex: Math.min(s.currentPatternIndex, s.patterns.length - 2),
              updatedAt: new Date().toISOString(),
            };
          }),
        }));
      },
      reorderPatterns: (songId, oldIndex, newIndex) => {
        set((state) => ({
          songs: state.songs.map((s) => {
            if (s.id !== songId) return s;
            const newPatterns = [...s.patterns];
            const [removed] = newPatterns.splice(oldIndex, 1);
            newPatterns.splice(newIndex, 0, removed);
            return {
              ...s,
              patterns: newPatterns,
              currentPatternIndex: newIndex,
              updatedAt: new Date().toISOString(),
            };
          }),
        }));
      },
      updatePatternInSong: (songId, patternId, updates) => {
        set((state) => ({
          songs: state.songs.map((s) => {
            if (s.id !== songId) return s;
            return {
              ...s,
              patterns: s.patterns.map((p) =>
                p.id === patternId ? { ...p, ...updates } : p
              ),
              updatedAt: new Date().toISOString(),
            };
          }),
        }));
      },
      setLoopRange: (songId, loop) => {
        set((state) => ({
          songs: state.songs.map((s) =>
            s.id === songId ? { ...s, loop, updatedAt: new Date().toISOString() } : s
          ),
        }));
      },
      playSong: (songId) => {
        set((state) => ({
          songs: state.songs.map((s) =>
            s.id === songId ? { ...s, isPlaying: true, currentPatternIndex: 0 } : s
          ),
          currentSongId: songId,
        }));
      },
      stopSong: (songId) => {
        set((state) => ({
          songs: state.songs.map((s) =>
            s.id === songId ? { ...s, isPlaying: false, currentPatternIndex: 0 } : s
          ),
        }));
      },
      setCurrentPatternIndex: (songId, index) => {
        set((state) => ({
          songs: state.songs.map((s) =>
            s.id === songId ? { ...s, currentPatternIndex: index } : s
          ),
        }));
      },
      nextPattern: (songId) => {
        set((state) => ({
          songs: state.songs.map((s) => {
            if (s.id !== songId) return s;
            if (s.currentPatternIndex >= s.patterns.length - 1) {
              if (s.loop.enabled && s.currentPatternIndex >= s.loop.start && s.currentPatternIndex < s.loop.end) {
                return { ...s, currentPatternIndex: s.loop.start };
              }
              return { ...s, isPlaying: false };
            }
            return { ...s, currentPatternIndex: s.currentPatternIndex + 1 };
          }),
        }));
      },
      previousPattern: (songId) => {
        set((state) => ({
          songs: state.songs.map((s) => {
            if (s.id !== songId) return s;
            const newIndex = Math.max(0, s.currentPatternIndex - 1);
            if (s.loop.enabled && newIndex < s.loop.start && s.currentPatternIndex === s.loop.start) {
              return { ...s, currentPatternIndex: s.loop.end };
            }
            return { ...s, currentPatternIndex: newIndex };
          }),
        }));
      },
      getSongById: (songId) => {
        const state = get();
        return state.songs.find((s) => s.id === songId);
      },
      getCurrentSong: () => {
        const state = get();
        return state.songs.find((s) => s.id === state.currentSongId);
      },
      getTotalMeasures: (songId) => {
        const song = get().songs.find((s) => s.id === songId);
        if (!song) return 0;
        return song.patterns.reduce((sum, p) => sum + p.length, 0);
      },
      canAddPattern: (songId) => {
        const song = get().songs.find((s) => s.id === songId);
        if (!song) return false;
        return song.patterns.length < 96;
      },
    })
  );
};

describe('SongStore', () => {
  let store: ReturnType<typeof createTestSongStore>;

  beforeEach(() => {
    store = createTestSongStore();
  });

  describe('Song Management', () => {
    it('should create a new song with default values', () => {
      const initialState = store.getState();
      expect(initialState.songs.length).toBe(0);
      const newSong = store.getState().createSong('Test Song');
      expect(newSong.name).toBe('Test Song');
      expect(newSong.patterns.length).toBe(0);
      expect(newSong.bpm).toBe(120);
      expect(newSong.isPlaying).toBe(false);
      expect(store.getState().songs.length).toBe(1);
      expect(store.getState().currentSongId).toBe(newSong.id);
    });

    it('should delete a song', () => {
      const song1 = store.getState().createSong('Song 1');
      const song2 = store.getState().createSong('Song 2');
      expect(store.getState().songs.length).toBe(2);
      store.getState().deleteSong(song1.id);
      expect(store.getState().songs.length).toBe(1);
      expect(store.getState().songs[0].id).toBe(song2.id);
      expect(store.getState().currentSongId).toBe(song2.id);
    });

    it('should set current song', () => {
      const song1 = store.getState().createSong('Song 1');
      const song2 = store.getState().createSong('Song 2');
      store.getState().setCurrentSong(song1.id);
      expect(store.getState().currentSongId).toBe(song1.id);
      store.getState().setCurrentSong(song2.id);
      expect(store.getState().currentSongId).toBe(song2.id);
    });

    it('should rename a song', () => {
      const song = store.getState().createSong('Original Name');
      store.getState().renameSong(song.id, 'New Name');
      const updatedSong = store.getState().getSongById(song.id);
      expect(updatedSong?.name).toBe('New Name');
    });
  });

  describe('Pattern Management', () => {
    let songId: string;

    beforeEach(() => {
      const song = store.getState().createSong('Test Song');
      songId = song.id;
    });

    it('should add a pattern to a song', () => {
      const pattern: SongPattern = {
        id: 'pattern-1',
        section: '808',
        patternIndex: 0,
        length: 16,
        tempo: 120,
      };
      store.getState().addPatternToSong(songId, pattern);
      const song = store.getState().getSongById(songId);
      expect(song?.patterns.length).toBe(1);
      expect(song?.patterns[0].id).toBe('pattern-1');
    });

    it('should not add duplicate pattern', () => {
      const pattern: SongPattern = {
        id: 'pattern-1',
        section: '808',
        patternIndex: 0,
        length: 16,
      };
      store.getState().addPatternToSong(songId, pattern);
      store.getState().addPatternToSong(songId, pattern);
      const song = store.getState().getSongById(songId);
      expect(song?.patterns.length).toBe(1);
    });

    it('should not exceed max patterns (96)', () => {
      for (let i = 0; i < 96; i++) {
        const pattern: SongPattern = {
          id: `pattern-${i}`,
          section: '808',
          patternIndex: 0,
          length: 1,
        };
        store.getState().addPatternToSong(songId, pattern);
      }
      const extraPattern: SongPattern = {
        id: 'pattern-97',
        section: '808',
        patternIndex: 0,
        length: 1,
      };
      store.getState().addPatternToSong(songId, extraPattern);
      const song = store.getState().getSongById(songId);
      expect(song?.patterns.length).toBe(96);
    });

    it('should not exceed max measures (896)', () => {
      for (let i = 0; i < 56; i++) {
        const pattern: SongPattern = {
          id: `pattern-${i}`,
          section: '808',
          patternIndex: 0,
          length: 16,
        };
        store.getState().addPatternToSong(songId, pattern);
      }
      const extraPattern: SongPattern = {
        id: 'pattern-extra',
        section: '808',
        patternIndex: 0,
        length: 16,
      };
      store.getState().addPatternToSong(songId, extraPattern);
      const song = store.getState().getSongById(songId);
      expect(song?.patterns.length).toBe(56);
    });

    it('should remove a pattern from a song', () => {
      const pattern1: SongPattern = {
        id: 'pattern-1',
        section: '808',
        patternIndex: 0,
        length: 16,
      };
      const pattern2: SongPattern = {
        id: 'pattern-2',
        section: '909',
        patternIndex: 1,
        length: 16,
      };
      store.getState().addPatternToSong(songId, pattern1);
      store.getState().addPatternToSong(songId, pattern2);
      expect(store.getState().getSongById(songId)?.patterns.length).toBe(2);
      store.getState().removePatternFromSong(songId, pattern1.id);
      const song = store.getState().getSongById(songId);
      expect(song?.patterns.length).toBe(1);
      expect(song?.patterns[0].id).toBe('pattern-2');
      expect(song?.currentPatternIndex).toBe(0);
    });

    it('should reorder patterns', () => {
      const pattern1: SongPattern = {
        id: 'pattern-1',
        section: '808',
        patternIndex: 0,
        length: 16,
      };
      const pattern2: SongPattern = {
        id: 'pattern-2',
        section: '909',
        patternIndex: 1,
        length: 16,
      };
      const pattern3: SongPattern = {
        id: 'pattern-3',
        section: '303-1',
        patternIndex: 2,
        length: 16,
      };
      store.getState().addPatternToSong(songId, pattern1);
      store.getState().addPatternToSong(songId, pattern2);
      store.getState().addPatternToSong(songId, pattern3);
      store.getState().reorderPatterns(songId, 1, 0);
      const song = store.getState().getSongById(songId);
      expect(song?.patterns[0].id).toBe('pattern-2');
      expect(song?.patterns[1].id).toBe('pattern-1');
      expect(song?.patterns[2].id).toBe('pattern-3');
      expect(song?.currentPatternIndex).toBe(0);
    });

    it('should update a pattern in a song', () => {
      const pattern: SongPattern = {
        id: 'pattern-1',
        section: '808',
        patternIndex: 0,
        length: 16,
      };
      store.getState().addPatternToSong(songId, pattern);
      store.getState().updatePatternInSong(songId, pattern.id, { length: 8 });
      const song = store.getState().getSongById(songId);
      expect(song?.patterns[0].length).toBe(8);
    });
  });

  describe('Loop Management', () => {
    let songId: string;

    beforeEach(() => {
      const song = store.getState().createSong('Test Song');
      songId = song.id;
    });

    it('should set loop range', () => {
      store.getState().setLoopRange(songId, { start: 2, end: 5, enabled: true });
      const song = store.getState().getSongById(songId);
      expect(song?.loop.start).toBe(2);
      expect(song?.loop.end).toBe(5);
      expect(song?.loop.enabled).toBe(true);
    });

    it('should disable loop', () => {
      store.getState().setLoopRange(songId, { start: 0, end: 0, enabled: false });
      const song = store.getState().getSongById(songId);
      expect(song?.loop.enabled).toBe(false);
    });
  });

  describe('Playback Control', () => {
    let songId: string;

    beforeEach(() => {
      const song = store.getState().createSong('Test Song');
      songId = song.id;
      for (let i = 0; i < 3; i++) {
        const pattern: SongPattern = {
          id: `pattern-${i}`,
          section: '808',
          patternIndex: i,
          length: 16,
        };
        store.getState().addPatternToSong(songId, pattern);
      }
    });

    it('should play a song', () => {
      store.getState().playSong(songId);
      const song = store.getState().getSongById(songId);
      expect(song?.isPlaying).toBe(true);
      expect(song?.currentPatternIndex).toBe(0);
      expect(store.getState().currentSongId).toBe(songId);
    });

    it('should stop a song', () => {
      store.getState().playSong(songId);
      store.getState().stopSong(songId);
      const song = store.getState().getSongById(songId);
      expect(song?.isPlaying).toBe(false);
      expect(song?.currentPatternIndex).toBe(0);
    });

    it('should move to next pattern', () => {
      store.getState().playSong(songId);
      expect(store.getState().getSongById(songId)?.currentPatternIndex).toBe(0);
      store.getState().nextPattern(songId);
      expect(store.getState().getSongById(songId)?.currentPatternIndex).toBe(1);
    });

    it('should stop at end of patterns', () => {
      store.getState().playSong(songId);
      store.getState().setCurrentPatternIndex(songId, 2);
      store.getState().nextPattern(songId);
      const song = store.getState().getSongById(songId);
      expect(song?.isPlaying).toBe(false);
    });

    it('should loop when enabled', () => {
      store.getState().setLoopRange(songId, { start: 1, end: 2, enabled: true });
      store.getState().playSong(songId);
      store.getState().setCurrentPatternIndex(songId, 2);
      store.getState().nextPattern(songId);
      const song = store.getState().getSongById(songId);
      expect(song?.currentPatternIndex).toBe(1);
      expect(song?.isPlaying).toBe(true);
    });

    it('should move to previous pattern', () => {
      store.getState().playSong(songId);
      store.getState().setCurrentPatternIndex(songId, 2);
      store.getState().previousPattern(songId);
      expect(store.getState().getSongById(songId)?.currentPatternIndex).toBe(1);
    });

    it('should loop backwards when at start', () => {
      store.getState().setLoopRange(songId, { start: 1, end: 2, enabled: true });
      store.getState().playSong(songId);
      store.getState().setCurrentPatternIndex(songId, 1);
      store.getState().previousPattern(songId);
      const song = store.getState().getSongById(songId);
      expect(song?.currentPatternIndex).toBe(2);
    });
  });

  describe('Utility Methods', () => {
    let songId: string;

    beforeEach(() => {
      const song = store.getState().createSong('Test Song');
      songId = song.id;
    });

    it('should get song by ID', () => {
      const song = store.getState().getSongById(songId);
      expect(song?.id).toBe(songId);
    });

    it('should get current song', () => {
      store.getState().setCurrentSong(songId);
      const song = store.getState().getCurrentSong();
      expect(song?.id).toBe(songId);
    });

    it('should calculate total measures', () => {
      const pattern1: SongPattern = {
        id: 'pattern-1',
        section: '808',
        patternIndex: 0,
        length: 16,
      };
      const pattern2: SongPattern = {
        id: 'pattern-2',
        section: '808',
        patternIndex: 1,
        length: 8,
      };
      store.getState().addPatternToSong(songId, pattern1);
      store.getState().addPatternToSong(songId, pattern2);
      const totalMeasures = store.getState().getTotalMeasures(songId);
      expect(totalMeasures).toBe(24);
    });

    it('should check if pattern can be added', () => {
      expect(store.getState().canAddPattern(songId)).toBe(true);
      for (let i = 0; i < 96; i++) {
        const pattern: SongPattern = {
          id: `pattern-${i}`,
          section: '808',
          patternIndex: 0,
          length: 1,
        };
        store.getState().addPatternToSong(songId, pattern);
      }
      expect(store.getState().canAddPattern(songId)).toBe(false);
    });
  });
});
