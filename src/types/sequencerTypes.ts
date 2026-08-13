// Advanced Sequencer Types for R3B1RTH
// Based on ReBirth RB-338 specifications

export type ShiftDirection = 'left' | 'right';
export type ShiftAmount = number; // 1-15

export interface ShiftOptions {
  direction: ShiftDirection;
  amount: ShiftAmount;
  wrap: boolean;
}

export interface RandomizeOptions {
  probability: number;
  includeNotes: boolean;
  includeAccents: boolean;
  includeSlides: boolean;
  includeVelocity: boolean;
}

export interface AccentOptions {
  accentLevel: number;
  accentAffectsCutoff: boolean;
  accentAffectsVolume: boolean;
  accentVolumeBoost: number;
}

export interface SequencerAdvancedFeatures {
  shiftEnabled: boolean;
  randomEnabled: boolean;
  accentEnabled: boolean;
  shiftAmount: number;
  shiftDirection: ShiftDirection;
  randomProbability: number;
  accentLevel: number;
}

export const DEFAULT_SHIFT_OPTIONS: ShiftOptions = {
  direction: 'right',
  amount: 1,
  wrap: true,
};

export const DEFAULT_RANDOMIZE_OPTIONS: RandomizeOptions = {
  probability: 0.5,
  includeNotes: true,
  includeAccents: true,
  includeSlides: true,
  includeVelocity: true,
};

export const DEFAULT_ACCENT_OPTIONS: AccentOptions = {
  accentLevel: 0.5,
  accentAffectsCutoff: true,
  accentAffectsVolume: true,
  accentVolumeBoost: 0.3,
};

export const DEFAULT_SEQUENCER_ADVANCED: SequencerAdvancedFeatures = {
  shiftEnabled: false,
  randomEnabled: false,
  accentEnabled: false,
  shiftAmount: 0,
  shiftDirection: 'right',
  randomProbability: 0.5,
  accentLevel: 0.5,
};