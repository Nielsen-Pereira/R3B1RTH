// Sequencer Utilities for R3B1RTH
// Advanced features: Shift, Random, Accents

import { Pattern, PatternStep, TB303Pattern, DrumPattern } from '../types/audio';
import { ShiftOptions, RandomizeOptions, AccentOptions } from '../types/sequencerTypes';

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
    newStep.active = Math.random() < 0.5;

    if (includeNotes && 'note' in pattern && pattern.type === 'TB303') {
      const notes = [0, 2, 4, 5, 7, 9, 11];
      newStep.note = newStep.active ? notes[Math.floor(Math.random() * notes.length)] : undefined;
    }

    if (includeAccents) {
      newStep.accent = Math.random() < 0.3;
    }

    if (includeSlides) {
      newStep.slide = Math.random() < 0.2;
    }

    if (includeVelocity) {
      newStep.velocity = newStep.active ? 0.5 + Math.random() * 0.5 : undefined;
    }

    return newStep;
  });

  return {
    ...pattern,
    steps: newSteps,
  };
};

export const applyAccents = (
  pattern: Pattern,
  options: AccentOptions
): Pattern => {
  const { accentLevel, accentAffectsCutoff, accentAffectsVolume, accentVolumeBoost } = options;

  const newSteps = pattern.steps.map((step) => {
    const newStep = { ...step };

    if (newStep.accent) {
      if (accentAffectsVolume) {
        newStep.velocity = (newStep.velocity || 0.8) * (1 + accentVolumeBoost);
      }
    }

    return newStep;
  });

  return {
    ...pattern,
    steps: newSteps,
  };
};

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

export const getValidShiftAmounts = (patternLength: number): number[] => {
  const maxShift = Math.min(15, patternLength - 1);
  return Array.from({ length: maxShift }, (_, i) => i + 1);
};

export const hasAccents = (pattern: Pattern): boolean => {
  return pattern.steps.some((step) => step.accent);
};

export const countAccents = (pattern: Pattern): number => {
  return pattern.steps.filter((step) => step.accent).length;
};

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