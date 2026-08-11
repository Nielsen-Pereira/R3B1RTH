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
import { ShiftOptions, RandomizeOptions, AccentOptions } from '../../types/sequencerTypes';

// Helper to create a test pattern
const createTestPattern = (length = 16): Pattern => ({
  id: 'test-pattern',
  name: 'Test Pattern',
  type: 'TB303',
  steps: Array(length).fill(null).map(() => ({ active: false })),
  length,
});

describe('Sequencer Utils', () => {
  describe('shiftPattern', () => {
    it('should shift pattern steps to the right', () => {
      const pattern = createTestPattern(4);
      pattern.steps = [
        { active: true },
        { active: false },
        { active: false },
        { active: false },
      ];

      const options: ShiftOptions = {
        direction: 'right',
        amount: 1,
        wrap: false,
      };

      const result = shiftPattern(pattern, options);

      expect(result.steps[1].active).toBe(true);
      expect(result.steps[0].active).toBe(false);
    });

    it('should shift pattern steps to the left', () => {
      const pattern = createTestPattern(4);
      pattern.steps = [
        { active: false },
        { active: true },
        { active: false },
        { active: false },
      ];

      const options: ShiftOptions = {
        direction: 'left',
        amount: 1,
        wrap: false,
      };

      const result = shiftPattern(pattern, options);

      expect(result.steps[0].active).toBe(true);
      expect(result.steps[1].active).toBe(false);
    });

    it('should wrap around when wrap is true', () => {
      const pattern = createTestPattern(4);
      pattern.steps = [
        { active: true },
        { active: false },
        { active: false },
        { active: false },
      ];

      const options: ShiftOptions = {
        direction: 'right',
        amount: 3,
        wrap: true,
      };

      const result = shiftPattern(pattern, options);

      expect(result.steps[3].active).toBe(true);
      expect(result.steps[0].active).toBe(false);
    });
  });

  describe('randomizePattern', () => {
    it('should randomize pattern steps based on probability', () => {
      const pattern = createTestPattern(4);
      pattern.steps = [
        { active: true },
        { active: true },
        { active: true },
        { active: true },
      ];

      const options: RandomizeOptions = {
        probability: 1.0,
        includeNotes: false,
        includeAccents: false,
        includeSlides: false,
        includeVelocity: false,
      };

      const result = randomizePattern(pattern, options);

      const activeCount = result.steps.filter(s => s.active).length;
      expect(activeCount).toBeLessThan(4);
    });

    it('should respect probability of 0', () => {
      const pattern = createTestPattern(4);
      pattern.steps = [
        { active: true },
        { active: false },
        { active: true },
        { active: false },
      ];

      const options: RandomizeOptions = {
        probability: 0.0,
        includeNotes: false,
        includeAccents: false,
        includeSlides: false,
        includeVelocity: false,
      };

      const result = randomizePattern(pattern, options);

      expect(result.steps[0].active).toBe(true);
      expect(result.steps[1].active).toBe(false);
    });

    it('should add accents when includeAccents is true', () => {
      const pattern = createTestPattern(4);

      const options: RandomizeOptions = {
        probability: 1.0,
        includeNotes: false,
        includeAccents: true,
        includeSlides: false,
        includeVelocity: false,
      };

      const result = randomizePattern(pattern, options);

      const hasAccents = result.steps.some(s => s.accent === true);
      expect(hasAccents).toBe(true);
    });
  });

  describe('applyAccents', () => {
    it('should boost velocity for accented steps', () => {
      const pattern = createTestPattern(4);
      pattern.steps = [
        { active: true, accent: true, velocity: 0.8 },
        { active: true, accent: false, velocity: 0.8 },
        { active: true, accent: true, velocity: 0.8 },
        { active: false },
      ];

      const options: AccentOptions = {
        accentLevel: 0.5,
        accentAffectsCutoff: false,
        accentAffectsVolume: true,
        accentVolumeBoost: 0.3,
      };

      const result = applyAccents(pattern, options);

      expect(result.steps[0].velocity).toBeGreaterThan(0.8);
      expect(result.steps[2].velocity).toBeGreaterThan(0.8);
      expect(result.steps[1].velocity).toBe(0.8);
    });
  });

  describe('getValidShiftAmounts', () => {
    it('should return valid amounts for pattern length', () => {
      const amounts = getValidShiftAmounts(16);
      expect(amounts).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15]);
    });

    it('should cap at pattern length - 1', () => {
      const amounts = getValidShiftAmounts(5);
      expect(amounts).toEqual([1, 2, 3, 4]);
    });
  });

  describe('hasAccents', () => {
    it('should return true if pattern has accents', () => {
      const pattern = createTestPattern(4);
      pattern.steps = [
        { active: true, accent: true },
        { active: true },
      ];

      expect(hasAccents(pattern)).toBe(true);
    });

    it('should return false if pattern has no accents', () => {
      const pattern = createTestPattern(4);
      pattern.steps = [
        { active: true },
        { active: true },
      ];

      expect(hasAccents(pattern)).toBe(false);
    });
  });

  describe('countAccents', () => {
    it('should count accented steps', () => {
      const pattern = createTestPattern(4);
      pattern.steps = [
        { active: true, accent: true },
        { active: true },
        { active: true, accent: true },
        { active: true, accent: true },
      ];

      expect(countAccents(pattern)).toBe(3);
    });
  });

  describe('getAccentDistribution', () => {
    it('should return accent positions and statistics', () => {
      const pattern = createTestPattern(8);
      pattern.steps = [
        { active: true, accent: true },
        { active: true },
        { active: true },
        { active: true, accent: true },
        { active: true },
        { active: true },
        { active: true, accent: true },
        { active: true },
      ];

      const result = getAccentDistribution(pattern);

      expect(result.positions).toEqual([0, 3, 6]);
      expect(result.count).toBe(3);
      expect(result.percentage).toBe(37.5);
    });
  });
});