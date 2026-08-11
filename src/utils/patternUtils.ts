/**
 * Pattern Utilities - Batch 1 Development
 * R3B-90 to R3B-94: Song Mode Implementation
 * 
 * Utility functions for pattern manipulation
 */

import type { Pattern, PatternStep, InstrumentType } from '../types';

// Pattern Creation
export const createEmptyPattern = (
  instrument: InstrumentType,
  length: number = 16
): Pattern => ({
  id: Date.now().toString(),
  name: instrument.toUpperCase() + ' Pattern ' + Date.now(),
  instrument,
  steps: Array.from({ length }, (_, i) => ({
    id: i,
    active: false,
    accent: false,
    slide: false,
    value: 0,
  })),
  length,
  swing: 0,
  shuffle: 0,
});

export const createPatternFromString = (
  instrument: InstrumentType,
  patternString: string
): Pattern => {
  const length = patternString.length;
  const steps = patternString.split('').map((char, i) => ({
    id: i,
    active: char === 'x' || char === 'X',
    accent: char === 'X',
    slide: false,
    value: (char === 'x' || char === 'X') ? 1 : 0,
  }));

  return {
    id: Date.now().toString(),
    name: instrument.toUpperCase() + ' Pattern',
    instrument,
    steps,
    length,
    swing: 0,
    shuffle: 0,
  };
};

// Pattern Manipulation
export const toggleStep = (pattern: Pattern, stepId: number): Pattern => ({
  ...pattern,
  steps: pattern.steps.map(step =>
    step.id === stepId ? { ...step, active: !step.active } : step
  ),
});

export const toggleAccent = (pattern: Pattern, stepId: number): Pattern => ({
  ...pattern,
  steps: pattern.steps.map(step =>
    step.id === stepId ? { ...step, accent: !step.accent } : step
  ),
});

export const toggleSlide = (pattern: Pattern, stepId: number): Pattern => ({
  ...pattern,
  steps: pattern.steps.map((step, i) =>
    step.id === stepId ? { ...step, slide: !step.slide } : step
  ),
});

export const setStepValue = (pattern: Pattern, stepId: number, value: number): Pattern => ({
  ...pattern,
  steps: pattern.steps.map(step =>
    step.id === stepId ? { ...step, value: Math.max(0, Math.min(1, value)) } : step
  ),
});

// Pattern Transformation
export const rotatePattern = (pattern: Pattern, positions: number): Pattern => {
  const normalized = ((positions % pattern.length) + pattern.length) % pattern.length;
  const rotatedSteps = [...pattern.steps];
  for (let i = 0; i < normalized; i++) {
    const first = rotatedSteps.shift();
    if (first) rotatedSteps.push(first);
  }
  return {
    ...pattern,
    steps: rotatedSteps.map((step, i) => ({ ...step, id: i })),
  };
};

export const reversePattern = (pattern: Pattern): Pattern => ({
  ...pattern,
  steps: [...pattern.steps].reverse().map((step, i) => ({ ...step, id: i })),
});

export const invertPattern = (pattern: Pattern): Pattern => ({
  ...pattern,
  steps: pattern.steps.map(step => ({ ...step, active: !step.active })),
});

// Pattern Analysis
export const countActiveSteps = (pattern: Pattern): number =>
  pattern.steps.filter(step => step.active).length;

export const isPatternEmpty = (pattern: Pattern): boolean =>
  countActiveSteps(pattern) === 0;

export const isPatternFull = (pattern: Pattern): boolean =>
  countActiveSteps(pattern) === pattern.length;

export const getPatternDensity = (pattern: Pattern): number =>
  countActiveSteps(pattern) / pattern.length;

// Pattern Comparison
export const arePatternsEqual = (a: Pattern, b: Pattern): boolean => {
  if (a.length !== b.length) return false;
  return a.steps.every((step, i) => {
    const otherStep = b.steps[i];
    return (
      step.active === otherStep.active &&
      step.accent === otherStep.accent &&
      step.slide === otherStep.slide &&
      step.value === otherStep.value
    );
  });
};

export const isPatternRotation = (a: Pattern, b: Pattern): boolean => {
  if (a.length !== b.length) return false;
  if (arePatternsEqual(a, b)) return true;
  for (let i = 1; i < a.length; i++) {
    const rotated = rotatePattern(a, i);
    if (arePatternsEqual(rotated, b)) return true;
  }
  return false;
};

// Pattern Validation
export const validatePatternLength = (length: number): boolean =>
  length >= 1 && length <= 32;

export const validateSwing = (swing: number): boolean =>
  swing >= -100 && swing <= 100;

export const validateShuffle = (shuffle: number): boolean =>
  shuffle >= 0 && shuffle <= 100;

export const validatePattern = (pattern: Pattern): boolean => {
  if (!validatePatternLength(pattern.length)) return false;
  if (!validateSwing(pattern.swing)) return false;
  if (!validateShuffle(pattern.shuffle)) return false;
  return pattern.steps.every(step => step.value >= 0 && step.value <= 1);
};
