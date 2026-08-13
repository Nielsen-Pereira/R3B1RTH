import { describe, it, expect } from 'vitest';
import {
  shiftPattern,
  randomizePattern,
  applyAccents,
  applyAdvancedFeatures,
  createShiftPreview,
  getValidShiftAmounts,
  hasAccents,
  countAccents,
  getAccentDistribution,
} from '../sequencerUtils';
import { Pattern, PatternStep } from '../../types/audio';
import { DEFAULT_SHIFT_OPTIONS, DEFAULT_RANDOMIZE_OPTIONS, DEFAULT_ACCENT_OPTIONS } from '../../types/sequencerTypes';

const createTestPattern = (length = 16, activeSteps: number[] = []): Pattern => ({
  id: 'test-pattern',
  name: 'Test Pattern',
  type: 'TB303',
  steps: Array(length).fill(null).map((_, i) => ({
    active: activeSteps.includes(i),
    accent: false,
    slide: false,
    note: i % 2 === 0 ? 0 : undefined,
  })),
  length,
});

describe('sequencerUtils', () => {
  describe('shiftPattern', () => {
    it('should shift pattern right by default', () => {
      const pattern = createTestPattern(4, [0, 1]);
      const result = shiftPattern(pattern, DEFAULT_SHIFT_OPTIONS);

      expect(result.steps[1].active).toBe(true);
      expect(result.steps[2].active).toBe(true);
      expect(result.steps[0].active).toBe(false);
      expect(result.steps[3].active).toBe(false);
    });

    it('should shift pattern left', () => {
      const pattern = createTestPattern(4, [2, 3]);
      const result = shiftPattern(pattern, {
        ...DEFAULT_SHIFT_OPTIONS,
        direction: 'left',
        amount: 1,
      });

      expect(result.steps[1].active).toBe(true);
      expect(result.steps[2].active).toBe(true);
    });

    it('should wrap around when wrap is true', () => {
      const pattern = createTestPattern(4, [0]);
      const result = shiftPattern(pattern, {
        ...DEFAULT_SHIFT_OPTIONS,
        direction: 'right',
        amount: 3,
        wrap: true,
      });

      expect(result.steps[3].active).toBe(true);
    });

    it('should not wrap when wrap is false', () => {
      const pattern = createTestPattern(4, [0]);
      const result = shiftPattern(pattern, {
        ...DEFAULT_SHIFT_OPTIONS,
        direction: 'right',
        amount: 3,
        wrap: false,
      });

      expect(result.steps[3].active).toBe(false);
      expect(result.steps[0].active).toBe(false);
    });
  });

  describe('randomizePattern', () => {
    it('should randomize pattern steps', () => {
      const pattern = createTestPattern(4, [0, 1, 2, 3]);
      const result = randomizePattern(pattern, DEFAULT_RANDOMIZE_OPTIONS);

      expect(result.steps.length).toBe(4);
      expect(result).not.toEqual(pattern);
    });

    it('should respect probability', () => {
      const pattern = createTestPattern(100, Array.from({ length: 100 }, (_, i) => i));
      const result = randomizePattern(pattern, {
        ...DEFAULT_RANDOMIZE_OPTIONS,
        probability: 0,
      });

      expect(result).toEqual(pattern);
    });

    it('should add accents when includeAccents is true', () => {
      const pattern = createTestPattern(4);
      const result = randomizePattern(pattern, {
        ...DEFAULT_RANDOMIZE_OPTIONS,
        probability: 1,
        includeAccents: true,
      });

      expect(result.steps.some((step) => step.accent)).toBe(true);
    });
  });

  describe('applyAccents', () => {
    it('should apply accents to pattern', () => {
      const pattern = createTestPattern(4, [0, 1, 2, 3]);
      pattern.steps[0].accent = true;
      pattern.steps[0].velocity = 0.8;

      const result = applyAccents(pattern, DEFAULT_ACCENT_OPTIONS);

      expect(result.steps[0].velocity).toBeGreaterThan(0.8);
    });

    it('should not modify non-accented steps', () => {
      const pattern = createTestPattern(4, [0, 1]);
      pattern.steps[0].velocity = 0.8;

      const result = applyAccents(pattern, DEFAULT_ACCENT_OPTIONS);

      expect(result.steps[0].velocity).toBe(0.8);
    });
  });

  describe('applyAdvancedFeatures', () => {
    it('should apply all features', () => {
      const pattern = createTestPattern(4, [0, 1]);
      const result = applyAdvancedFeatures(
        pattern,
        DEFAULT_SHIFT_OPTIONS,
        DEFAULT_RANDOMIZE_OPTIONS,
        DEFAULT_ACCENT_OPTIONS
      );

      expect(result).toBeDefined();
      expect(result.steps.length).toBe(4);
    });

    it('should skip null options', () => {
      const pattern = createTestPattern(4, [0, 1]);
      const result = applyAdvancedFeatures(
        pattern,
        null,
        null,
        null
      );

      expect(result).toEqual(pattern);
    });
  });

  describe('createShiftPreview', () => {
    it('should create preview with positive shift', () => {
      const pattern = createTestPattern(4, [0]);
      const result = createShiftPreview(pattern, 2);

      expect(result.steps[2].active).toBe(true);
    });

    it('should create preview with negative shift', () => {
      const pattern = createTestPattern(4, [2]);
      const result = createShiftPreview(pattern, -1);

      expect(result.steps[1].active).toBe(true);
    });
  });

  describe('getValidShiftAmounts', () => {
    it('should return valid amounts for pattern length', () => {
      const amounts = getValidShiftAmounts(16);
      expect(amounts).toEqual(Array.from({ length: 15 }, (_, i) => i + 1));
    });

    it('should cap at pattern length - 1', () => {
      const amounts = getValidShiftAmounts(5);
      expect(amounts).toEqual([1, 2, 3, 4]);
    });
  });

  describe('hasAccents', () => {
    it('should return true when pattern has accents', () => {
      const pattern = createTestPattern(4);
      pattern.steps[0].accent = true;
      expect(hasAccents(pattern)).toBe(true);
    });

    it('should return false when pattern has no accents', () => {
      const pattern = createTestPattern(4);
      expect(hasAccents(pattern)).toBe(false);
    });
  });

  describe('countAccents', () => {
    it('should count accented steps', () => {
      const pattern = createTestPattern(4);
      pattern.steps[0].accent = true;
      pattern.steps[2].accent = true;
      expect(countAccents(pattern)).toBe(2);
    });
  });

  describe('getAccentDistribution', () => {
    it('should return accent distribution', () => {
      const pattern = createTestPattern(4);
      pattern.steps[0].accent = true;
      pattern.steps[1].accent = true;

      const distribution = getAccentDistribution(pattern);
      expect(distribution.positions).toEqual([0, 1]);
      expect(distribution.count).toBe(2);
      expect(distribution.percentage).toBe(50);
    });
  });
});