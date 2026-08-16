/**
 * MIDI Types - Batch 9
 * Type definitions for MIDI integration
 */

export interface MidiMessage {
  type: 'noteOn' | 'noteOff' | 'controlChange' | 'programChange' | 'pitchBend';
  channel: number; // 0-15
  note?: number; // 0-127 for note messages
  velocity?: number; // 0-127
  value?: number; // 0-127 for control change
  program?: number; // 0-127 for program change
  bend?: number; // 0-16383 for pitch bend
  timestamp: number;
}

export interface MidiDevice {
  id: string;
  name: string;
  type: 'input' | 'output' | 'both';
  manufacturer: string;
  state: 'connected' | 'disconnected';
  onMidiMessage?: (message: MidiMessage) => void;
}

export interface MidiMapping {
  id: string;
  deviceId: string;
  channel: number;
  target: string; // e.g., 'tb303-1', 'tr808-1'
  parameter: string; // e.g., 'note', 'velocity', 'modulation'
  min: number;
  max: number;
}

export interface MidiState {
  devices: MidiDevice[];
  mappings: MidiMapping[];
  isMidiEnabled: boolean;
  activeInputDevice: string | null;
  activeOutputDevice: string | null;
  midiClockEnabled: boolean;
  midiSyncEnabled: boolean;
}

export interface MidiConfig {
  inputDevice: string | null;
  outputDevice: string | null;
  channelMapping: Record<string, number>; // device -> MIDI channel
  ccMapping: Record<string, string>; // CC number -> parameter
}

export const DEFAULT_MIDI_CONFIG: MidiConfig = {
  inputDevice: null,
  outputDevice: null,
  channelMapping: {
    'tb303-1': 0,
    'tb303-2': 1,
    'tr808': 9,
    'tr909': 10,
  },
  ccMapping: {
    '1': 'modulation',
    '7': 'volume',
    '64': 'sustain',
    '121': 'resetAllControllers',
  },
};

export const MIDI_CHANNELS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15] as const;

export type MidiChannel = typeof MIDI_CHANNELS[number];

export const MIDI_CC = {
  BANK_SELECT: 0,
  MODULATION: 1,
  BREATH: 2,
  FOOT_CONTROLLER: 4,
  PORTAMENTO_TIME: 5,
  DATA_ENTRY: 6,
  VOLUME: 7,
  BALANCE: 8,
  PAN: 10,
  EXPRESSION: 11,
  BANK_SELECT_LSB: 32,
  SUSTAIN: 64,
  PORTAMENTO: 65,
  SOFTEN_PEDAL: 67,
  LEGATO: 68,
  HOLD_2: 69,
  SOUND_CONTROLLER_1: 70,
  SOUND_CONTROLLER_2: 71,
  SOUND_CONTROLLER_3: 72,
  SOUND_CONTROLLER_4: 73,
  SOUND_CONTROLLER_5: 74,
  SOUND_CONTROLLER_6: 75,
  SOUND_CONTROLLER_7: 76,
  SOUND_CONTROLLER_8: 77,
  SOUND_CONTROLLER_9: 78,
  SOUND_CONTROLLER_10: 79,
  GENERAL_PURPOSE_1: 80,
  GENERAL_PURPOSE_2: 81,
  GENERAL_PURPOSE_3: 82,
  GENERAL_PURPOSE_4: 83,
  PORTAMENTO_CONTROL: 84,
  REVERB: 91,
  TREMOLO: 92,
  CHORUS: 93,
  DETUNE: 94,
  PHASER: 95,
  DATA_INCREMENT: 96,
  DATA_DECREMENT: 97,
  NRPN_LSB: 98,
  NRPN_MSB: 99,
  RPN_LSB: 100,
  RPN_MSB: 101,
  ALL_SOUND_OFF: 120,
  RESET_ALL_CONTROLLERS: 121,
  LOCAL_CONTROL: 122,
  ALL_NOTES_OFF: 123,
  OMNI_OFF: 124,
  OMNI_ON: 125,
  MONO_ON: 126,
  POLY_ON: 127,
} as const;

export type MidiCC = keyof typeof MIDI_CC;