// Song Mode Types for R3B1RTH
// Based on ReBirth RB-338 specifications

export interface SongPattern {
  id: string;
  section: '808' | '909' | '303-1' | '303-2';
  patternIndex: number;
  length: number;
  tempo: number;
}

export interface LoopRange {
  start: number;
  end: number;
  enabled: boolean;
}

export interface Song {
  id: string;
  name: string;
  patterns: SongPattern[];
  loop: LoopRange;
  currentPatternIndex: number;
  isPlaying: boolean;
  bpm: number;
  createdAt: string;
  updatedAt: string;
}

export interface SongState {
  songs: Song[];
  currentSongId: string | null;
  isRecording: boolean;
  recordingStartTime: number | null;
}

export const DEFAULT_BPM = 120;
export const MAX_PATTERNS = 96;
export const MAX_SONG_MEASURES = 896;

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
