import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { SectionType, Pattern, Song, Step } from '../types/audio';

function createEmptyPattern(length: number = 16, section: SectionType): Pattern {
  const isSynth = section === '303_1' || section === '303_2';
  const steps = Array(length).fill(null).map(() => ({
    instrument: null,
    accent: false,
    flam: false,
    ...(isSynth ? { note: null, notePause: 'pause', down: false, up: false, slide: false } : {})
  }));
  return { id: crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2), bank: 0, index: 0, length, name: 'New Pattern', steps: steps as Step[] };
}

function createEmptySong(): Song {
  return {
    id: crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2),
    name: 'New Song',
    created: new Date().toISOString(),
    modified: new Date().toISOString(),
    tempo: 120,
    shuffle: 0,
    mode: 'pattern',
    currentPattern: { '808': 0, '909': 0, '303_1': 0, '303_2': 0 },
    tracks: [],
    automation: [],
    loopStart: null,
    loopEnd: null,
  };
}

interface SequencerState {
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

interface SequencerActions {
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

type SequencerStore = SequencerState & SequencerActions;

const initialState: SequencerState = {
  isPlaying: false,
  isRecording: false,
  currentStep: 0,
  currentPattern: { '808': 0, '909': 0, '303_1': 0, '303_2': 0 },
  patternLength: { '808': 16, '909': 16, '303_1': 16, '303_2': 16 },
  shuffle: 0,
  swingAmount: 0,
  tempo: 120,
  currentMeasure: 0,
  loopStart: null,
  loopEnd: null,
  patterns: {
    '808': Array(32).fill(null).map((_, i) => createEmptyPattern(16, '808')),
    '909': Array(32).fill(null).map((_, i) => createEmptyPattern(16, '909')),
    '303_1': Array(32).fill(null).map((_, i) => createEmptyPattern(16, '303_1')),
    '303_2': Array(32).fill(null).map((_, i) => createEmptyPattern(16, '303_2')),
  },
  song: null,
  mode: 'pattern',
};

export const useSequencerStore = create<SequencerStore>()(
  devtools(
    persist(
      (set, get) => ({
        ...initialState,
        play: () => set({ isPlaying: true }),
        stop: () => set({ isPlaying: false, isRecording: false, currentStep: 0, currentMeasure: 0 }),
        togglePlay: () => set((state) => ({ isPlaying: !state.isPlaying })),
        record: () => set({ isRecording: true }),
        toggleRecord: () => set((state) => ({ isRecording: !state.isRecording })),
        setTempo: (tempo) => set({ tempo: Math.max(40, Math.min(300, tempo)) }),
        setShuffle: (shuffle) => {
          const clamped = Math.max(0, Math.min(100, shuffle));
          set({ shuffle: clamped, swingAmount: clamped / 100 });
        },
        setMode: (mode) => set({ mode }),
        goToStep: (step) => {
          const maxSteps = Math.max(...Object.values(get().patternLength));
          set({ currentStep: Math.max(0, Math.min(maxSteps - 1, step)) });
        },
        nextStep: () => {
          const state = get();
          const maxSteps = Math.max(...Object.values(state.patternLength));
          set({ currentStep: (state.currentStep + 1) % maxSteps });
        },
        previousStep: () => {
          const state = get();
          const maxSteps = Math.max(...Object.values(state.patternLength));
          set({ currentStep: (state.currentStep - 1 + maxSteps) % maxSteps });
        },
        createPattern: (section, length = 16) => {
          const pattern = createEmptyPattern(length, section);
          return pattern;
        },
        copyPattern: (section, fromBank, fromIndex, toBank, toIndex) => set((state) => {
          const patterns = [...state.patterns[section]];
          const fromPatternIndex = fromBank * 8 + fromIndex;
          const toPatternIndex = toBank * 8 + toIndex;
          const patternToCopy = { ...patterns[fromPatternIndex], bank: toBank, index: toIndex };
          patterns[toPatternIndex] = patternToCopy;
          return { patterns: { ...state.patterns, [section]: patterns } };
        }),
        deletePattern: (section, bank, index) => set((state) => {
          const patterns = [...state.patterns[section]];
          patterns[bank * 8 + index] = createEmptyPattern(patterns[bank * 8 + index].length, section);
          return { patterns: { ...state.patterns, [section]: patterns } };
        }),
        clearPattern: (section, bank, index) => set((state) => {
          const patterns = [...state.patterns[section]];
          const length = patterns[bank * 8 + index].length;
          patterns[bank * 8 + index] = createEmptyPattern(length, section);
          return { patterns: { ...state.patterns, [section]: patterns } };
        }),
        renamePattern: (section, bank, index, name) => set((state) => {
          const patterns = [...state.patterns[section]];
          patterns[bank * 8 + index] = { ...patterns[bank * 8 + index], name };
          return { patterns: { ...state.patterns, [section]: patterns } };
        }),
        setSelectedPattern: (section, bank, index) => set({
          currentPattern: { ...get().currentPattern, [section]: index },
        }),
        setPatternLength: (section, length) => set((state) => {
          const patterns = [...state.patterns[section]];
          const patternIndex = 0;
          const currentPattern = patterns[patternIndex];
          const clampedLength = Math.max(1, Math.min(32, length));
          const newSteps: Step[] = [];
          for (let i = 0; i < clampedLength; i++) {
            if (i < currentPattern.steps.length) newSteps.push({ ...currentPattern.steps[i] });
            else {
              const isSynth = section === '303_1' || section === '303_2';
              newSteps.push(isSynth
                ? { note: null, notePause: 'pause', down: false, up: false, accent: false, slide: false, flam: false }
                : { instrument: null, accent: false, flam: false });
            }
          }
          patterns[patternIndex] = { ...currentPattern, length: clampedLength, steps: newSteps };
          return {
            patterns: { ...state.patterns, [section]: patterns },
            patternLength: { ...state.patternLength, [section]: clampedLength },
          };
        }),
        setStep: (section, step, stepData) => set((state) => {
          const patterns = [...state.patterns[section]];
          const patternIndex = 0;
          const currentPattern = patterns[patternIndex];
          if (step >= 0 && step < currentPattern.length) {
            const updatedSteps = [...currentPattern.steps];
            updatedSteps[step] = { ...updatedSteps[step], ...stepData };
            patterns[patternIndex] = { ...currentPattern, steps: updatedSteps };
          }
          return { patterns: { ...state.patterns, [section]: patterns } };
        }),
        toggleStep: (section, step) => set((state) => {
          const patterns = [...state.patterns[section]];
          const patternIndex = 0;
          const currentPattern = patterns[patternIndex];
          if (step >= 0 && step < currentPattern.length) {
            const updatedSteps = [...currentPattern.steps];
            const currentStep = updatedSteps[step] as any;
            const defaultInstrument = section === '808' || section === '909' ? 'BD' : null;
            updatedSteps[step] = currentStep.instrument !== null
              ? { ...currentStep, instrument: null, accent: false, flam: false }
              : { ...currentStep, instrument: defaultInstrument, accent: false, flam: false };
            patterns[patternIndex] = { ...currentPattern, steps: updatedSteps };
          }
          return { patterns: { ...state.patterns, [section]: patterns } };
        }),
        setStepInstrument: (section, step, instrument) => set((state) => {
          const patterns = [...state.patterns[section]];
          const patternIndex = 0;
          const currentPattern = patterns[patternIndex];
          if (step >= 0 && step < currentPattern.length) {
            const updatedSteps = [...currentPattern.steps];
            (updatedSteps[step] as any).instrument = instrument;
            patterns[patternIndex] = { ...currentPattern, steps: updatedSteps };
          }
          return { patterns: { ...state.patterns, [section]: patterns } };
        }),
        toggleStepAccent: (section, step) => set((state) => {
          const patterns = [...state.patterns[section]];
          const patternIndex = 0;
          const currentPattern = patterns[patternIndex];
          if (step >= 0 && step < currentPattern.length) {
            const updatedSteps = [...currentPattern.steps];
            const currentStep = updatedSteps[step] as any;
            updatedSteps[step] = { ...currentStep, accent: !currentStep.accent };
            patterns[patternIndex] = { ...currentPattern, steps: updatedSteps };
          }
          return { patterns: { ...state.patterns, [section]: patterns } };
        }),
        toggleStepFlam: (section, step) => set((state) => {
          const patterns = [...state.patterns[section]];
          const patternIndex = 0;
          const currentPattern = patterns[patternIndex];
          if (step >= 0 && step < currentPattern.length) {
            const updatedSteps = [...currentPattern.steps];
            const currentStep = updatedSteps[step] as any;
            updatedSteps[step] = { ...currentStep, flam: !currentStep.flam };
            patterns[patternIndex] = { ...currentPattern, steps: updatedSteps };
          }
          return { patterns: { ...state.patterns, [section]: patterns } };
        }),
        setStepNote: (section, step, note) => set((state) => {
          const patterns = [...state.patterns[section]];
          const patternIndex = 0;
          const currentPattern = patterns[patternIndex];
          if (step >= 0 && step < currentPattern.length) {
            const updatedSteps = [...currentPattern.steps];
            const currentStep = updatedSteps[step] as any;
            updatedSteps[step] = { ...currentStep, note, notePause: note ? 'note' : 'pause', down: true, up: false };
            patterns[patternIndex] = { ...currentPattern, steps: updatedSteps };
          }
          return { patterns: { ...state.patterns, [section]: patterns } };
        }),
        setStepNotePause: (section, step, notePause) => set((state) => {
          const patterns = [...state.patterns[section]];
          const patternIndex = 0;
          const currentPattern = patterns[patternIndex];
          if (step >= 0 && step < currentPattern.length) {
            const updatedSteps = [...currentPattern.steps];
            const currentStep = updatedSteps[step] as any;
            updatedSteps[step] = { ...currentStep, notePause, note: null, down: false, up: false };
            patterns[patternIndex] = { ...currentPattern, steps: updatedSteps };
          }
          return { patterns: { ...state.patterns, [section]: patterns } };
        }),
        toggleStepDown: (section, step) => set((state) => {
          const patterns = [...state.patterns[section]];
          const patternIndex = 0;
          const currentPattern = patterns[patternIndex];
          if (step >= 0 && step < currentPattern.length) {
            const updatedSteps = [...currentPattern.steps];
            const currentStep = updatedSteps[step] as any;
            updatedSteps[step] = { ...currentStep, down: !currentStep.down };
            patterns[patternIndex] = { ...currentPattern, steps: updatedSteps };
          }
          return { patterns: { ...state.patterns, [section]: patterns } };
        }),
        toggleStepUp: (section, step) => set((state) => {
          const patterns = [...state.patterns[section]];
          const patternIndex = 0;
          const currentPattern = patterns[patternIndex];
          if (step >= 0 && step < currentPattern.length) {
            const updatedSteps = [...currentPattern.steps];
            const currentStep = updatedSteps[step] as any;
            updatedSteps[step] = { ...currentStep, up: !currentStep.up };
            patterns[patternIndex] = { ...currentPattern, steps: updatedSteps };
          }
          return { patterns: { ...state.patterns, [section]: patterns } };
        }),
        toggleStepSlide: (section, step) => set((state) => {
          const patterns = [...state.patterns[section]];
          const patternIndex = 0;
          const currentPattern = patterns[patternIndex];
          if (step >= 0 && step < currentPattern.length) {
            const updatedSteps = [...currentPattern.steps];
            const currentStep = updatedSteps[step] as any;
            updatedSteps[step] = { ...currentStep, slide: !currentStep.slide };
            patterns[patternIndex] = { ...currentPattern, steps: updatedSteps };
          }
          return { patterns: { ...state.patterns, [section]: patterns } };
        }),
        createSong: () => {
          const song = createEmptySong();
          set({ song });
          return song;
        },
        loadSong: (song) => set({ song }),
        saveSong: () => get().song,
        addTrackEvent: (section, time, patternBank, patternIndex) => set((state) => {
          if (!state.song) return state;
          const tracks = [...state.song.tracks];
          const trackIndex = tracks.findIndex(t => t.section === section);
          if (trackIndex >= 0) {
            tracks[trackIndex] = {
              ...tracks[trackIndex],
              events: [...tracks[trackIndex].events, { time, patternBank, patternIndex }].sort((a, b) => a.time - b.time),
            };
          } else {
            tracks.push({ section, events: [{ time, patternBank, patternIndex }] });
          }
          return { song: { ...state.song, tracks, modified: new Date().toISOString() } };
        }),
        removeTrackEvent: (section, eventIndex) => set((state) => {
          if (!state.song) return state;
          const tracks = [...state.song.tracks];
          const trackIndex = tracks.findIndex(t => t.section === section);
          if (trackIndex >= 0 && eventIndex >= 0 && eventIndex < tracks[trackIndex].events.length) {
            tracks[trackIndex] = {
              ...tracks[trackIndex],
              events: tracks[trackIndex].events.filter((_, i) => i !== eventIndex),
            };
          }
          return { song: { ...state.song, tracks, modified: new Date().toISOString() } };
        }),
        startRecordingAutomation: (controlId) => set({ songEditor: { recordingAutomation: controlId } }),
        stopRecordingAutomation: () => set({ songEditor: { recordingAutomation: null } }),
        recordAutomationPoint: (controlId, time, value) => set((state) => {
          const songEditor = state.songEditor || { recordingAutomation: null, automationPoints: {} };
          const automationPoints = { ...songEditor.automationPoints };
          if (!automationPoints[controlId]) automationPoints[controlId] = [];
          automationPoints[controlId].push(time);
          return { songEditor: { ...songEditor, automationPoints } };
        }),
        setLoop: (start, end) => set({ loopStart: start, loopEnd: end }),
        clearLoop: () => set({ loopStart: null, loopEnd: null }),
        setFocus: (section) => set({ focusedSection: section }),
        resetSequencer: () => set(initialState),
      }),
      {
        name: 'sequencer-store',
        partialize: (state) => ({
          isPlaying: state.isPlaying,
          currentStep: state.currentStep,
          currentPattern: state.currentPattern,
          patternLength: state.patternLength,
          shuffle: state.shuffle,
          tempo: state.tempo,
          currentMeasure: state.currentMeasure,
          loopStart: state.loopStart,
          loopEnd: state.loopEnd,
          patterns: state.patterns,
          song: state.song,
          mode: state.mode,
        }),
      }
    ),
    { name: 'SequencerStore' }
  )
);

export default useSequencerStore;