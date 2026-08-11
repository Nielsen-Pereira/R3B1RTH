/**
 * Audio Effects Configuration - Batch 1 Development
 * R3B-94: Audio Effects Routing & Completion
 * 
 * Default configurations and presets for audio effects
 */

import type { EffectConfig, EffectType } from '../types';

// ============================================
// Default Effect Configurations
// ============================================

/**
 * Default configuration for Distortion effect
 */
export const DEFAULT_DISTORTION_CONFIG: EffectConfig = {
  enabled: false,
  wetDryMix: 0.5,
  bypass: false,
  parameters: {
    drive: 0.5,
    tone: 0.5,
    output: 0.8,
  },
};

/**
 * Default configuration for PCF (Parametric Comb Filter) effect
 */
export const DEFAULT_PCF_CONFIG: EffectConfig = {
  enabled: false,
  wetDryMix: 0.5,
  bypass: false,
  parameters: {
    cutoff: 0.5,
    resonance: 0.5,
    feedback: 0.3,
    delay: 0.002,
  },
};

/**
 * Default configuration for Compressor effect
 */
export const DEFAULT_COMPRESSOR_CONFIG: EffectConfig = {
  enabled: false,
  wetDryMix: 1.0,
  bypass: false,
  parameters: {
    threshold: -20,
    ratio: 4,
    attack: 0.01,
    release: 0.1,
    knee: 5,
    makeupGain: 0,
  },
};

/**
 * Default configuration for Delay effect
 */
export const DEFAULT_DELAY_CONFIG: EffectConfig = {
  enabled: false,
  wetDryMix: 0.5,
  bypass: false,
  parameters: {
    time: 0.5,
    feedback: 0.3,
    cutoff: 0.8,
    pingPong: 0,
  },
};

// ============================================
// Effect Presets
// ============================================

/**
 * Presets for Distortion effect
 */
export const DISTORTION_PRESETS: Record<string, Partial<EffectConfig>> = {
  'Light': { parameters: { drive: 0.3, tone: 0.7, output: 0.9 } },
  'Medium': { parameters: { drive: 0.5, tone: 0.5, output: 0.8 } },
  'Heavy': { parameters: { drive: 0.8, tone: 0.3, output: 0.7 } },
  'Fuzz': { parameters: { drive: 0.9, tone: 0.2, output: 0.6 } },
  'Warm': { parameters: { drive: 0.4, tone: 0.8, output: 0.85 } },
};

/**
 * Presets for PCF effect
 */
export const PCF_PRESETS: Record<string, Partial<EffectConfig>> = {
  'Subtle': { parameters: { cutoff: 0.3, resonance: 0.2, feedback: 0.2, delay: 0.001 } },
  'Resonant': { parameters: { cutoff: 0.7, resonance: 0.8, feedback: 0.4, delay: 0.003 } },
  'Sweep': { parameters: { cutoff: 0.5, resonance: 0.5, feedback: 0.5, delay: 0.002 } },
  'Deep': { parameters: { cutoff: 0.2, resonance: 0.3, feedback: 0.6, delay: 0.004 } },
};

/**
 * Presets for Compressor effect
 */
export const COMPRESSOR_PRESETS: Record<string, Partial<EffectConfig>> = {
  'Gentle': { parameters: { threshold: -12, ratio: 2, attack: 0.05, release: 0.2, knee: 10 } },
  'Medium': { parameters: { threshold: -20, ratio: 4, attack: 0.01, release: 0.1, knee: 5 } },
  'Aggressive': { parameters: { threshold: -24, ratio: 8, attack: 0.001, release: 0.05, knee: 2 } },
  'Pumping': { parameters: { threshold: -18, ratio: 6, attack: 0.1, release: 0.01, knee: 3 } },
  'Transparent': { parameters: { threshold: -30, ratio: 1.5, attack: 0.005, release: 0.3, knee: 15 } },
};

/**
 * Presets for Delay effect
 */
export const DELAY_PRESETS: Record<string, Partial<EffectConfig>> = {
  'Slapback': { parameters: { time: 0.15, feedback: 0.2, cutoff: 0.9, pingPong: 0 } },
  'Echo': { parameters: { time: 0.5, feedback: 0.4, cutoff: 0.7, pingPong: 0 } },
  'Long': { parameters: { time: 1.0, feedback: 0.5, cutoff: 0.5, pingPong: 0 } },
  'Ping Pong': { parameters: { time: 0.3, feedback: 0.3, cutoff: 0.8, pingPong: 1 } },
  'Tape': { parameters: { time: 0.25, feedback: 0.6, cutoff: 0.6, pingPong: 0 } },
};

// ============================================
// Preset Management
// ============================================

/**
 * Get all presets for a specific effect type
 */
export const getPresetsForEffect = (effect: EffectType): Record<string, Partial<EffectConfig>> => {
  switch (effect) {
    case 'distortion':
      return DISTORTION_PRESETS;
    case 'pcf':
      return PCF_PRESETS;
    case 'compressor':
      return COMPRESSOR_PRESETS;
    case 'delay':
      return DELAY_PRESETS;
    default:
      return {};
  }
};

/**
 * Get default configuration for a specific effect type
 */
export const getDefaultConfigForEffect = (effect: EffectType): EffectConfig => {
  switch (effect) {
    case 'distortion':
      return DEFAULT_DISTORTION_CONFIG;
    case 'pcf':
      return DEFAULT_PCF_CONFIG;
    case 'compressor':
      return DEFAULT_COMPRESSOR_CONFIG;
    case 'delay':
      return DEFAULT_DELAY_CONFIG;
    default:
      return {
        enabled: false,
        wetDryMix: 0.5,
        bypass: false,
        parameters: {},
      };
  }
};

/**
 * Reset effect configuration to default
 */
export const resetEffectConfig = (effect: EffectType): EffectConfig => {
  return { ...getDefaultConfigForEffect(effect) };
};

// ============================================
// Effect Parameters Metadata
// ============================================

export type EffectParameter = {
  name: string;
  label: string;
  min: number;
  max: number;
  step: number;
  default: number;
  unit?: string;
};

export type EffectMetadata = {
  name: string;
  parameters: Record<string, EffectParameter>;
};

export const EFFECT_METADATA: Record<EffectType, EffectMetadata> = {
  distortion: {
    name: 'Distortion',
    parameters: {
      drive: { name: 'drive', label: 'Drive', min: 0, max: 1, step: 0.01, default: 0.5 },
      tone: { name: 'tone', label: 'Tone', min: 0, max: 1, step: 0.01, default: 0.5 },
      output: { name: 'output', label: 'Output', min: 0, max: 1, step: 0.01, default: 0.8 },
    },
  },
  pcf: {
    name: 'PCF (Comb Filter)',
    parameters: {
      cutoff: { name: 'cutoff', label: 'Cutoff', min: 0, max: 1, step: 0.01, default: 0.5 },
      resonance: { name: 'resonance', label: 'Resonance', min: 0, max: 1, step: 0.01, default: 0.5 },
      feedback: { name: 'feedback', label: 'Feedback', min: 0, max: 1, step: 0.01, default: 0.3 },
      delay: { name: 'delay', label: 'Delay', min: 0.001, max: 0.01, step: 0.001, default: 0.002, unit: 's' },
    },
  },
  compressor: {
    name: 'Compressor',
    parameters: {
      threshold: { name: 'threshold', label: 'Threshold', min: -60, max: 0, step: 1, default: -20, unit: 'dB' },
      ratio: { name: 'ratio', label: 'Ratio', min: 1, max: 20, step: 0.1, default: 4 },
      attack: { name: 'attack', label: 'Attack', min: 0.001, max: 1, step: 0.001, default: 0.01, unit: 's' },
      release: { name: 'release', label: 'Release', min: 0.001, max: 2, step: 0.001, default: 0.1, unit: 's' },
      knee: { name: 'knee', label: 'Knee', min: 0, max: 24, step: 1, default: 5, unit: 'dB' },
      makeupGain: { name: 'makeupGain', label: 'Makeup Gain', min: -20, max: 20, step: 0.1, default: 0, unit: 'dB' },
    },
  },
  delay: {
    name: 'Delay',
    parameters: {
      time: { name: 'time', label: 'Time', min: 0.01, max: 2, step: 0.01, default: 0.5, unit: 's' },
      feedback: { name: 'feedback', label: 'Feedback', min: 0, max: 1, step: 0.01, default: 0.3 },
      cutoff: { name: 'cutoff', label: 'Cutoff', min: 0, max: 1, step: 0.01, default: 0.8 },
      pingPong: { name: 'pingPong', label: 'Ping Pong', min: 0, max: 1, step: 1, default: 0 },
    },
  },
};

/**
 * Get parameter metadata for a specific effect
 */
export const getParameterMetadata = (effect: EffectType, param: string): EffectParameter | undefined => {
  return EFFECT_METADATA[effect]?.parameters[param];
};

/**
 * Get all parameter names for a specific effect
 */
export const getParameterNames = (effect: EffectType): string[] => {
  return Object.keys(EFFECT_METADATA[effect]?.parameters || {});
};
