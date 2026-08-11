/**
 * Song Mode Store - Batch 1 Development
 * R3B-90 to R3B-93: Song Mode Implementation
 * R3B-94: Audio Effects Routing
 * 
 * Type-safe Zustand store for Song Mode functionality
 */

import { create } from 'zustand';

// Types
export type Pattern = {
  id: string;
  name: string;
  steps: boolean[];
  length: number;
  swing: number;
};

export type SongPattern = {
  patternId: string;
  position: number;
};

export type Song = {
  id: string;
  name: string;
  tempo: number;
  patterns: SongPattern[];
  isRecording: boolean;
  isPlaying: boolean;
  currentPosition: number;
};

export type SongState = {
  songs: Song[];
  currentSongId: string | null;
  automation: Record<string, number[]>;
  isRecordingAutomation: boolean;
  
  // Actions
  addSong: (song: Omit<Song, 'id'>) => void;
  deleteSong: (id: string) => void;
  updateSong: (id: string, updates: Partial<Song>) => void;
  setCurrentSong: (id: string) => void;
  
  startRecording: () => void;
  stopRecording: () => void;
  startPlayback: () => void;
  stopPlayback: () => void;
  
  recordAutomation: (controlId: string, value: number) => void;
  clearAutomation: (controlId: string) => void;
};

// Initial state
const initialSong: Song = {
  id: 'default',
  name: 'Untitled Song',
  tempo: 120,
  patterns: [],
  isRecording: false,
  isPlaying: false,
  currentPosition: 0,
};

// Store
export const useSongStore = create<SongState>((set) => ({
  songs: [initialSong],
  currentSongId: 'default',
  automation: {},
  isRecordingAutomation: false,

  addSong: (song) => set((state) => ({
    songs: [...state.songs, { ...song, id: Date.now().toString() }],
  })),

  deleteSong: (id) => set((state) => ({
    songs: state.songs.filter((s) => s.id !== id),
    currentSongId: state.currentSongId === id ? null : state.currentSongId,
  })),

  updateSong: (id, updates) => set((state) => ({
    songs: state.songs.map((s) =>
      s.id === id ? { ...s, ...updates } : s
    ),
  })),

  setCurrentSong: (id) => set({ currentSongId: id }),

  startRecording: () => set((state) => {
    const currentSong = state.songs.find((s) => s.id === state.currentSongId);
    if (currentSong) {
      return {
        songs: state.songs.map((s) =>
          s.id === state.currentSongId
            ? { ...s, isRecording: true }
            : s
        ),
      };
    }
    return state;
  }),

  stopRecording: () => set((state) => ({
    songs: state.songs.map((s) =>
      s.id === state.currentSongId
        ? { ...s, isRecording: false }
        : s
    ),
  })),

  startPlayback: () => set((state) => ({
    songs: state.songs.map((s) =>
      s.id === state.currentSongId
        ? { ...s, isPlaying: true }
        : s
    ),
  })),

  stopPlayback: () => set((state) => ({
    songs: state.songs.map((s) =>
      s.id === state.currentSongId
        ? { ...s, isPlaying: false, currentPosition: 0 }
        : s
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

// Selectors
export const getCurrentSong = (state: SongState): Song | null =>
  state.songs.find((s) => s.id === state.currentSongId) || null;

export const getSongPatterns = (state: SongState): SongPattern[] =>
  getCurrentSong(state)?.patterns || [];

export const isRecording = (state: SongState): boolean =>
  getCurrentSong(state)?.isRecording || false;

export const isPlaying = (state: SongState): boolean =>
  getCurrentSong(state)?.isPlaying || false;
