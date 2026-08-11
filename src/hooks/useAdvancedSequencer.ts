/**
 * Advanced Sequencer Hook - Batch 6
 * R3B-91, R3B-92, R3B-93: Shift, Random, Accents
 * 
 * Custom hook for advanced sequencer features
 */

import { useCallback, useState } from 'react';
import { Pattern, TB303Pattern, DrumPattern } from '../types/audio';
import { 
  ShiftOptions, 
  RandomizeOptions, 
  AccentOptions,
  DEFAULT_SHIFT_OPTIONS,
  DEFAULT_RANDOMIZE_OPTIONS,
  DEFAULT_ACCENT_OPTIONS,
} from '../types/sequencerTypes';
import {
  shiftPattern,
  randomizePattern,
  applyAccents,
  applyAdvancedFeatures,
  createShiftPreview,
} from '../utils/sequencerUtils';

interface AdvancedSequencerState {
  shiftOptions: ShiftOptions;
  randomizeOptions: RandomizeOptions;
  accentOptions: AccentOptions;
  isShiftPreviewActive: boolean;
  shiftPreviewPattern: Pattern | null;
}

interface UseAdvancedSequencerOptions {
  pattern: Pattern;
  onPatternChange?: (pattern: Pattern) => void;
}

interface UseAdvancedSequencerReturn {
  // State
  shiftOptions: ShiftOptions;
  randomizeOptions: RandomizeOptions;
  accentOptions: AccentOptions;
  isShiftPreviewActive: boolean;
  
  // Actions
  shiftPattern: (options?: Partial<ShiftOptions>) => void;
  randomizePattern: (options?: Partial<RandomizeOptions>) => void;
  applyAccents: (options?: Partial<AccentOptions>) => void;
  
  // Preview
  showShiftPreview: (amount: number) => void;
  hideShiftPreview: () => void;
  
  // Options setters
  setShiftOptions: (options: Partial<ShiftOptions>) => void;
  setRandomizeOptions: (options: Partial<RandomizeOptions>) => void;
  setAccentOptions: (options: Partial<AccentOptions>) => void;
  
  // Resets
  resetShiftOptions: () => void;
  resetRandomizeOptions: () => void;
  resetAccentOptions: () => void;
  resetAllOptions: () => void;
}

export const useAdvancedSequencer = (
  options: UseAdvancedSequencerOptions
): UseAdvancedSequencerReturn => {
  const { pattern, onPatternChange } = options;

  const [state, setState] = useState<AdvancedSequencerState>({
    shiftOptions: { ...DEFAULT_SHIFT_OPTIONS },
    randomizeOptions: { ...DEFAULT_RANDOMIZE_OPTIONS },
    accentOptions: { ...DEFAULT_ACCENT_OPTIONS },
    isShiftPreviewActive: false,
    shiftPreviewPattern: null,
  });

  const shiftPatternHandler = useCallback((
    options?: Partial<ShiftOptions>
  ) => {
    const mergedOptions: ShiftOptions = {
      ...state.shiftOptions,
      ...options,
    };

    const newPattern = shiftPattern(pattern, mergedOptions);
    
    if (onPatternChange) {
      onPatternChange(newPattern);
    }

    // Update options if provided
    if (options) {
      setState((prev) => ({
        ...prev,
        shiftOptions: {
          ...prev.shiftOptions,
          ...options,
        },
      }));
    }
  }, [pattern, state.shiftOptions, onPatternChange]);

  const randomizePatternHandler = useCallback((
    options?: Partial<RandomizeOptions>
  ) => {
    const mergedOptions: RandomizeOptions = {
      ...state.randomizeOptions,
      ...options,
    };

    const newPattern = randomizePattern(pattern, mergedOptions);
    
    if (onPatternChange) {
      onPatternChange(newPattern);
    }

    // Update options if provided
    if (options) {
      setState((prev) => ({
        ...prev,
        randomizeOptions: {
          ...prev.randomizeOptions,
          ...options,
        },
      }));
    }
  }, [pattern, state.randomizeOptions, onPatternChange]);

  const applyAccentsHandler = useCallback((
    options?: Partial<AccentOptions>
  ) => {
    const mergedOptions: AccentOptions = {
      ...state.accentOptions,
      ...options,
    };

    const newPattern = applyAccents(pattern, mergedOptions);
    
    if (onPatternChange) {
      onPatternChange(newPattern);
    }

    // Update options if provided
    if (options) {
      setState((prev) => ({
        ...prev,
        accentOptions: {
          ...prev.accentOptions,
          ...options,
        },
      }));
    }
  }, [pattern, state.accentOptions, onPatternChange]);

  const showShiftPreview = useCallback((amount: number) => {
    const previewPattern = createShiftPreview(pattern, amount);
    setState((prev) => ({
      ...prev,
      isShiftPreviewActive: true,
      shiftPreviewPattern: previewPattern,
    }));
  }, [pattern]);

  const hideShiftPreview = useCallback(() => {
    setState((prev) => ({
      ...prev,
      isShiftPreviewActive: false,
      shiftPreviewPattern: null,
    }));
  }, []);

  const setShiftOptions = useCallback((
    options: Partial<ShiftOptions>
  ) => {
    setState((prev) => ({
      ...prev,
      shiftOptions: {
        ...prev.shiftOptions,
        ...options,
      },
    }));
  }, []);

  const setRandomizeOptions = useCallback((
    options: Partial<RandomizeOptions>
  ) => {
    setState((prev) => ({
      ...prev,
      randomizeOptions: {
        ...prev.randomizeOptions,
        ...options,
      },
    }));
  }, []);

  const setAccentOptions = useCallback((
    options: Partial<AccentOptions>
  ) => {
    setState((prev) => ({
      ...prev,
      accentOptions: {
        ...prev.accentOptions,
        ...options,
      },
    }));
  }, []);

  const resetShiftOptions = useCallback(() => {
    setState((prev) => ({
      ...prev,
      shiftOptions: { ...DEFAULT_SHIFT_OPTIONS },
    }));
  }, []);

  const resetRandomizeOptions = useCallback(() => {
    setState((prev) => ({
      ...prev,
      randomizeOptions: { ...DEFAULT_RANDOMIZE_OPTIONS },
    }));
  }, []);

  const resetAccentOptions = useCallback(() => {
    setState((prev) => ({
      ...prev,
      accentOptions: { ...DEFAULT_ACCENT_OPTIONS },
    }));
  }, []);

  const resetAllOptions = useCallback(() => {
    setState((prev) => ({
      ...prev,
      shiftOptions: { ...DEFAULT_SHIFT_OPTIONS },
      randomizeOptions: { ...DEFAULT_RANDOMIZE_OPTIONS },
      accentOptions: { ...DEFAULT_ACCENT_OPTIONS },
    }));
  }, []);

  return {
    // State
    shiftOptions: state.shiftOptions,
    randomizeOptions: state.randomizeOptions,
    accentOptions: state.accentOptions,
    isShiftPreviewActive: state.isShiftPreviewActive,
    
    // Actions
    shiftPattern: shiftPatternHandler,
    randomizePattern: randomizePatternHandler,
    applyAccents: applyAccentsHandler,
    
    // Preview
    showShiftPreview,
    hideShiftPreview,
    
    // Options setters
    setShiftOptions,
    setRandomizeOptions,
    setAccentOptions,
    
    // Resets
    resetShiftOptions,
    resetRandomizeOptions,
    resetAccentOptions,
    resetAllOptions,
  };
};

export default useAdvancedSequencer;