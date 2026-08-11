// Sequencer Utilities for R3B1RTH
// Advanced features: Shift, Random, Accents
// Based on ReBirth RB-338 specifications

import { Pattern, PatternStep, TB303Pattern, DrumPattern } from '../types/audio';
import { ShiftOptions, RandomizeOptions, AccentOptions } from '../types/sequencerTypes';

/**
 * Shift pattern steps left or right
 * @param pattern - The pattern to shift
 * @param options - Shift options (direction, amount, wrap)
 * @returns A new pattern with shifted steps
 */
export const shiftPattern = (
  pattern: Pattern,
  options: ShiftOptions
): Pattern => {
  const { direction, amount, wrap } = options;
  const normalizedAmount = Math.max(1, Math.min(15, Math.abs(amount)));
  const shift = direction === 'right' ? normalizedAmount : -normalizedAmount;

  const newSteps = [...pattern.steps];
  
  for (let i = 0; i < pattern.length; i++) {
    const targetIndex = (i + shift) % pattern.length;
    const actualTargetIndex = wrap 
      ? (targetIndex + pattern.length) % pattern.length 
      : Math.max(0, Math.min(pattern.length - 1, targetIndex));
    
    newSteps[actualTargetIndex] = { ...pattern.steps[i] };
  }

  return {
    ...pattern,
    steps: newSteps,
  };
};

/**
 * Randomize pattern steps
 * @param pattern - The pattern to randomize
 * @param options - Randomization options
 * @returns A new pattern with randomized steps
 */
export const randomizePattern = (
  pattern: Pattern,
  options: RandomizeOptions
): Pattern => {
  const { probability, includeNotes, includeAccents, includeSlides, includeVelocity } = options;

  const newSteps = pattern.steps.map((step) => {
    const shouldRandomize = Math.random() < probability;
    
    if (!shouldRandomize) {
      return { ...step };
    }

    const newStep: PatternStep = { ...step };

    // Randomize active state
    newStep.active = Math.random() < 0.5;

    // Randomize note (for TB-303)
    if (includeNotes && 'note' in pattern && pattern.type === 'TB303') {
      const notes = [0, 2, 4, 5, 7, 9, 11]; // C major scale
      newStep.note = newStep.active ? notes[Math.floor(Math.random() * notes.length)] : undefined;
    }

    // Randomize accent
    if (includeAccents) {
      newStep.accent = Math.random() < 0.3; // 30% chance of accent
    }

    // Randomize slide
    if (includeSlides) {
      newStep.slide = Math.random() < 0.2; // 20% chance of slide
    }

    // Randomize velocity
    if (includeVelocity) {
      newStep.velocity = newStep.active ? 0.5 + Math.random() * 0.5 : undefined; // 0.5-1.0
    }

    return newStep;
  });

  return {
    ...pattern,
    steps: newSteps,
  };
};

/**
 * Apply accent to a pattern
 * In ReBirth, accents affect both volume and timbre (filter cutoff for TB-303)
 * @param pattern - The pattern to apply accents to
 * @param options - Accent options
 * @returns A new pattern with accents applied
 */
export const applyAccents = (
  pattern: Pattern,
  options: AccentOptions
): Pattern => {
  const { accentLevel, accentAffectsCutoff, accentAffectsVolume, accentVolumeBoost } = options;

  const newSteps = pattern.steps.map((step) => {
    const newStep = { ...step };

    if (newStep.accent) {
      // Apply accent effects
      if (accentAffectsVolume) {
        // Boost velocity for accented steps
        newStep.velocity = (newStep.velocity || 0.8) * (1 + accentVolumeBoost);
      }

      // Note: For TB-303, accentAffectsCutoff would be handled in the audio engine
      // by applying a higher cutoff value when the accent flag is set
    }

    return newStep;
  });

  return {
    ...pattern,
    steps: newSteps,
  };
};

/**
 * Apply all advanced features to a pattern
 * @param pattern - The pattern to process
 * @param shiftOptions - Shift options (null to skip)
 * @param randomizeOptions - Randomize options (null to skip)
 * @param accentOptions - Accent options (null to skip)
 * @returns A new pattern with all features applied
 */
export const applyAdvancedFeatures = (
  pattern: Pattern,
  shiftOptions: ShiftOptions | null,
  randomizeOptions: RandomizeOptions | null,
  accentOptions: AccentOptions | null
): Pattern => {
  let result = { ...pattern };

  if (shiftOptions) {
    result = shiftPattern(result, shiftOptions);
  }

  if (randomizeOptions) {
    result = randomizePattern(result, randomizeOptions);
  }

  if (accentOptions) {
    result = applyAccents(result, accentOptions);
  }

  return result;
};

/**
 * Create a shifted version of a pattern for preview
 * @param pattern - The original pattern
 * @param shiftAmount - Amount to shift (positive or negative)
 * @returns A preview pattern with the shift applied
 */
export const createShiftPreview = (
  pattern: Pattern,
  shiftAmount: number
): Pattern => {
  return shiftPattern(pattern, {
    direction: shiftAmount > 0 ? 'right' : 'left',
    amount: Math.abs(shiftAmount),
    wrap: true,
  });
};

/**
 * Get all possible shift amounts for a pattern
 * @param patternLength - The length of the pattern
 * @returns Array of valid shift amounts (1-15)
 */
export const getValidShiftAmounts = (patternLength: number): number[] => {
  const maxShift = Math.min(15, patternLength - 1);
  return Array.from({ length: maxShift }, (_, i) => i + 1);
};

/**
 * Check if a pattern has any accented steps
 * @param pattern - The pattern to check
 * @returns True if the pattern has accented steps
 */
export const hasAccents = (pattern: Pattern): boolean => {
  return pattern.steps.some((step) => step.accent);
};

/**
 * Count accented steps in a pattern
 * @param pattern - The pattern to count
 * @returns Number of accented steps
 */
export const countAccents = (pattern: Pattern): number => {
  return pattern.steps.filter((step) => step.accent).length;
};

/**
 * Get accent distribution in a pattern
 * @param pattern - The pattern to analyze
 * @returns Object with accent positions and count
 */
export const getAccentDistribution = (pattern: Pattern) => {
  const positions: number[] = [];
  pattern.steps.forEach((step, index) => {
    if (step.accent) {
      positions.push(index);
    }
  });
  
  return {
    positions,
    count: positions.length,
    percentage: (positions.length / pattern.length) * 100,
  };
};