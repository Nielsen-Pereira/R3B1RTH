import { create } from 'zustand';
import { SectionType, Pattern, PatternStep, SequencerState } from '../types/audio';

const DEFAULT_LENGTH = 16;
const createEmptyPattern = (len: number): Pattern => ({ steps: Array.from({ length: len }, () => ({})), name: 'Untitled' });

const createDefaultPatterns = (): Record<SectionType, Pattern[]> => ({
  '303_1': Array.from({ length: 32 }, () => createEmptyPattern(DEFAULT_LENGTH)),
  '303_2': Array.from({ length: 32 }, () => createEmptyPattern(DEFAULT_LENGTH)),
  '808': Array.from({ length: 32 }, () => createEmptyPattern(DEFAULT_LENGTH)),
  '909': Array.from({ length: 32 }, () => createEmptyPattern(DEFAULT_LENGTH)),
});

const initialState: SequencerState = {
  currentStep: 0,
  isPlaying: false,
  tempo: 120,
  patterns: createDefaultPatterns(),
  currentPattern: { '303_1': 0, '303_2': 0, '808': 0, '909': 0 },
  patternLength: { '303_1': DEFAULT_LENGTH, '303_2': DEFAULT_LENGTH, '808': DEFAULT_LENGTH, '909': DEFAULT_LENGTH },
};

export const useSequencerStore = create<SequencerState & {
  setPattern: (section: SectionType, idx: number, pattern: Pattern) => void;
  setStepNote: (section: SectionType, step: number, note: string | null) => void;
  setStepInstrument: (section: SectionType, step: number, inst: string | null) => void;
  toggleStepAccent: (section: SectionType, step: number) => void;
  toggleStepSlide: (section: SectionType, step: number) => void;
  toggleStepDown: (section: SectionType, step: number) => void;
  toggleStepUp: (section: SectionType, step: number) => void;
  setCurrentPattern: (section: SectionType, idx: number) => void;
  setPatternLength: (section: SectionType, len: number) => void;
  setCurrentStep: (step: number) => void;
  setIsPlaying: (playing: boolean) => void;
  setTempo: (tempo: number) => void;
  clearPattern: (section: SectionType, idx: number) => void;
  copyPattern: (fromSec: SectionType, fromIdx: number, toSec: SectionType, toIdx: number) => void;
  setStepData: (section: SectionType, step: number, data: Partial<PatternStep>) => void;
  reset: () => void;
}>((set, get) => ({
  ...initialState,
  setPattern: (s, i, p) => set((state) => ({
    patterns: { ...state.patterns, [s]: [...state.patterns[s].slice(0, i), p, ...state.patterns[s].slice(i + 1)] }
  })),
  setStepNote: (s, step, note) => {
    const ci = get().currentPattern[s];
    set((state) => {
      const ps = { ...state.patterns };
      const p = { ...ps[s][ci] };
      const steps = [...p.steps];
      steps[step % state.patternLength[s]] = { ...steps[step % state.patternLength[s]], note: note || undefined };
      p.steps = steps; ps[s][ci] = p;
      return { patterns: ps };
    });
  },
  setStepInstrument: (s, step, inst) => {
    const ci = get().currentPattern[s];
    set((state) => {
      const ps = { ...state.patterns };
      const p = { ...ps[s][ci] };
      const steps = [...p.steps];
      steps[step % state.patternLength[s]] = { ...steps[step % state.patternLength[s]], instrument: inst || undefined };
      p.steps = steps; ps[s][ci] = p;
      return { patterns: ps };
    });
  },
  toggleStepAccent: (s, step) => {
    const ci = get().currentPattern[s];
    set((state) => {
      const ps = { ...state.patterns };
      const p = { ...ps[s][ci] };
      const steps = [...p.steps];
      const cs = steps[step % state.patternLength[s]];
      steps[step % state.patternLength[s]] = { ...cs, accent: !cs.accent };
      p.steps = steps; ps[s][ci] = p;
      return { patterns: ps };
    });
  },
  toggleStepSlide: (s, step) => {
    const ci = get().currentPattern[s];
    set((state) => {
      const ps = { ...state.patterns };
      const p = { ...ps[s][ci] };
      const steps = [...p.steps];
      const cs = steps[step % state.patternLength[s]];
      steps[step % state.patternLength[s]] = { ...cs, slide: !cs.slide };
      p.steps = steps; ps[s][ci] = p;
      return { patterns: ps };
    });
  },
  toggleStepDown: (s, step) => {
    const ci = get().currentPattern[s];
    set((state) => {
      const ps = { ...state.patterns };
      const p = { ...ps[s][ci] };
      const steps = [...p.steps];
      const cs = steps[step % state.patternLength[s]];
      steps[step % state.patternLength[s]] = { ...cs, down: !cs.down };
      p.steps = steps; ps[s][ci] = p;
      return { patterns: ps };
    });
  },
  toggleStepUp: (s, step) => {
    const ci = get().currentPattern[s];
    set((state) => {
      const ps = { ...state.patterns };
      const p = { ...ps[s][ci] };
      const steps = [...p.steps];
      const cs = steps[step % state.patternLength[s]];
      steps[step % state.patternLength[s]] = { ...cs, up: !cs.up };
      p.steps = steps; ps[s][ci] = p;
      return { patterns: ps };
    });
  },
  setCurrentPattern: (s, i) => set((state) => ({
    currentPattern: { ...state.currentPattern, [s]: Math.max(0, Math.min(31, i)) }
  })),
  setPatternLength: (s, l) => set((state) => ({
    patternLength: { ...state.patternLength, [s]: Math.max(1, Math.min(32, l)) }
  })),
  setCurrentStep: (step) => set({ currentStep: step }),
  setIsPlaying: (playing) => set({ isPlaying: playing }),
  setTempo: (tempo) => set({ tempo: Math.max(40, Math.min(300, tempo)) }),
  clearPattern: (s, i) => set((state) => ({
    patterns: { ...state.patterns, [s]: [...state.patterns[s].slice(0, i), createEmptyPattern(state.patternLength[s]), ...state.patterns[s].slice(i + 1)] }
  })),
  copyPattern: (fs, fi, ts, ti) => set((state) => {
    const ps = { ...state.patterns };
    const fp = ps[fs][fi];
    const tl = state.patternLength[ts];
    const as = fp.steps.slice(0, tl);
    ps[ts][ti] = { ...fp, steps: as.length < tl ? [...as, ...Array.from({ length: tl - as.length }, () => ({}))] : as };
    return { patterns: ps };
  }),
  setStepData: (s, step, data) => {
    const ci = get().currentPattern[s];
    set((state) => {
      const ps = { ...state.patterns };
      const p = { ...ps[s][ci] };
      const steps = [...p.steps];
      steps[step % state.patternLength[s]] = { ...steps[step % state.patternLength[s]], ...data };
      p.steps = steps; ps[s][ci] = p;
      return { patterns: ps };
    });
  },
  reset: () => set(initialState),
}));
