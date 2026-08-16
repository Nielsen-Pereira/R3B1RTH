/**
 * useAutomation Hook - R3B-5
 * Custom hook for automation operations
 */

import { useCallback, useMemo } from 'react';
import { useAutomationStore } from '../stores/automationStore';
import type { AutomationLane, AutomationPoint, AutomationCurve } from '../types/automationTypes';
import { AUTOMATION_PARAMETERS, DEFAULT_AUTOMATION_CURVE } from '../types/automationTypes';

export interface UseAutomationReturn {
  // State
  lanes: AutomationLane[];
  isRecording: boolean;
  currentRecordingLane: string | null;
  playbackPosition: number;

  // Actions
  addLane: (parameter: string, deviceId: string) => AutomationLane;
  removeLane: (laneId: string) => void;
  toggleLane: (laneId: string) => void;
  addPoint: (laneId: string, time: number, value: number, curve?: AutomationCurve) => AutomationPoint;
  removePoint: (laneId: string, pointId: string) => void;
  updatePoint: (laneId: string, pointId: string, updates: Partial<AutomationPoint>) => void;
  startRecording: (laneId: string) => void;
  stopRecording: () => void;
  clearRecording: () => void;
  clearAllAutomation: () => void;
  setPlaybackPosition: (position: number) => void;

  // Helpers
  getLaneByParameter: (parameter: string, deviceId: string) => AutomationLane | undefined;
  getValueAtTime: (laneId: string, time: number) => number;
  getAvailableParameters: (deviceType: string) => string[];
  getLaneForDevice: (deviceId: string) => AutomationLane[];
}

export const useAutomation = (): UseAutomationReturn => {
  const store = useAutomationStore();

  const getAvailableParameters = useCallback((deviceType: string): string[] => {
    const params = AUTOMATION_PARAMETERS[deviceType as keyof typeof AUTOMATION_PARAMETERS];
    return params ? [...params] : [];
  }, []);

  const getLaneForDevice = useCallback((deviceId: string): AutomationLane[] => {
    return store.lanes.filter((lane) => lane.deviceId === deviceId);
  }, [store.lanes]);

  return {
    // State
    lanes: store.lanes,
    isRecording: store.isRecording,
    currentRecordingLane: store.currentRecordingLane,
    playbackPosition: store.playbackPosition,

    // Actions
    addLane: store.addLane,
    removeLane: store.removeLane,
    toggleLane: store.toggleLane,
    addPoint: store.addPoint,
    removePoint: store.removePoint,
    updatePoint: store.updatePoint,
    startRecording: store.startRecording,
    stopRecording: store.stopRecording,
    clearRecording: store.clearRecording,
    clearAllAutomation: store.clearAllAutomation,
    setPlaybackPosition: store.setPlaybackPosition,

    // Helpers
    getLaneByParameter: store.getLaneByParameter,
    getValueAtTime: store.getValueAtTime,
    getAvailableParameters,
    getLaneForDevice,
  };
};

export default useAutomation;
