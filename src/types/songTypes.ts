// Song Mode Types for R3B1RTH
// Based on ReBirth RB-338 specifications

export interface SongPattern {
  id: string; // Unique identifier (e.g., "808-A1", "303-B2")
  section: '808' | '909' | '303-1' | '303-2';
  patternIndex: number; // 0-31 (A1-D8)
  length: number; // 1-16 steps
  tempo: number; // BPM (optional override)
}

export interface LoopRange {
  start: number; // Pattern index
  end: number; // Pattern index
  enabled: boolean;
}

export interface Song {
  id: string;
  name: string;
  patterns: SongPattern[]; // Ordered list of patterns
  loop: LoopRange;
  currentPatternIndex: number; // For playback tracking
  isPlaying: boolean;
  bpm: number; // Global BPM (default: 120)
  createdAt: string;
  updatedAt: string;
}

export interface SongState {
  songs: Song[];
  currentSongId: string | null;
  isRecording: boolean;
  recordingStartTime: number | null;
}

// Default values
export const DEFAULT_BPM = 120;
export const MAX_PATTERNS = 96; // ReBirth limit
export const MAX_SONG_MEASURES = 896; // 96 patterns * 16 steps * 6 measures per pattern

export const defaultSong: Song = {
  id: crypto.randomUUID(),
  name: 'Untitled Song',
  patterns: [],
  loop: { start: 0, end: 0, enabled: false },
  currentPatternIndex: 0,
  isPlaying: false,
  bpm: DEFAULT_BPM,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

export const defaultSongState: SongState = {
  songs: [],
  currentSongId: null,
  isRecording: false,
  recordingStartTime: null,
};
