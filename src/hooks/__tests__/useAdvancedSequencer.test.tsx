import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useAdvancedSequencer } from '../useAdvancedSequencer';
import { Pattern } from '../../types/audio';

// Helper to create a test pattern
const createTestPattern = (length = 16): Pattern => ({
  id: 'test-pattern',
  name: 'Test Pattern',
  type: 'TB303',
  steps: Array(length).fill(null).map(() => ({ active: false })),
  length,
});

describe('useAdvancedSequencer Hook', () => {
  const pattern = createTestPattern(4);
  pattern.steps = [
    { active: true },
    { active: false },
    { active: true },
    { active: false },
  ];

  const onPatternChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('initialization', () => {
    it('should initialize with default options', () => {
      const { result } = renderHook(() =>
        useAdvancedSequencer({ pattern, onPatternChange })
      );

      expect(result.current.shiftOptions).toEqual({
        direction: 'right',
        amount: 1,
        wrap: true,
      });

      expect(result.current.randomizeOptions).toEqual({
        probability: 0.5,
        includeNotes: true,
        includeAccents: true,
        includeSlides: true,
        includeVelocity: true,
      });

      expect(result.current.accentOptions).toEqual({
        accentLevel: 0.5,
        accentAffectsCutoff: true,
        accentAffectsVolume: true,
        accentVolumeBoost: 0.3,
      });

      expect(result.current.isShiftPreviewActive).toBe(false);
    });
  });

  describe('shiftPattern', () => {
    it('should shift pattern and call onPatternChange', () => {
      const { result } = renderHook(() =>
        useAdvancedSequencer({ pattern, onPatternChange })
      );

      act(() => {
        result.current.shiftPattern();
      });

      expect(onPatternChange).toHaveBeenCalledTimes(1);
      const newPattern = onPatternChange.mock.calls[0][0];
      expect(newPattern).toBeDefined();
      expect(newPattern.steps.length).toBe(4);
    });

    it('should shift with custom options', () => {
      const { result } = renderHook(() =>
        useAdvancedSequencer({ pattern, onPatternChange })
      );

      act(() => {
        result.current.shiftPattern({
          direction: 'left',
          amount: 2,
          wrap: false,
        });
      });

      expect(onPatternChange).toHaveBeenCalledTimes(1);
      expect(result.current.shiftOptions.direction).toBe('left');
      expect(result.current.shiftOptions.amount).toBe(2);
    });
  });

  describe('randomizePattern', () => {
    it('should randomize pattern and call onPatternChange', () => {
      const { result } = renderHook(() =>
        useAdvancedSequencer({ pattern, onPatternChange })
      );

      act(() => {
        result.current.randomizePattern();
      });

      expect(onPatternChange).toHaveBeenCalledTimes(1);
    });

    it('should randomize with custom options', () => {
      const { result } = renderHook(() =>
        useAdvancedSequencer({ pattern, onPatternChange })
      );

      act(() => {
        result.current.randomizePattern({
          probability: 0.8,
        });
      });

      expect(onPatternChange).toHaveBeenCalledTimes(1);
      expect(result.current.randomizeOptions.probability).toBe(0.8);
    });
  });

  describe('applyAccents', () => {
    it('should apply accents and call onPatternChange', () => {
      const { result } = renderHook(() =>
        useAdvancedSequencer({ pattern, onPatternChange })
      );

      act(() => {
        result.current.applyAccents();
      });

      expect(onPatternChange).toHaveBeenCalledTimes(1);
    });

    it('should apply accents with custom options', () => {
      const { result } = renderHook(() =>
        useAdvancedSequencer({ pattern, onPatternChange })
      );

      act(() => {
        result.current.applyAccents({
          accentLevel: 0.8,
        });
      });

      expect(onPatternChange).toHaveBeenCalledTimes(1);
      expect(result.current.accentOptions.accentLevel).toBe(0.8);
    });
  });

  describe('shift preview', () => {
    it('should show shift preview', () => {
      const { result } = renderHook(() =>
        useAdvancedSequencer({ pattern, onPatternChange })
      );

      act(() => {
        result.current.showShiftPreview(2);
      });

      expect(result.current.isShiftPreviewActive).toBe(true);
      expect(result.current.shiftPreviewPattern).toBeDefined();
    });

    it('should hide shift preview', () => {
      const { result } = renderHook(() =>
        useAdvancedSequencer({ pattern, onPatternChange })
      );

      act(() => {
        result.current.showShiftPreview(2);
        result.current.hideShiftPreview();
      });

      expect(result.current.isShiftPreviewActive).toBe(false);
      expect(result.current.shiftPreviewPattern).toBe(null);
    });
  });

  describe('option setters', () => {
    it('should set shift options', () => {
      const { result } = renderHook(() =>
        useAdvancedSequencer({ pattern, onPatternChange })
      );

      act(() => {
        result.current.setShiftOptions({
          direction: 'left',
          amount: 3,
        });
      });

      expect(result.current.shiftOptions.direction).toBe('left');
      expect(result.current.shiftOptions.amount).toBe(3);
      expect(result.current.shiftOptions.wrap).toBe(true);
    });

    it('should set randomize options', () => {
      const { result } = renderHook(() =>
        useAdvancedSequencer({ pattern, onPatternChange })
      );

      act(() => {
        result.current.setRandomizeOptions({
          probability: 0.7,
          includeNotes: false,
        });
      });

      expect(result.current.randomizeOptions.probability).toBe(0.7);
      expect(result.current.randomizeOptions.includeNotes).toBe(false);
    });

    it('should set accent options', () => {
      const { result } = renderHook(() =>
        useAdvancedSequencer({ pattern, onPatternChange })
      );

      act(() => {
        result.current.setAccentOptions({
          accentLevel: 0.9,
          accentAffectsCutoff: false,
        });
      });

      expect(result.current.accentOptions.accentLevel).toBe(0.9);
      expect(result.current.accentOptions.accentAffectsCutoff).toBe(false);
    });
  });

  describe('resets', () => {
    it('should reset shift options', () => {
      const { result } = renderHook(() =>
        useAdvancedSequencer({ pattern, onPatternChange })
      );

      act(() => {
        result.current.setShiftOptions({
          direction: 'left',
          amount: 5,
        });
        result.current.resetShiftOptions();
      });

      expect(result.current.shiftOptions).toEqual({
        direction: 'right',
        amount: 1,
        wrap: true,
      });
    });

    it('should reset randomize options', () => {
      const { result } = renderHook(() =>
        useAdvancedSequencer({ pattern, onPatternChange })
      );

      act(() => {
        result.current.setRandomizeOptions({
          probability: 0.2,
        });
        result.current.resetRandomizeOptions();
      });

      expect(result.current.randomizeOptions).toEqual({
        probability: 0.5,
        includeNotes: true,
        includeAccents: true,
        includeSlides: true,
        includeVelocity: true,
      });
    });

    it('should reset accent options', () => {
      const { result } = renderHook(() =>
        useAdvancedSequencer({ pattern, onPatternChange })
      );

      act(() => {
        result.current.setAccentOptions({
          accentLevel: 0.1,
        });
        result.current.resetAccentOptions();
      });

      expect(result.current.accentOptions).toEqual({
        accentLevel: 0.5,
        accentAffectsCutoff: true,
        accentAffectsVolume: true,
        accentVolumeBoost: 0.3,
      });
    });

    it('should reset all options', () => {
      const { result } = renderHook(() =>
        useAdvancedSequencer({ pattern, onPatternChange })
      );

      act(() => {
        result.current.setShiftOptions({ amount: 5 });
        result.current.setRandomizeOptions({ probability: 0.2 });
        result.current.setAccentOptions({ accentLevel: 0.1 });
        result.current.resetAllOptions();
      });

      expect(result.current.shiftOptions.amount).toBe(1);
      expect(result.current.randomizeOptions.probability).toBe(0.5);
      expect(result.current.accentOptions.accentLevel).toBe(0.5);
    });
  });
});