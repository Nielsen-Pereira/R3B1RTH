// Audio types for R3B1RTH

export type SectionType = '808' | '909' | '303_1' | '303_2';

export type TR808Instrument = 'BD' | 'SD' | 'LT' | 'MT' | 'HT' | 'RS' | 'CP' | 'CH' | 'OH' | 'CC' | 'RC';
export type TR909Instrument = TR808Instrument;

export interface RhythmStep {
  instrument: string | null;
  accent: boolean;
  flam: boolean;
}

export interface SynthStep {
  note: string | null;
  notePause: 'note' | 'pause' | 'rest';
  down: boolean;
  up: boolean;
  slide: boolean;
  accent: boolean;
}

export type Step = RhythmStep | SynthStep;

export interface Pattern {
  id: string;
  bank: number;
  index: number;
  length: number;
  name: string;
  steps: Step[];
}

export interface SongTrackEvent {
  time: number;
  patternBank: number;
  patternIndex: number;
}

export interface SongTrack {
  section: SectionType;
  events: SongTrackEvent[];
}

export interface Song {
  id: string;
  name: string;
  created: string;
  modified: string;
  tempo: number;
  shuffle: number;
  mode: 'pattern' | 'song';
  currentPattern: Record<SectionType, number>;
  tracks: SongTrack[];
  automation: any[];
  loopStart: number | null;
  loopEnd: number | null;
}

export interface TR808Params {
  BD: { level: number; tune: number; decay: number };
  SD: { level: number; tune: number; decay: number; tone: number; snap: number };
  LT: { level: number; tune: number; decay: number };
  MT: { level: number; tune: number; decay: number };
  HT: { level: number; tune: number; decay: number };
  RS: { level: number };
  CP: { level: number };
  CH: { level: number; decay: number };
  OH: { level: number; decay: number };
  CC: { level: number; tune: number };
  RC: { level: number; tune: number };
}

export interface TR909Params extends TR808Params {
  flam: number;
  BD: { level: number; tune: number; decay: number; attack: number };
  SD: { level: number; tune: number; decay: number; tone: number; snap: number; attack: number };
  LT: { level: number; tune: number; decay: number; attack: number };
  MT: { level: number; tune: number; decay: number; attack: number };
  HT: { level: number; tune: number; decay: number; attack: number };
}

export interface TB303Params {
  waveform: 'sawtooth' | 'square';
  tune: number;
  cutoff: number;
  resonance: number;
  envMod: number;
  decay: number;
  accent: number;
  vintage: boolean;
}

export type NoteName = 'C' | 'C#' | 'D' | 'D#' | 'E' | 'F' | 'F#' | 'G' | 'G#' | 'A' | 'A#' | 'B';
export type Octave = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7;
export type Note = `${NoteName}${Octave}`;

export interface PCFSettings { enabled: boolean; pattern: number; }
export interface DelaySettings { enabled: boolean; step: number; triplet: boolean; feedback: number; }
export interface DistortionSettings { enabled: boolean; amount: number; }
export interface CompressorSettings { enabled: boolean; threshold: number; ratio: number; }
export type Waveform = 'sine' | 'square' | 'sawtooth' | 'triangle' | 'noise';
export type FilterType = 'lowpass' | 'highpass' | 'bandpass' | 'notch';
