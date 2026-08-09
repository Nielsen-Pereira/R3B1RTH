// Mixer types for R3B1RTH

import { SectionType } from './audio';

export interface MixerChannel {
  section: SectionType;
  volume: number;
  pan: number;
  mute: boolean;
  solo: boolean;
  delaySend: number;
  distortion: boolean;
  compressor: boolean;
  pcf: boolean;
}

export interface MixerState {
  channels: Record<SectionType, MixerChannel>;
  masterVolume: number;
  masterCompressor: boolean;
}

export interface MixerActions {
  setChannelVolume: (section: SectionType, volume: number) => void;
  setChannelPan: (section: SectionType, pan: number) => void;
  setChannelMute: (section: SectionType, mute: boolean) => void;
  setChannelSolo: (section: SectionType, solo: boolean) => void;
  setChannelDelaySend: (section: SectionType, send: number) => void;
  setChannelDistortion: (section: SectionType, enabled: boolean) => void;
  setChannelCompressor: (section: SectionType, enabled: boolean) => void;
  setChannelPCF: (section: SectionType, enabled: boolean) => void;
  setMasterVolume: (volume: number) => void;
  setMasterCompressor: (enabled: boolean) => void;
  resetChannel: (section: SectionType) => void;
  resetMixer: () => void;
}

export type MixerStore = MixerState & MixerActions;
