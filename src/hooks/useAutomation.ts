/**
 * Automation Recording Hook - Batch 1 Development
 * R3B-90: GAP-001 - Recording Knob Movements (Automation)
 * 
 * Custom hook for recording control knob automation in Song Mode
 */

import { useCallback, useEffect, useRef } from 'react';
import { useSongStore } from '../stores/songStore';
import { useAudioEffectsStore } from '../stores/audioEffectsStore';

export type ControlId = 
  | 'tb303_cutoff'
  | 'tb303_resonance'
  | 'tb303_envMod'
  | 'tb303_decay'
  | 'tb303_accent'
  | 'tr808_volume'
  | 'tr808_tune'
  | 'tr808_attack'
  | 'tr808_decay'
  | 'tr909_volume'
  | 'tr909_tune'
  | 'tr909_attack'
  | 'tr909_decay'
  | 'master_volume'
  | 'tempo';

export type AutomationPoint = {
  timestamp: number;
  value: number;
};

export type AutomationData = Record<ControlId, AutomationPoint[]>;

interface UseAutomationOptions {
  controls: ControlId[];
  sampleRate?: number;
}

interface UseAutomationReturn {
  automationData: AutomationData;
  startRecording: () => void;
  stopRecording: () => void;
  isRecording: boolean;
  clearAutomation: (controlId?: ControlId) => void;
  getAutomationAtTime: (controlId: ControlId, time: number) => number | null;
}

export const useAutomation = (
  options: UseAutomationOptions
): UseAutomationReturn => {
  const { controls, sampleRate = 100 } = options;
  const {
    isRecording: songRecording,
    startRecording: startSongRecording,
    stopRecording: stopSongRecording,
    recordAutomation,
    clearAutomation: clearSongAutomation,
  } = useSongStore();

  const automationRef = useRef<AutomationData>({} as AutomationData);
  const recordingRef = useRef<boolean>(false);
  const startTimeRef = useRef<number>(0);

  // Initialize automation data for tracked controls
  useEffect(() => {
    automationRef.current = controls.reduce((acc, controlId) => {
      acc[controlId] = [];
      return acc;
    }, {} as AutomationData);
  }, [controls]);

  // Record automation when song is recording
  useEffect(() => {
    if (!songRecording) {
      recordingRef.current = false;
      return;
    }

    recordingRef.current = true;
    startTimeRef.current = Date.now();

    const interval = setInterval(() => {
      if (!recordingRef.current) return;
      
      const currentTime = Date.now();
      const elapsed = currentTime - startTimeRef.current;
      
      // In a real implementation, this would capture actual knob values
      // For now, we record the current time as a placeholder
      controls.forEach((controlId) => {
        // This would be replaced with actual value reading from UI controls
        const value = 0.5; // Placeholder
        recordAutomation(controlId, value);
        
        automationRef.current[controlId].push({
          timestamp: elapsed,
          value,
        });
      });
    }, 1000 / sampleRate);

    return () => clearInterval(interval);
  }, [songRecording, controls, sampleRate, recordAutomation]);

  const startRecording = useCallback(() => {
    startSongRecording();
    startTimeRef.current = Date.now();
    recordingRef.current = true;
  }, [startSongRecording]);

  const stopRecording = useCallback(() => {
    stopSongRecording();
    recordingRef.current = false;
  }, [stopSongRecording]);

  const clearAutomation = useCallback((controlId?: ControlId) => {
    if (controlId) {
      clearSongAutomation(controlId);
      automationRef.current[controlId] = [];
    } else {
      controls.forEach((id) => {
        clearSongAutomation(id);
        automationRef.current[id] = [];
      });
    }
  }, [clearSongAutomation, controls]);

  const getAutomationAtTime = useCallback((
    controlId: ControlId,
    time: number
  ): number | null => {
    const points = automationRef.current[controlId];
    if (!points || points.length === 0) return null;

    // Find the closest automation point before or at the given time
    let closest: AutomationPoint | null = null;
    for (const point of points) {
      if (point.timestamp <= time) {
        if (!closest || point.timestamp > closest.timestamp) {
          closest = point;
        }
      }
    }

    return closest?.value ?? null;
  }, []);

  return {
    automationData: automationRef.current,
    startRecording,
    stopRecording,
    isRecording: recordingRef.current,
    clearAutomation,
    getAutomationAtTime,
  };
};

export default useAutomation;
