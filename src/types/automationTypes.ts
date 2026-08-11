/**
 * Automation Types for R3B1RTH
 * Based on ReBirth RB-338 specifications
 */

export type ControlId = 
  | 'tb303_cutoff'
  | 'tb303_resonance'
  | 'tb303_envMod'
  | 'tb303_decay'
  | 'tb303_accent'
  | 'tb303_volume'
  | 'tb303_tune'
  | 'tr808_volume'
  | 'tr808_tune'
  | 'tr808_attack'
  | 'tr808_decay'
  | 'tr909_volume'
  | 'tr909_tune'
  | 'tr909_attack'
  | 'tr909_decay'
  | 'master_volume'
  | 'tempo';

export interface AutomationPoint {
  timestamp: number; // milliseconds from start
  value: number; // normalized 0-1
}

export interface AutomationTrack {
  controlId: ControlId;
  points: AutomationPoint[];
  enabled: boolean;
}

export interface PatternAutomation {
  patternId: string;
  tracks: AutomationTrack[];
}

export interface SongAutomation {
  songId: string;
  globalTracks: AutomationTrack[]; // For master controls
  patternAutomation: PatternAutomation[];
}

export interface AutomationState {
  automation: SongAutomation[];
  isRecordingAutomation: boolean;
  recordingStartTime: number | null;
  currentAutomationTime: number;
}

export const DEFAULT_AUTOMATION_TRACK: AutomationTrack = {
  controlId: 'tempo',
  points: [],
  enabled: true,
};

export const DEFAULT_PATTERN_AUTOMATION: PatternAutomation = {
  patternId: '',
  tracks: [],
};

export const DEFAULT_SONG_AUTOMATION: SongAutomation = {
  songId: '',
  globalTracks: [],
  patternAutomation: [],
};

export const DEFAULT_AUTOMATION_STATE: AutomationState = {
  automation: [],
  isRecordingAutomation: false,
  recordingStartTime: null,
  currentAutomationTime: 0,
};