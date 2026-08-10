import { create } from 'zustand';

interface SwingStoreState {
  swingAmount: number;
  swingEnabled: boolean;
  shufflePattern: number[];
}

interface SwingStoreActions {
  setSwingAmount: (amount: number) => void;
  setSwingEnabled: (enabled: boolean) => void;
  setShufflePattern: (pattern: number[]) => void;
  getSwingOffset: (step: number, baseTiming: number) => number;
}

type SwingStore = SwingStoreState & SwingStoreActions;

const initialState: SwingStoreState = {
  swingAmount: 0,
  swingEnabled: false,
  shufflePattern: Array(16).fill(0)
};

export const useSwingStore = create<SwingStore>((set, get) => ({
  ...initialState,
  setSwingAmount: (amount: number) => {
    set({ swingAmount: Math.max(0, Math.min(1, amount)) });
  },
  setSwingEnabled: (enabled: boolean) => {
    set({ swingEnabled: enabled });
  },
  setShufflePattern: (pattern: number[]) => {
    set({ shufflePattern: pattern });
  },
  getSwingOffset: (step: number, baseTiming: number) => {
    const state = get();
    if (!state.swingEnabled || state.swingAmount === 0) {
      return 0;
    }
    const isEvenStep = step % 2 === 0;
    const swingDirection = isEvenStep ? 1 : -1;
    const swingOffset = baseTiming * state.swingAmount * swingDirection * 0.5;
    const shuffleValue = state.shufflePattern[step % state.shufflePattern.length];
    const shuffleOffset = baseTiming * shuffleValue * 0.1;
    return swingOffset + shuffleOffset;
  }
}));

export function setSwingAmount(amount: number): void {
  useSwingStore.getState().setSwingAmount(amount);
}

export function setSwingEnabled(enabled: boolean): void {
  useSwingStore.getState().setSwingEnabled(enabled);
}

export function getSwingOffset(step: number, baseTiming: number): number {
  return useSwingStore.getState().getSwingOffset(step, baseTiming);
}

export function getSwingState() {
  return useSwingStore.getState();
}