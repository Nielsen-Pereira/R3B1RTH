/**
 * Transport Store - Batch 1 Development
 * R3B-90 to R3B-93: Song Mode Implementation
 * 
 * Centralized transport controls for playback and recording
 */

import { create } from 'zustand';
import type { Song } from '../types';

// Types
export type TransportState = {
  isPlaying: boolean;
  isRecording: boolean;
  isMetronomeEnabled: boolean;
  metronomeVolume: number;
  currentPosition: number; // in beats
  currentBeat: number; // 0-15 for 16-step
  bpm: number;
  swing: number;
  
  // Actions
  play: () => void;
  pause: () => void;
  stop: () => void;
  startRecording: () => void;
  stopRecording: () => void;
  setBpm: (bpm: number) => void;
  setSwing: (swing: number) => void;
  setPosition: (position: number) => void;
  tick: () => void; // Called by audio engine on each beat
  reset: () => void;
};

// Store
export const useTransportStore = create<TransportState>((set, get) => ({
  isPlaying: false,
  isRecording: false,
  isMetronomeEnabled: true,
  metronomeVolume: 0.5,
  currentPosition: 0,
  currentBeat: 0,
  bpm: 120,
  swing: 0,

  play: () => set({ isPlaying: true }),

  pause: () => set({ isPlaying: false }),

  stop: () => set({
    isPlaying: false,
    currentPosition: 0,
    currentBeat: 0,
  }),

  startRecording: () => set({ isRecording: true }),

  stopRecording: () => set({ isRecording: false }),

  setBpm: (bpm) => set({ bpm: Math.max(40, Math.min(300, bpm)) }),

  setSwing: (swing) => set({ swing: Math.max(-100, Math.min(100, swing)) }),

  setPosition: (position) => set({ currentPosition: Math.max(0, position) }),

  tick: () => {
    const state = get();
    if (!state.isPlaying) return;
    
    const beatsPerMeasure = 16; // Default for ReBirth
    const newBeat = (state.currentBeat + 1) % beatsPerMeasure;
    const newPosition = state.currentPosition + 1;
    
    set({
      currentBeat: newBeat,
      currentPosition: newPosition,
    });
  },

  reset: () => set({
    isPlaying: false,
    isRecording: false,
    currentPosition: 0,
    currentBeat: 0,
  }),
}));

// Selectors
export const getTransportInfo = (state: TransportState) => ({
  isPlaying: state.isPlaying,
  isRecording: state.isRecording,
  bpm: state.bpm,
  swing: state.swing,
  position: state.currentPosition,
  beat: state.currentBeat,
});

// Helper functions
export const beatsToSeconds = (beats: number, bpm: number): number => {
  return (beats * 60) / bpm;
};

export const secondsToBeats = (seconds: number, bpm: number): number => {
  return (seconds * bpm) / 60;
};

export const getBeatDuration = (bpm: number): number => {
  return 60000 / bpm; // in milliseconds
};

export const getSixteenthNoteDuration = (bpm: number): number => {
  return getBeatDuration(bpm) / 4;
};

// Metronome utilities
export const createMetronomeClick = (
  bpm: number,
  beat: number,
  accentBeats: number[] = [0, 4, 8, 12]
): { frequency: number; duration: number } => {
  const isAccent = accentBeats.includes(beat % 16);
  return {
    frequency: isAccent ? 800 : 400, // Higher pitch for accent
    duration: getSixteenthNoteDuration(bpm) * 0.8,
  };
};
