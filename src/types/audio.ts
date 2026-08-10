export type TB303Instrument = 'TB303';
export type TR808Instrument = 'BD' | 'SD' | 'LT' | 'MT' | 'HT' | 'RS' | 'CP' | 'CB' | 'CY' | 'OH' | 'CH';
export type TR909Instrument = 'BD' | 'SD' | 'LT' | 'MT' | 'HT' | 'RS' | 'CP' | 'CH' | 'OH' | 'CC' | 'RC';
export type InstrumentType = TB303Instrument | TR808Instrument | TR909Instrument;
export type EffectType = 'distortion' | 'pcf' | 'compressor' | 'delay';

export interface PatternStep {
  active: boolean;
  note?: number;
  velocity?: number;
  accent?: boolean;
  slide?: boolean;
}

export interface Pattern {
  id: string;
  name: string;
  steps: PatternStep[];
  length: number;
}

export interface TB303Pattern extends Pattern {
  type: 'TB303';
  accent?: number[];
  slide?: number[];
}

export interface DrumPattern extends Pattern {
  type: 'drum';
  instrument: TR808Instrument | TR909Instrument;
}

export interface TB303Settings {
  filterCutoff: number;
  filterResonance: number;
  filterEnvelope: number;
  accent: number;
  slide: number;
  volume: number;
  pan: number;
}

export interface DrumSettings {
  decay: number;
  tone: number;
  volume: number;
  pan: number;
}

export interface EffectSettings {
  enabled: boolean;
  wet: number;
}

export interface DistortionSettings extends EffectSettings {
  drive: number;
}

export interface PCFSettings extends EffectSettings {
  delayTime: number;
  feedback: number;
}

export interface CompressorSettings extends EffectSettings {
  threshold: number;
  ratio: number;
  attack: number;
  release: number;
}

export interface DelaySettings extends EffectSettings {
  delayTime: number;
  feedback: number;
}

export interface TransportState {
  isPlaying: boolean;
  bpm: number;
  currentBeat: number;
  currentStep: number;
}

export interface GlobalSettings {
  bpm: number;
  swing: number;
  masterVolume: number;
}

export interface AudioStoreState {
  tb303Synths: TB303Settings[];
  tr808Drums: DrumSettings[];
  tr909Drums: DrumSettings[];
  distortion: DistortionSettings[];
  pcf: PCFSettings[];
  compressor: CompressorSettings[];
  delay: DelaySettings[];
  transport: TransportState;
  global: GlobalSettings;
}

export interface SequencerStoreState {
  tb303Patterns: TB303Pattern[][];
  tr808Patterns: DrumPattern[][];
  tr909Patterns: DrumPattern[][];
  tb303Settings: TB303Settings[];
  tr808Settings: DrumSettings[];
  tr909Settings: DrumSettings[];
  globalSettings: GlobalSettings;
  currentPattern: number;
}

export interface ClipboardPattern {
  type: 'TB303' | 'drum';
  pattern: Pattern;
  instrument?: TR808Instrument | TR909Instrument;
}

export interface ClipboardState {
  pattern: ClipboardPattern | null;
}

export interface TapRecordingNote {
  note: number;
  time: number;
  velocity: number;
  instrument?: TR808Instrument | TR909Instrument;
}

export interface TapRecordingState {
  isRecording: boolean;
  recordedNotes: TapRecordingNote[];
  currentOctave: number;
  currentInstrument?: TR808Instrument | TR909Instrument;
}

export interface AudioResource {
  id: string;
  node: AudioNode;
  type: 'oscillator' | 'filter' | 'gain' | 'effect';
}

export type ExportFormat = 'wav' | 'aiff' | 'mp3';

export interface ExportSettings {
  format: ExportFormat;
  sampleRate: number;
  bitDepth: number;
  quality: number;
  includeEffects: boolean;
  normalize: boolean;
  bpm: number;
  startPattern: number;
  endPattern: number;
}