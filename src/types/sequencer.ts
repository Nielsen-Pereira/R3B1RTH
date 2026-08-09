// Sequencer types for R3B1RTH

import { SectionType, Pattern, Song, Step } from './audio';

export interface SequencerState {
  isPlaying: boolean;
  isRecording: boolean;
  currentStep: number;
  currentPattern: Record<SectionType, number>;
  patternLength: Record<SectionType, number>;
  shuffle: number;
  swingAmount: number;
  tempo: number;
  currentMeasure: number;
  loopStart: number | null;
  loopEnd: number | null;
  patterns: Record<SectionType, Pattern[]>;
  song: Song | null;
  mode: 'pattern' | 'song';
}

export interface SequencerActions {
  play: () => void;
  stop: () => void;
  togglePlay: () => void;
  record: () => void;
  toggleRecord: () => void;
  setTempo: (tempo: number) => void;
  setShuffle: (shuffle: number) => void;
  setMode: (mode: 'pattern' | 'song') => void;
  goToStep: (step: number) => void;
  nextStep: () => void;
  previousStep: () => void;
  createPattern: (section: SectionType, length?: number) => Pattern;
  copyPattern: (section: SectionType, fromBank: number, fromIndex: number, toBank: number, toIndex: number) => void;
  deletePattern: (section: SectionType, bank: number, index: number) => void;
  clearPattern: (section: SectionType, bank: number, index: number) => void;
  renamePattern: (section: SectionType, bank: number, index: number, name: string) => void;
  setSelectedPattern: (section: SectionType, bank: number, index: number) => void;
  setPatternLength: (section: SectionType, length: number) => void;
  setStep: (section: SectionType, step: number, stepData: Partial<Step>) => void;
  toggleStep: (section: SectionType, step: number) => void;
  setStepInstrument: (section: SectionType, step: number, instrument: string | null) => void;
  toggleStepAccent: (section: SectionType, step: number) => void;
  toggleStepFlam: (section: SectionType, step: number) => void;
  setStepNote: (section: SectionType, step: number, note: string | null) => void;
  setStepNotePause: (section: SectionType, step: number, notePause: 'note' | 'pause' | 'rest') => void;
  toggleStepDown: (section: SectionType, step: number) => void;
  toggleStepUp: (section: SectionType, step: number) => void;
  toggleStepSlide: (section: SectionType, step: number) => void;
  createSong: () => Song;
  loadSong: (song: Song) => void;
  saveSong: () => Song | null;
  addTrackEvent: (section: SectionType, time: number, patternBank: number, patternIndex: number) => void;
  removeTrackEvent: (section: SectionType, eventIndex: number) => void;
  startRecordingAutomation: (controlId: string) => void;
  stopRecordingAutomation: () => void;
  recordAutomationPoint: (controlId: string, time: number, value: number) => void;
  setLoop: (start: number | null, end: number | null) => void;
  clearLoop: () => void;
  setFocus: (section: SectionType | null) => void;
  resetSequencer: () => void;
}

export type SequencerStore = SequencerState & SequencerActions;
