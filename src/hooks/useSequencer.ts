import { useEffect, useCallback, useRef } from 'react';
import { useSequencerStore } from '../store/sequencerStore';
import { useAudioStore } from '../store/audioStore';
import { SectionType, Pattern, Step } from '../types/audio';

export const useSequencer = () => {
  const {
    isPlaying,
    isRecording,
    currentStep,
    tempo,
    shuffle,
    mode,
    patterns,
    song,
    loopStart,
    loopEnd,
    play,
    stop,
    setTempo,
    setShuffle,
    setMode,
    nextStep,
    previousStep,
    createPattern,
    setSelectedPattern,
    setPatternLength,
    setStep,
    toggleStep,
    setStepInstrument,
    toggleStepAccent,
    createSong,
    loadSong,
    saveSong,
    setLoop,
    clearLoop,
    resetSequencer,
  } = useSequencerStore();

  const { audioContext, isAudioReady } = useAudioStore();

  const stepInterval = useRef<NodeJS.Timeout | null>(null);
  const lastStepTime = useRef<number>(0);

  const calculateStepDuration = useCallback((bpm: number) => {
    return (60 / bpm) * 1000;
  }, []);

  const advanceStep = useCallback(() => {
    if (isPlaying) {
      const next = (currentStep + 1) % (patternLength['808'] || 16);
      
      if (loopEnd !== null && next > loopEnd) {
        if (loopStart !== null) {
          return loopStart;
        }
      }
      
      if (next === 0) {
        return next;
      }
      return next;
    }
    return currentStep;
  }, [isPlaying, currentStep, patternLength, loopStart, loopEnd]);

  const handleStepAdvance = useCallback(() => {
    if (!isPlaying) return;
    
    const now = Date.now();
    const stepDuration = calculateStepDuration(tempo);
    const elapsed = now - lastStepTime.current;
    
    if (elapsed >= stepDuration) {
      const next = advanceStep();
      lastStepTime.current = now;
      
      if (next !== currentStep) {
        nextStep();
      }
    }
  }, [isPlaying, currentStep, tempo, calculateStepDuration, advanceStep, nextStep]);

  const startStepTimer = useCallback(() => {
    if (stepInterval.current) {
      clearInterval(stepInterval.current);
    }
    
    const stepDuration = calculateStepDuration(tempo);
    lastStepTime.current = Date.now();
    
    stepInterval.current = setInterval(() => {
      handleStepAdvance();
    }, stepDuration * 0.5);
  }, [calculateStepDuration, tempo, handleStepAdvance]);

  const stopStepTimer = useCallback(() => {
    if (stepInterval.current) {
      clearInterval(stepInterval.current);
      stepInterval.current = null;
    }
  }, []);

  useEffect(() => {
    if (isPlaying) {
      startStepTimer();
    } else {
      stopStepTimer();
    }
    
    return () => {
      stopStepTimer();
    };
  }, [isPlaying, startStepTimer, stopStepTimer]);

  const handleTapTempo = useCallback(() => {
    const now = Date.now();
    const stepDuration = calculateStepDuration(tempo);
    
    if (lastStepTime.current === 0) {
      lastStepTime.current = now;
      return;
    }
    
    const elapsed = now - lastStepTime.current;
    const newTempo = 60000 / elapsed;
    
    if (newTempo >= 40 && newTempo <= 300) {
      setTempo(Math.round(newTempo));
    }
    
    lastStepTime.current = now;
  }, [calculateStepDuration, tempo, setTempo]);

  return {
    advanceStep,
    handleTapTempo,
  };
};

export default useSequencer;