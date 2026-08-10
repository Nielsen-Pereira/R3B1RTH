import { create } from 'zustand';
import { TB303Pattern, DrumPattern, ClipboardPattern } from '../types/audio';

interface ClipboardStoreState {
  pattern: ClipboardPattern | null;
}

interface ClipboardStoreActions {
  copyPattern: (pattern: TB303Pattern | DrumPattern, instrument?: string) => void;
  pastePattern: () => ClipboardPattern | null;
  clearClipboard: () => void;
}

type ClipboardStore = ClipboardStoreState & ClipboardStoreActions;

const initialState: ClipboardStoreState = {
  pattern: null
};

export const useClipboardStore = create<ClipboardStore>((set, get) => ({
  ...initialState,
  copyPattern: (pattern: TB303Pattern | DrumPattern, instrument?: string) => {
    const clipboardPattern: ClipboardPattern = {
      type: pattern.type,
      pattern: { ...pattern },
      instrument: instrument
    };
    set({ pattern: clipboardPattern });
  },
  pastePattern: () => {
    const current = get().pattern;
    if (!current) return null;
    return {
      ...current,
      pattern: { ...current.pattern }
    };
  },
  clearClipboard: () => {
    set({ pattern: null });
  }
}));

export function copyPatternToClipboard(pattern: TB303Pattern | DrumPattern, instrument?: string): void {
  useClipboardStore.getState().copyPattern(pattern, instrument);
}

export function getPatternFromClipboard(): ClipboardPattern | null {
  return useClipboardStore.getState().pastePattern();
}

export function clearClipboard(): void {
  useClipboardStore.getState().clearClipboard();
}