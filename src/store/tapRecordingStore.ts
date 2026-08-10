import { create } from 'zustand';
import { TR808Instrument, TR909Instrument, TapRecordingNote, TapRecordingState } from '../types/audio';

interface TapRecordingActions {
  startRecording: (instrument?: TR808Instrument | TR909Instrument) => void;
  stopRecording: () => void;
  recordNote: (note: number, velocity: number) => void;
  clearRecording: () => void;
  setCurrentOctave: (octave: number) => void;
  setCurrentInstrument: (instrument: TR808Instrument | TR909Instrument | undefined) => void;
  getRecording: () => TapRecordingState;
}

type TapRecordingStore = TapRecordingState & TapRecordingActions;

const initialState: TapRecordingState = {
  isRecording: false,
  recordedNotes: [],
  currentOctave: 3,
  currentInstrument: undefined
};

export const useTapRecordingStore = create<TapRecordingStore>((set, get) => ({
  ...initialState,
  startRecording: (instrument?: TR808Instrument | TR909Instrument) => {
    set({
      isRecording: true,
      recordedNotes: [],
      currentInstrument: instrument
    });
  },
  stopRecording: () => {
    set({ isRecording: false });
  },
  recordNote: (note: number, velocity: number) => {
    const state = get();
    if (!state.isRecording) return;
    const recordedNote: TapRecordingNote = {
      note,
      time: Date.now(),
      velocity,
      instrument: state.currentInstrument
    };
    set({
      recordedNotes: [...state.recordedNotes, recordedNote]
    });
  },
  clearRecording: () => {
    set({ recordedNotes: [] });
  },
  setCurrentOctave: (octave: number) => {
    set({ currentOctave: octave });
  },
  setCurrentInstrument: (instrument: TR808Instrument | TR909Instrument | undefined) => {
    set({ currentInstrument: instrument });
  },
  getRecording: () => {
    return get();
  }
}));

export function startTapRecording(instrument?: TR808Instrument | TR909Instrument): void {
  useTapRecordingStore.getState().startRecording(instrument);
}

export function stopTapRecording(): void {
  useTapRecordingStore.getState().stopRecording();
}

export function recordTapNote(note: number, velocity: number): void {
  useTapRecordingStore.getState().recordNote(note, velocity);
}

export function clearTapRecording(): void {
  useTapRecordingStore.getState().clearRecording();
}

export function setTapRecordingOctave(octave: number): void {
  useTapRecordingStore.getState().setCurrentOctave(octave);
}

export function getTapRecordingState(): TapRecordingState {
  return useTapRecordingStore.getState().getRecording();
}