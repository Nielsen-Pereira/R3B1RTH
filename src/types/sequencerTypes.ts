// Advanced Sequencer Types for R3B1RTH
// Based on ReBirth RB-338 specifications

export type ShiftDirection = 'left' | 'right';
export type ShiftAmount = number; // 1-15

export interface ShiftOptions {
  direction: ShiftDirection;
  amount: ShiftAmount;
  wrap: boolean; // Whether to wrap around at pattern boundaries
}

export interface RandomizeOptions {
  probability: number; // 0-1, chance that each step will be randomized
  includeNotes: boolean; // Whether to randomize notes
  includeAccents: boolean; // Whether to randomize accents
  includeSlides: boolean; // Whether to randomize slides
  includeVelocity: boolean; // Whether to randomize velocity
}

export interface AccentOptions {
  // For TB-303
  accentLevel: number; // 0-1, amount of accent
  accentAffectsCutoff: boolean; // Whether accent affects filter cutoff
  accentAffectsVolume: boolean; // Whether accent affects volume
  
  // For drum machines
  accentVolumeBoost: number; // 0-1, additional volume for accented hits
}

export interface SequencerAdvancedFeatures {
  shiftEnabled: boolean;
  randomEnabled: boolean;
  accentEnabled: boolean;
  
  shiftAmount: number; // Current shift amount (0-15)
  shiftDirection: ShiftDirection;
  
  randomProbability: number; // Current random probability (0-1)
  
  accentLevel: number; // Current accent level (0-1)
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