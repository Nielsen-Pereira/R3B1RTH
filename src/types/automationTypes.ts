/**
 * Automation Types - R3B-5
 * Type definitions for automation system
 */

export interface AutomationPoint {
  id: string;
  time: number;
  value: number;
  curve: AutomationCurve;
}

export type AutomationCurve = 'linear' | 'step' | 'smooth' | 'exponential';

export interface AutomationLane {
  id: string;
  parameter: string;
  deviceId: string;
  points: AutomationPoint[];
  enabled: boolean;
  recording: boolean;
}

export interface AutomationState {
  lanes: AutomationLane[];
  isRecording: boolean;
  currentRecordingLane: string | null;
  playbackPosition: number;
}

export interface AutomationRecording {
  startTime: number;
  endTime: number;
  parameter: string;
  deviceId: string;
  points: AutomationPoint[];
}

export const DEFAULT_AUTOMATION_CURVE: AutomationCurve = 'linear';

export const AUTOMATION_PARAMETERS = {
  tb303: ['cutoff', 'resonance', 'envMod', 'decay', 'sustain', 'waveform'],
  tr808: ['tune', 'decay', 'tone', 'level'],
  tr909: ['tune', 'decay', 'tone', 'level'],
  master: ['volume', 'pan']
} as const;