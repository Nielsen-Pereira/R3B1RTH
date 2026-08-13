/**
 * Automation Recording Hook - Batch 5
 * R3B-90: GAP-001 - Recording Knob Movements (Automation)
 * 
 * Custom hook for recording control knob automation in Song Mode
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { useSongStore } from '../stores/songStore';
import { ControlId, AutomationPoint, AutomationTrack } from '../types/automationTypes';

export interface UseAutomationOptions {
  controls: ControlId[];
  sampleRate?: number;
  songId: string;
}

interface UseAutomationReturn {
  automationData: Record<ControlId, AutomationPoint[]>;
  startRecording: () => void;
  stopRecording: () => void;
  isRecording: boolean;
  clearAutomation: (controlId?: ControlId) => void;
  getAutomationAtTime: (controlId: ControlId, time: number) => number | null;
  getAutomationTrack: (controlId: ControlId) => AutomationTrack | null;
  setControlValue: (controlId: ControlId, value: number) => void;
}

export const useAutomation = (
  options: UseAutomationOptions
): UseAutomationReturn => {
  const { controls, sampleRate = 30, songId } = options;
  const {
    isRecordingAutomation,
    recordingStartTime,
    startAutomationRecording,
    stopAutomationRecording,
    recordAutomation,
    clearAutomation: clearSongAutomation,
    getAutomationForSong,
  } = useSongStore();

  const [automationData, setAutomationData] = useState<Record<ControlId, AutomationPoint[]>>(
    controls.reduce((acc, controlId) => {
      acc[controlId] = [];
      return acc;
    }, {} as Record<ControlId, AutomationPoint[]>) 
  );

  const recordingRef = useRef<boolean>(false);
  const startTimeRef = useRef<number>(0);
  const lastValuesRef = useRef<Record<ControlId, number>>({});

  // Initialize last values
  useEffect(() => {
    lastValuesRef.current = controls.reduce((acc, controlId) => {
      acc[controlId] = 0;
      return acc;
    }, {} as Record<ControlId, number>);
  }, [controls]);

  // Sync automation data from store
  useEffect(() => {
    const fetchAutomation = () => {
      const newData: Record<ControlId, AutomationPoint[]> = {} as Record<ControlId, AutomationPoint[]>;
      controls.forEach((controlId) => {
        newData[controlId] = getAutomationForSong(songId, controlId);
      });
      setAutomationData(newData);
    };
    
    fetchAutomation();
    
    // Refresh every second to stay in sync with store
    const interval = setInterval(fetchAutomation, 1000);
    return () => clearInterval(interval);
  }, [songId, controls, getAutomationForSong]);

  // Record automation when enabled
  useEffect(() => {
    if (!isRecordingAutomation || !recordingStartTime) {
      if (recordingRef.current) {
        recordingRef.current = false;
      }
      return;
    }

    recordingRef.current = true;
    startTimeRef.current = recordingStartTime;

    const interval = setInterval(() => {
      if (!recordingRef.current) return;
      
      const currentTime = Date.now();
      const elapsed = currentTime - startTimeRef.current;
      
      // Record current values for all controls
      controls.forEach((controlId) => {
        const currentValue = lastValuesRef.current[controlId] ?? 0;
        recordAutomation(controlId, currentValue);
      });
    }, 1000 / sampleRate);

    return () => clearInterval(interval);
  }, [isRecordingAutomation, recordingStartTime, controls, sampleRate, recordAutomation]);

  const startRecording = useCallback(() => {
    startAutomationRecording(songId, controls);
    startTimeRef.current = Date.now();
    recordingRef.current = true;
    
    // Initialize with current values
    controls.forEach((controlId) => {
      const currentValue = lastValuesRef.current[controlId] ?? 0;
      recordAutomation(controlId, currentValue);
    });
  }, [startAutomationRecording, songId, controls, recordAutomation]);

  const stopRecording = useCallback(() => {
    stopAutomationRecording(songId);
    recordingRef.current = false;
  }, [stopAutomationRecording, songId]);

  const clearAutomation = useCallback((controlId?: ControlId) => {
    clearSongAutomation(songId, controlId);
    
    if (controlId) {
      setAutomationData((prev) => ({
        ...prev,
        [controlId]: [],
      }));
    } else {
      setAutomationData(
        controls.reduce((acc, id) => {
          acc[id] = [];
          return acc;
        }, {} as Record<ControlId, AutomationPoint[]>) 
      );
    }
  }, [clearSongAutomation, songId, controls]);

  const getAutomationAtTime = useCallback((
    controlId: ControlId,
    time: number
  ): number | null => {
    const points = automationData[controlId];
    if (!points || points.length === 0) return null;

    // Find the two closest points for interpolation
    let prevPoint: AutomationPoint | null = null;
    let nextPoint: AutomationPoint | null = null;

    for (const point of points) {
      if (point.timestamp <= time) {
        if (!prevPoint || point.timestamp > prevPoint.timestamp) {
          prevPoint = point;
        }
      } else {
        if (!nextPoint || point.timestamp < nextPoint.timestamp) {
          nextPoint = point;
        }
      }
    }

    // If we only have a previous point, return its value
    if (!nextPoint) return prevPoint?.value ?? null;
    
    // If we only have a next point, return its value
    if (!prevPoint) return nextPoint.value;
    
    // Linear interpolation between points
    const ratio = (time - prevPoint.timestamp) / (nextPoint.timestamp - prevPoint.timestamp);
    return prevPoint.value + (nextPoint.value - prevPoint.value) * ratio;
  }, [automationData]);

  const getAutomationTrack = useCallback((controlId: ControlId): AutomationTrack | null => {
    const points = automationData[controlId];
    if (!points) return null;
    
    return {
      controlId,
      points,
      enabled: true,
    };
  }, [automationData]);

  const setControlValue = useCallback((controlId: ControlId, value: number) => {
    // Clamp value between 0 and 1
    const clampedValue = Math.max(0, Math.min(1, value));
    lastValuesRef.current[controlId] = clampedValue;
    
    // If recording, record this value
    if (recordingRef.current && isRecordingAutomation) {
      const elapsed = Date.now() - startTimeRef.current;
      recordAutomation(controlId, clampedValue);
    }
  }, [isRecordingAutomation, recordAutomation]);

  return {
    automationData,
    startRecording,
    stopRecording,
    isRecording: isRecordingAutomation,
    clearAutomation,
    getAutomationAtTime,
    getAutomationTrack,
    setControlValue,
  };
};

export default useAutomation;