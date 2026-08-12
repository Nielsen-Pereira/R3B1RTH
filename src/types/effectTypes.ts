// Effect Types for R3B1RTH
// Based on ReBirth RB-338 specifications

export type EffectType = 'distortion' | 'pcf' | 'compressor' | 'delay';
export type InstrumentType = 'tb303' | 'tr808' | 'tr909' | 'master';

export interface EffectConfig {
  enabled: boolean;
  wetDryMix: number;
  parameters: Record<string, number>;
}

export interface EffectRouting {
  insert: EffectType[];
  send: EffectType[];
}