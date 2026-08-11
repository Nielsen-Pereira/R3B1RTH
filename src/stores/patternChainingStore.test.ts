/**
 * Pattern Chaining Store Tests - Batch 4 Development
 * R3B-133: Pattern Chaining Implementation
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { usePatternChainingStore, PATTERN_CHAIN_PRESETS, applyPatternChainPreset } from '../stores/patternChainingStore';

describe('usePatternChainingStore', () => {
  let store: ReturnType<typeof usePatternChainingStore>;

  beforeEach(() => {
    store = usePatternChainingStore();
    // Reset to initial state
    store.getState().setCurrentChain(null);
  });

  it('should initialize with default chain', () => {
    const state = store.getState();
    expect(state.chains.length).toBeGreaterThan(0);
    expect(state.chains[0].name).toBe('Default Chain');
  });

  it('should create a new chain', () => {
    const initialCount = store.getState().chains.length;
    const chainId = store.getState().createChain('Test Chain');
    const state = store.getState();
    
    expect(state.chains.length).toBe(initialCount + 1);
    expect(state.chains.find(c => c.id === chainId)).toBeDefined();
    expect(state.chains.find(c => c.id === chainId)?.name).toBe('Test Chain');
  });

  it('should delete a chain', () => {
    const chainId = store.getState().createChain('To Delete');
    const initialCount = store.getState().chains.length;
    
    store.getState().deleteChain(chainId);
    const state = store.getState();
    
    expect(state.chains.length).toBe(initialCount - 1);
    expect(state.chains.find(c => c.id === chainId)).toBeUndefined();
  });

  it('should add pattern to chain', () => {
    const chainId = store.getState().createChain('Test Chain');
    const patternId = 'pattern-1';
    
    store.getState().addPatternToChain(chainId, patternId);
    const chain = store.getState().getChainById(chainId);
    
    expect(chain?.patterns).toContain(patternId);
  });

  it('should remove pattern from chain', () => {
    const chainId = store.getState().createChain('Test Chain');
    const patternId = 'pattern-1';
    
    store.getState().addPatternToChain(chainId, patternId);
    store.getState().removePatternFromChain(chainId, patternId);
    const chain = store.getState().getChainById(chainId);
    
    expect(chain?.patterns).not.toContain(patternId);
  });

  it('should advance chain index', () => {
    const chainId = store.getState().createChain('Test Chain');
    store.getState().addPatternToChain(chainId, 'pattern-1');
    store.getState().addPatternToChain(chainId, 'pattern-2');
    store.getState().setCurrentChain(chainId);
    
    const initialIndex = store.getState().getCurrentChain()?.currentIndex;
    store.getState().advanceChain();
    const newIndex = store.getState().getCurrentChain()?.currentIndex;
    
    expect(newIndex).toBe(initialIndex! + 1);
  });

  it('should loop chain when enabled', () => {
    const chainId = store.getState().createChain('Test Chain');
    store.getState().addPatternToChain(chainId, 'pattern-1');
    store.getState().addPatternToChain(chainId, 'pattern-2');
    store.getState().setCurrentChain(chainId);
    
    // Advance to end
    store.getState().advanceChain();
    store.getState().advanceChain();
    
    // Should loop back to 0
    store.getState().advanceChain();
    const index = store.getState().getCurrentChain()?.currentIndex;
    
    expect(index).toBe(0);
  });

  it('should not loop chain when disabled', () => {
    const chainId = store.getState().createChain('Test Chain');
    store.getState().addPatternToChain(chainId, 'pattern-1');
    store.getState().addPatternToChain(chainId, 'pattern-2');
    store.getState().setChainLoop(chainId, false);
    store.getState().setCurrentChain(chainId);
    
    // Advance to end
    store.getState().advanceChain();
    store.getState().advanceChain();
    
    // Should stay at last index
    store.getState().advanceChain();
    const chain = store.getState().getCurrentChain();
    const index = chain?.currentIndex;
    
    expect(index).toBe(1); // Last index
  });

  it('should check if pattern is in any chain', () => {
    const chainId = store.getState().createChain('Test Chain');
    const patternId = 'pattern-1';
    
    expect(store.getState().isPatternInChain(patternId)).toBe(false);
    
    store.getState().addPatternToChain(chainId, patternId);
    
    expect(store.getState().isPatternInChain(patternId)).toBe(true);
  });
});

describe('PATTERN_CHAIN_PRESETS', () => {
  it('should have Basic 4 preset', () => {
    expect(PATTERN_CHAIN_PRESETS).toHaveProperty('Basic 4');
  });

  it('should have Basic 8 preset', () => {
    expect(PATTERN_CHAIN_PRESETS).toHaveProperty('Basic 8');
  });

  it('should have Intro-Verse-Chorus preset', () => {
    expect(PATTERN_CHAIN_PRESETS).toHaveProperty('Intro-Verse-Chorus');
  });
});

describe('applyPatternChainPreset', () => {
  it('should create a new chain with preset configuration', () => {
    const mockStore = {
      getState: () => ({
        chains: [],
        currentChainId: null,
        isChaining: false
      }),
      setState: vi.fn()
    };
    
    const patternIds = ['p1', 'p2', 'p3', 'p4'];
    applyPatternChainPreset(mockStore as any, 'Basic 4', patternIds);
    
    expect(mockStore.setState).toHaveBeenCalled();
  });
});
