import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { Song, SongPattern, SongState, LoopRange, defaultSong, defaultSongState, MAX_PATTERNS, MAX_SONG_MEASURES } from '../types/songTypes';

interface SongActions {
  createSong: (name?: string) => Song;
  deleteSong: (songId: string) => void;
  setCurrentSong: (songId: string | null) => void;
  renameSong: (songId: string, newName: string) => void;
  addPatternToSong: (songId: string, pattern: SongPattern) => void;
  removePatternFromSong: (songId: string, patternId: string) => void;
  reorderPatterns: (songId: string, oldIndex: number, newIndex: number) => void;
  updatePatternInSong: (songId: string, patternId: string, updates: Partial<SongPattern>) => void;
  setLoopRange: (songId: string, loop: LoopRange) => void;
  playSong: (songId: string) => void;
  stopSong: (songId: string) => void;
  setCurrentPatternIndex: (songId: string, index: number) => void;
  nextPattern: (songId: string) => void;
  previousPattern: (songId: string) => void;
  startRecording: () => void;
  stopRecording: () => void;
  getSongById: (songId: string) => Song | undefined;
  getCurrentSong: () => Song | undefined;
  getTotalMeasures: (songId: string) => number;
  canAddPattern: (songId: string) => boolean;
}

type SongStore = SongState & SongActions;

const useSongStore = create<SongStore>()(
  devtools(
    persist(
      (set, get) => ({
        ...defaultSongState,
        createSong: (name = 'Untitled Song') => {
          const newSong: Song = { ...defaultSong, id: crypto.randomUUID(), name };
          set((state) => ({ songs: [...state.songs, newSong], currentSongId: newSong.id }));
          return newSong;
        },
        deleteSong: (songId) => {
          set((state) => ({
            songs: state.songs.filter((s) => s.id !== songId),
            currentSongId: state.currentSongId === songId ? null : state.currentSongId,
          }));
        },
        setCurrentSong: (songId) => { set({ currentSongId: songId }); },
        renameSong: (songId, newName) => {
          set((state) => ({
            songs: state.songs.map((s) => s.id === songId ? { ...s, name: newName, updatedAt: new Date().toISOString() } : s),
          }));
        },
        addPatternToSong: (songId, pattern) => {
          set((state) => ({
            songs: state.songs.map((s) => {
              if (s.id !== songId) return s;
              const patternExists = s.patterns.some((p) => p.id === pattern.id);
              if (patternExists) return s;
              if (s.patterns.length >= MAX_PATTERNS) return s;
              const totalMeasures = s.patterns.reduce((sum, p) => sum + p.length, 0) + pattern.length;
              if (totalMeasures > MAX_SONG_MEASURES) return s;
              return { ...s, patterns: [...s.patterns, pattern], updatedAt: new Date().toISOString() };
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
              return { ...s, patterns: newPatterns, currentPatternIndex: newIndex, updatedAt: new Date().toISOString() };
            }),
          }));
        },
        updatePatternInSong: (songId, patternId, updates) => {
          set((state) => ({
            songs: state.songs.map((s) => {
              if (s.id !== songId) return s;
              return {
                ...s,
                patterns: s.patterns.map((p) => p.id === patternId ? { ...p, ...updates } : p),
                updatedAt: new Date().toISOString(),
              };
            }),
          }));
        },
        setLoopRange: (songId, loop) => {
          set((state) => ({
            songs: state.songs.map((s) => s.id === songId ? { ...s, loop, updatedAt: new Date().toISOString() } : s),
          }));
        },
        playSong: (songId) => {
          set((state) => ({
            songs: state.songs.map((s) => s.id === songId ? { ...s, isPlaying: true, currentPatternIndex: 0 } : s),
            currentSongId: songId,
          }));
        },
        stopSong: (songId) => {
          set((state) => ({
            songs: state.songs.map((s) => s.id === songId ? { ...s, isPlaying: false, currentPatternIndex: 0 } : s),
          }));
        },
        setCurrentPatternIndex: (songId, index) => {
          set((state) => ({
            songs: state.songs.map((s) => s.id === songId ? { ...s, currentPatternIndex: index } : s),
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
        startRecording: () => { set({ isRecording: true, recordingStartTime: Date.now() }); },
        stopRecording: () => { set({ isRecording: false, recordingStartTime: null }); },
        getSongById: (songId) => { const state = get(); return state.songs.find((s) => s.id === songId); },
        getCurrentSong: () => { const state = get(); return state.songs.find((s) => s.id === state.currentSongId); },
        getTotalMeasures: (songId) => { const song = get().songs.find((s) => s.id === songId); if (!song) return 0; return song.patterns.reduce((sum, p) => sum + p.length, 0); },
        canAddPattern: (songId) => { const song = get().songs.find((s) => s.id === songId); if (!song) return false; return song.patterns.length < MAX_PATTERNS; },
      }),
      { name: 'song-store', partialize: (state) => ({ songs: state.songs, currentSongId: state.currentSongId }), }
    ),
    { name: 'SongStore' }
  )
);

export default useSongStore;
