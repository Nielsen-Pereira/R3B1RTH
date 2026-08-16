/**
 * Automation Store - R3B-5
 * Zustand store for automation state management
 */

import { create } from 'zustand';
import type { AutomationLane, AutomationPoint, AutomationState, AutomationCurve } from '../types/automationTypes';

interface AutomationActions {
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
  getLaneByParameter: (parameter: string, deviceId: string) => AutomationLane | undefined;
  getValueAtTime: (laneId: string, time: number) => number;
}

type AutomationStore = AutomationState & AutomationActions;

const generateId = () => Math.random().toString(36).substring(2, 9);

export const useAutomationStore = create<AutomationStore>((set, get) => ({
  lanes: [],
  isRecording: false,
  currentRecordingLane: null,
  playbackPosition: 0,

  addLane: (parameter: string, deviceId: string) => {
    const newLane: AutomationLane = {
      id: generateId(),
      parameter,
      deviceId,
      points: [],
      enabled: true,
      recording: false,
    };
    set((state) => ({ lanes: [...state.lanes, newLane] }));
    return newLane;
  },

  removeLane: (laneId: string) => {
    set((state) => ({
      lanes: state.lanes.filter((lane) => lane.id !== laneId),
      currentRecordingLane: state.currentRecordingLane === laneId ? null : state.currentRecordingLane,
    }));
  },

  toggleLane: (laneId: string) => {
    set((state) => ({
      lanes: state.lanes.map((lane) =>
        lane.id === laneId ? { ...lane, enabled: !lane.enabled } : lane
      ),
    }));
  },

  addPoint: (laneId: string, time: number, value: number, curve: AutomationCurve = 'linear') => {
    const newPoint: AutomationPoint = {
      id: generateId(),
      time,
      value,
      curve,
    };
    set((state) => ({
      lanes: state.lanes.map((lane) =>
        lane.id === laneId
          ? { ...lane, points: [...lane.points, newPoint].sort((a, b) => a.time - b.time) }
          : lane
      ),
    }));
    return newPoint;
  },

  removePoint: (laneId: string, pointId: string) => {
    set((state) => ({
      lanes: state.lanes.map((lane) =>
        lane.id === laneId
          ? { ...lane, points: lane.points.filter((p) => p.id !== pointId) }
          : lane
      ),
    }));
  },

  updatePoint: (laneId: string, pointId: string, updates: Partial<AutomationPoint>) => {
    set((state) => ({
      lanes: state.lanes.map((lane) =>
        lane.id === laneId
          ? {
              ...lane,
              points: lane.points.map((p) =>
                p.id === pointId ? { ...p, ...updates } : p
              ),
            }
          : lane
      ),
    }));
  },

  startRecording: (laneId: string) => {
    set({
      isRecording: true,
      currentRecordingLane: laneId,
    });
    set((state) => ({
      lanes: state.lanes.map((lane) =>
        lane.id === laneId ? { ...lane, recording: true } : { ...lane, recording: false }
      ),
    }));
  },

  stopRecording: () => {
    set({
      isRecording: false,
      currentRecordingLane: null,
    });
    set((state) => ({
      lanes: state.lanes.map((lane) => ({ ...lane, recording: false })),
    }));
  },

  clearRecording: () => {
    set({
      isRecording: false,
      currentRecordingLane: null,
    });
  },

  clearAllAutomation: () => {
    set({
      lanes: [],
      isRecording: false,
      currentRecordingLane: null,
    });
  },

  setPlaybackPosition: (position: number) => {
    set({ playbackPosition: position });
  },

  getLaneByParameter: (parameter: string, deviceId: string) => {
    const { lanes } = get();
    return lanes.find((lane) => lane.parameter === parameter && lane.deviceId === deviceId);
  },

  getValueAtTime: (laneId: string, time: number) => {
    const { lanes } = get();
    const lane = lanes.find((l) => l.id === laneId);
    if (!lane || lane.points.length === 0) return 0;

    const points = lane.points.sort((a, b) => a.time - b.time);
    
    if (time <= points[0].time) return points[0].value;
    if (time >= points[points.length - 1].time) return points[points.length - 1].value;

    for (let i = 0; i < points.length - 1; i++) {
      if (time >= points[i].time && time <= points[i + 1].time) {
        const prev = points[i];
        const next = points[i + 1];
        const progress = (time - prev.time) / (next.time - prev.time);
        
        switch (prev.curve) {
          case 'linear':
            return prev.value + (next.value - prev.value) * progress;
          case 'step':
            return prev.value;
          case 'smooth':
            return prev.value + (next.value - prev.value) * Math.pow(progress, 2);
          case 'exponential':
            return prev.value * Math.pow((next.value / prev.value), progress);
          default:
            return prev.value + (next.value - prev.value) * progress;
        }
      }
    }
    return 0;
  },
}));
