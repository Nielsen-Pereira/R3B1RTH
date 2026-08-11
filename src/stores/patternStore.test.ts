/**
 * Pattern Store Tests - Enhanced for Batch 4
 * R3B-99 to R3B-102, R3B-106, R3B-137: Pattern Copy/Paste/Clone
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { usePatternStore, getCurrentPattern, hasClipboardContent, getClipboardPattern } from '../stores/patternStore';

describe('usePatternStore - Copy/Paste/Clone', () => {
  let store: ReturnType<typeof usePatternStore>;

  beforeEach(() => {
    store = usePatternStore();
    store.getState().reset();
  });

  describe('copyPattern', () => {
    it('should copy pattern to clipboard', () => {
      const state = store.getState();
      const pattern = state.patterns[0];
      
      state.copyPattern(pattern.id);
      
      expect(hasClipboardContent(store.getState())).toBe(true);
      expect(getClipboardPattern(store.getState())?.name).toBe(pattern.name + ' (Copied)');
    });

    it('should not copy if pattern not found', () => {
      store.getState().copyPattern('non-existent-id');
      expect(hasClipboardContent(store.getState())).toBe(false);
    });
  });

  describe('pastePattern', () => {
    it('should paste pattern from clipboard', () => {
      const state = store.getState();
      const pattern = state.patterns[0];
      
      state.copyPattern(pattern.id);
      const initialCount = state.patterns.length;
      
      const newPattern = state.pastePattern();
      
      expect(newPattern).not.toBeNull();
      expect(store.getState().patterns.length).toBe(initialCount + 1);
    });

    it('should paste to specific instrument', () => {
      const state = store.getState();
      const pattern = state.patterns[0];
      
      state.copyPattern(pattern.id);
      const newPattern = state.pastePattern('tr808');
      
      expect(newPattern?.instrument).toBe('tr808');
    });

    it('should return null if clipboard is empty', () => {
      const state = store.getState();
      const result = state.pastePattern();
      expect(result).toBeNull();
    });
  });

  describe('clonePattern', () => {
    it('should clone pattern with new ID', () => {
      const state = store.getState();
      const pattern = state.patterns[0];
      const initialCount = state.patterns.length;
      
      const cloned = state.clonePattern(pattern.id);
      
      expect(cloned.name).toBe(pattern.name + ' (Copy)');
      expect(cloned.id).not.toBe(pattern.id);
      expect(store.getState().patterns.length).toBe(initialCount + 1);
    });

    it('should return first pattern if pattern not found', () => {
      const cloned = store.getState().clonePattern('non-existent-id');
      expect(cloned).toBeDefined();
    });
  });

  describe('clipboard state', () => {
    it('should have null clipboard initially', () => {
      const state = store.getState();
      expect(state.clipboard).toBeNull();
      expect(hasClipboardContent(state)).toBe(false);
    });

    it('should clear clipboard on reset', () => {
      const state = store.getState();
      state.copyPattern(state.patterns[0].id);
      state.reset();
      expect(hasClipboardContent(store.getState())).toBe(false);
    });
  });
});

describe('getClipboardPattern', () => {
  it('should return null when clipboard is empty', () => {
    const state = usePatternStore.getState();
    expect(getClipboardPattern(state)).toBeNull();
  });

  it('should return copied pattern', () => {
    const store = usePatternStore();
    const state = store.getState();
    const pattern = state.patterns[0];
    
    state.copyPattern(pattern.id);
    const clipboardPattern = getClipboardPattern(store.getState());
    
    expect(clipboardPattern).not.toBeNull();
    expect(clipboardPattern?.name).toBe(pattern.name + ' (Copied)');
  });
});

describe('hasClipboardContent', () => {
  it('should return false when clipboard is null', () => {
    const state = usePatternStore.getState();
    expect(hasClipboardContent(state)).toBe(false);
  });

  it('should return true when clipboard has content', () => {
    const store = usePatternStore();
    const state = store.getState();
    state.copyPattern(state.patterns[0].id);
    expect(hasClipboardContent(store.getState())).toBe(true);
  });
});
