/**
 * Shared Types - Batch 1 Development
 * R3B-90 to R3B-94: Song Mode & Audio Effects
 * 
 * Centralized type definitions for the application
 */

// ============================================
// Instrument Types
// ============================================

export type InstrumentType = 'tb303' | 'tr808' | 'tr909';

export type InstrumentSection = {
  id: InstrumentType;
  name: string;
  volume: number;
  mute: boolean;
  solo: boolean;
};

// ============================================
// Pattern Types
// ============================================

export type PatternStep = {
  id: number;
  active: boolean;
  accent: boolean;
  slide: boolean;
  value: number;
};

export type Pattern = {
  id: string;
  name: string;
  instrument: InstrumentType;
  steps: PatternStep[];
  length: number;
  swing: number;
  shuffle: number;
};

// ============================================
// Song Mode Types
// ============================================

export type SongPatternEntry = {
  patternId: string;
  instrument: InstrumentType;
  position: number;
  length: number;
};

export type Song = {
  id: string;
  name: string;
  tempo: number;
  signature: string;
  patterns: SongPatternEntry[];
  automation: AutomationData;
  isRecording: boolean;
  isPlaying: boolean;
  currentPosition: number;
  loopStart: number;
  loopEnd: number;
};

// ============================================
// Automation Types
// ============================================

export type ControlId = 
  | 'tb303_cutoff'
  | 'tb303_resonance'
  | 'tb303_envMod'
  | 'tb303_decay'
  | 'tb303_accent'
  | 'tb303_waveform'
  | 'tr808_volume'
  | 'tr808_tune'
  | 'tr808_attack'
  | 'tr808_decay'
  | 'tr808_pan'
  | 'tr909_volume'
  | 'tr909_tune'
  | 'tr909_attack'
  | 'tr909_decay'
  | 'tr909_pan'
  | 'master_volume'
  | 'tempo'
  | 'swing';

export type AutomationPoint = {
  timestamp: number;
  value: number;
};

export type AutomationData = Record<ControlId, AutomationPoint[]>;

// ============================================
// Audio Effects Types
// ============================================

export type EffectType = 'distortion' | 'pcf' | 'compressor' | 'delay';

export type EffectConfig = {
  enabled: boolean;
  wetDryMix: number;
  bypass: boolean;
  parameters: Record<string, number>;
};

export type EffectRoutingType = 'insert' | 'send' | 'none';

export type EffectRouting = {
  insert: EffectType[];
  send: EffectType[];
};

export type RoutingMatrix = Record<InstrumentType | 'master', EffectRouting>;

// ============================================
// UI Types
// ============================================

export type KnobValue = number;
export type ButtonState = boolean;
export type SliderValue = number;
export type DisplayValue = string | number;

// ============================================
// Audio Engine Types
// ============================================

export type AudioNodeType = 
  | 'tb303'
  | 'tr808'
  | 'tr909'
  | 'distortion'
  | 'pcf'
  | 'compressor'
  | 'delay'
  | 'master';

export type AudioGraph = Map<AudioNodeType, AudioNodeType[]>;
