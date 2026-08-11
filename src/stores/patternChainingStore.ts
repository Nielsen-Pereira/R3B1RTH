/**
 * Pattern Chaining Store - Batch 4 Development
 * R3B-133: Pattern Chaining Implementation
 *
 * Zustand store for pattern chaining functionality
 */

import { create } from 'zustand';
import type { Pattern } from '../types';

export type PatternChain = {
  id: string;
  name: string;
  patterns: string[]; // Pattern IDs in sequence
  enabled: boolean;
  loop: boolean;
  currentIndex: number;
};

export type PatternChainingState = {
  chains: PatternChain[];
  currentChainId: string | null;
  isChaining: boolean;
  
  // Actions
  createChain: (name: string) => string;
  deleteChain: (chainId: string) => void;
  addPatternToChain: (chainId: string, patternId: string) => void;
  removePatternFromChain: (chainId: string, patternId: string) => void;
  reorderChain: (chainId: string, fromIndex: number, toIndex: number) => void;
  setCurrentChain: (chainId: string | null) => void;
  setChainLoop: (chainId: string, loop: boolean) => void;
  setChainEnabled: (chainId: string, enabled: boolean) => void;
  advanceChain: () => void;
  resetChain: (chainId: string) => void;
  setChainingEnabled: (enabled: boolean) => void;
  
  // Selectors
  getCurrentChain: () => PatternChain | null;
  getChainById: (chainId: string) => PatternChain | null;
  getAllChains: () => PatternChain[];
  isPatternInChain: (patternId: string) => boolean;
};

const defaultChain: PatternChain = {
  id: 'default',
  name: 'Default Chain',
  patterns: [],
  enabled: true,
  loop: true,
  currentIndex: 0,
};

export const usePatternChainingStore = create<PatternChainingState>((set, get) => ({
  chains: [defaultChain],
  currentChainId: null,
  isChaining: false,

  createChain: (name) => {
    const newChain: PatternChain = {
      id: crypto.randomUUID(),
      name,
      patterns: [],
      enabled: true,
      loop: true,
      currentIndex: 0,
    };
    set((state) => ({
      chains: [...state.chains, newChain],
    }));
    return newChain.id;
  },

  deleteChain: (chainId) => set((state) => ({
    chains: state.chains.filter(chain => chain.id !== chainId),
    currentChainId: state.currentChainId === chainId ? null : state.currentChainId,
  })),

  addPatternToChain: (chainId, patternId) => set((state) => ({
    chains: state.chains.map(chain =>
      chain.id === chainId
        ? { ...chain, patterns: [...chain.patterns, patternId] }
        : chain
    ),
  })),

  removePatternFromChain: (chainId, patternId) => set((state) => ({
    chains: state.chains.map(chain =>
      chain.id === chainId
        ? { ...chain, patterns: chain.patterns.filter(p => p !== patternId) }
        : chain
    ),
  })),

  reorderChain: (chainId, fromIndex, toIndex) => set((state) => ({
    chains: state.chains.map(chain => {
      if (chain.id !== chainId) return chain;
      const newPatterns = [...chain.patterns];
      const [removed] = newPatterns.splice(fromIndex, 1);
      newPatterns.splice(toIndex, 0, removed);
      return { ...chain, patterns: newPatterns };
    }),
  })),

  setCurrentChain: (chainId) => set({ currentChainId: chainId }),

  setChainLoop: (chainId, loop) => set((state) => ({
    chains: state.chains.map(chain =>
      chain.id === chainId ? { ...chain, loop } : chain
    ),
  })),

  setChainEnabled: (chainId, enabled) => set((state) => ({
    chains: state.chains.map(chain =>
      chain.id === chainId ? { ...chain, enabled } : chain
    ),
  })),

  advanceChain: () => set((state) => {
    if (!state.currentChainId) return state;
    const chain = state.chains.find(c => c.id === state.currentChainId);
    if (!chain || chain.patterns.length === 0) return state;
    
    const newIndex = chain.loop
      ? (chain.currentIndex + 1) % chain.patterns.length
      : Math.min(chain.currentIndex + 1, chain.patterns.length - 1);
    
    return {
      chains: state.chains.map(c =>
        c.id === state.currentChainId
          ? { ...c, currentIndex: newIndex }
          : c
      ),
    };
  }),

  resetChain: (chainId) => set((state) => ({
    chains: state.chains.map(chain =>
      chain.id === chainId ? { ...chain, currentIndex: 0 } : chain
    ),
  })),

  setChainingEnabled: (enabled) => set({ isChaining: enabled }),

  // Selectors
  getCurrentChain: () => {
    const state = get();
    if (!state.currentChainId) return null;
    return state.chains.find(c => c.id === state.currentChainId) || null;
  },

  getChainById: (chainId) => {
    const state = get();
    return state.chains.find(c => c.id === chainId) || null;
  },

  getAllChains: () => {
    const state = get();
    return state.chains;
  },

  isPatternInChain: (patternId) => {
    const state = get();
    return state.chains.some(chain => chain.patterns.includes(patternId));
  },
}));

// Presets
export const PATTERN_CHAIN_PRESETS = {
  'Basic 4': (patternIds: string[]) => ({
    name: 'Basic 4-Bar',
    patterns: patternIds.slice(0, 4),
    loop: true,
  }),
  'Basic 8': (patternIds: string[]) => ({
    name: 'Basic 8-Bar',
    patterns: patternIds.slice(0, 8),
    loop: true,
  }),
  'Intro-Verse-Chorus': (patternIds: string[]) => ({
    name: 'Song Structure',
    patterns: patternIds.length >= 3 ? [patternIds[0], patternIds[1], patternIds[2]] : patternIds,
    loop: true,
  }),
};

export const applyPatternChainPreset = (
  store: { getState: () => PatternChainingState; setState: (state: Partial<PatternChainingState>) => void },
  presetKey: keyof typeof PATTERN_CHAIN_PRESETS,
  patternIds: string[]
) => {
  const preset = PATTERN_CHAIN_PRESETS[presetKey];
  const presetConfig = preset(patternIds);
  
  const newChain: PatternChain = {
    id: crypto.randomUUID(),
    name: presetConfig.name,
    patterns: presetConfig.patterns,
    enabled: true,
    loop: presetConfig.loop,
    currentIndex: 0,
  };
  
  store.setState((state) => ({
    chains: [...state.chains, newChain],
    currentChainId: newChain.id,
  }));
};
