export type SectionType = '303_1' | '303_2' | '808' | '909';

export interface PatternStep {
  note?: string;
  instrument?: string;
  accent?: boolean;
  slide?: boolean;
  down?: boolean;
  up?: boolean;
}

export interface Pattern {
  steps: PatternStep[];
  name?: string;
}

export interface SequencerState {
  currentStep: number;
  isPlaying: boolean;
  tempo: number;
  patterns: Record<SectionType, Pattern[]>;
  currentPattern: Record<SectionType, number>;
  patternLength: Record<SectionType, number>;
}

export interface DistortionSettings { amount: number; shape: number; enabled: boolean; }
export interface PCFSettings { pattern: number; mode: 'LP' | 'BP'; cutoff: number; resonance: number; amount: number; enabled: boolean; }
export interface CompressorSettings { threshold: number; ratio: number; attack: number; release: number; gain: number; enabled: boolean; }
export interface DelaySettings { steps: number; feedback: number; pan: number; amount: number; enabled: boolean; }

export interface EffectsSettings {
  distortion: DistortionSettings;
  pcf: PCFSettings;
  compressor: CompressorSettings;
  delay: DelaySettings;
}

export interface AudioState {
  audioContext: AudioContext | null;
  isAudioReady: boolean;
  masterVolume: number;
  effects: EffectsSettings;
}

export type DrumInstrument = 'BD' | 'SD' | 'LT' | 'MT' | 'HT' | 'RS' | 'CP' | 'CH' | 'OH' | 'CC' | 'RC';

export type NoteName = 'C1' | 'C#1' | 'D1' | 'D#1' | 'E1' | 'F1' | 'F#1' | 'G1' | 'G#1' | 'A1' | 'A#1' | 'B1' | 'C2' | 'C#2' | 'D2' | 'D#2' | 'E2' | 'F2' | 'F#2' | 'G2' | 'G#2' | 'A2' | 'A#2' | 'B2' | 'C3' | 'C#3' | 'D3' | 'D#3' | 'E3' | 'F3' | 'F#3' | 'G3' | 'G#3' | 'A3' | 'A#3' | 'B3' | 'C4' | 'C#4';

export const NOTE_FREQUENCIES: Record<NoteName, number> = {
  'C1': 32.70, 'C#1': 34.65, 'D1': 36.71, 'D#1': 38.89, 'E1': 41.20, 'F1': 43.65,
  'F#1': 46.25, 'G1': 49.00, 'G#1': 51.91, 'A1': 55.00, 'A#1': 58.27, 'B1': 61.74,
  'C2': 65.41, 'C#2': 69.30, 'D2': 73.42, 'D#2': 77.78, 'E2': 82.41, 'F2': 87.31,
  'F#2': 92.50, 'G2': 98.00, 'G#2': 103.83, 'A2': 110.00, 'A#2': 116.54, 'B2': 123.47,
  'C3': 130.81, 'C#3': 138.59, 'D3': 146.83, 'D#3': 155.56, 'E3': 164.81, 'F3': 174.61,
  'F#3': 185.00, 'G3': 196.00, 'G#3': 207.65, 'A3': 220.00, 'A#3': 233.08, 'B3': 246.94,
  'C4': 261.63, 'C#4': 277.18
};
