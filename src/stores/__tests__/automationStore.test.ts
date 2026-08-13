import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock the songStore with automation support
interface TestSongState {
  songs: any[];
  currentSongId: string | null;
  automation: any[];
  isRecordingAutomation: boolean;
  recordingStartTime: number | null;
  currentRecordingControls: string[];
  currentRecordingSongId: string | null;
}

interface TestSongActions {
  startAutomationRecording: (songId: string, controlIds: string[]) => void;
  stopAutomationRecording: (songId: string) => void;
  recordAutomation: (controlId: string, value: number) => void;
  clearAutomation: (songId: string, controlId?: string) => void;
  getAutomationForPattern: (songId: string, patternId: string, controlId: string) => any[];
  getAutomationForSong: (songId: string, controlId: string) => any[];
}

type TestSongStore = TestSongState & TestSongActions;

const createTestStore = () => {
  let state: TestSongState & TestSongActions = {
    songs: [],
    currentSongId: null,
    automation: [],
    isRecordingAutomation: false,
    recordingStartTime: null,
    currentRecordingControls: [],
    currentRecordingSongId: null,

    startAutomationRecording: function(songId, controlIds) {
      this.isRecordingAutomation = true;
      this.recordingStartTime = Date.now();
      this.currentRecordingControls = controlIds;
      this.currentRecordingSongId = songId;
    },

    stopAutomationRecording: function(songId) {
      this.isRecordingAutomation = false;
      this.recordingStartTime = null;
      this.currentRecordingControls = [];
      this.currentRecordingSongId = null;
    },

    recordAutomation: function(controlId, value) {
      if (!this.isRecordingAutomation || !this.recordingStartTime) {
        return;
      }

      const elapsed = Date.now() - this.recordingStartTime;
      const currentSongId = this.currentRecordingSongId;

      if (!currentSongId) return;

      let songAutomation = this.automation.find(a => a.songId === currentSongId);

      if (!songAutomation) {
        songAutomation = {
          songId: currentSongId,
          globalTracks: [],
          patternAutomation: [],
        };
        this.automation.push(songAutomation);
      }

      // For testing, always add to global tracks
      let track = songAutomation.globalTracks.find((t: any) => t.controlId === controlId);
      if (!track) {
        track = {
          controlId,
          points: [],
          enabled: true,
        };
        songAutomation.globalTracks.push(track);
      }
      track.points.push({ timestamp: elapsed, value });
    },

    clearAutomation: function(songId, controlId) {
      this.automation = this.automation.map((a) => {
        if (a.songId !== songId) return a;

        if (controlId) {
          return {
            ...a,
            globalTracks: a.globalTracks.filter((t: any) => t.controlId !== controlId),
          };
        } else {
          return {
            ...a,
            globalTracks: [],
          };
        }
      });
    },

    getAutomationForPattern: function(songId, patternId, controlId) {
      const songAutomation = this.automation.find(a => a.songId === songId);
      if (!songAutomation) return [];

      const patternAutomation = songAutomation.patternAutomation.find(
        (pa: any) => pa.patternId === patternId
      );
      if (!patternAutomation) return [];

      const track = patternAutomation.tracks.find((t: any) => t.controlId === controlId);
      return track?.points ?? [];
    },

    getAutomationForSong: function(songId, controlId) {
      const songAutomation = this.automation.find(a => a.songId === songId);
      if (!songAutomation) return [];

      const globalTrack = songAutomation.globalTracks.find(
        (t: any) => t.controlId === controlId
      );
      return globalTrack?.points ?? [];
    },
  };
  return state;
};

describe('Automation Store', () => {
  let store: any;

  beforeEach(() => {
    store = createTestStore();
  });

  describe('startAutomationRecording', () => {
    it('should set recording state when called', () => {
      const songId = 'test-song';
      const controlIds = ['tb303_cutoff', 'tb303_resonance'];

      store.startAutomationRecording(songId, controlIds);

      expect(store.isRecordingAutomation).toBe(true);
      expect(store.currentRecordingSongId).toBe(songId);
      expect(store.currentRecordingControls).toEqual(controlIds);
      expect(store.recordingStartTime).toBeGreaterThan(0);
    });
  });

  describe('stopAutomationRecording', () => {
    it('should clear recording state when called', () => {
      const songId = 'test-song';
      const controlIds = ['tb303_cutoff'];

      store.startAutomationRecording(songId, controlIds);
      store.stopAutomationRecording(songId);

      expect(store.isRecordingAutomation).toBe(false);
      expect(store.currentRecordingSongId).toBe(null);
      expect(store.currentRecordingControls).toEqual([]);
      expect(store.recordingStartTime).toBe(null);
    });
  });

  describe('recordAutomation', () => {
    it('should record automation points when recording is active', () => {
      const songId = 'test-song';
      const controlIds = ['tb303_cutoff'];
      const controlId = 'tb303_cutoff';
      const value = 0.75;

      // Start recording
      store.startAutomationRecording(songId, controlIds);
      const startTime = store.recordingStartTime;

      // Record a value
      store.recordAutomation(controlId, value);

      const automation = store.automation.find(a => a.songId === songId);
      
      expect(automation).toBeDefined();
      expect(automation.globalTracks.length).toBe(1);
      expect(automation.globalTracks[0].controlId).toBe(controlId);
      expect(automation.globalTracks[0].points.length).toBe(1);
      expect(automation.globalTracks[0].points[0].value).toBe(value);
      expect(automation.globalTracks[0].points[0].timestamp).toBeGreaterThanOrEqual(0);
    });

    it('should not record when not in recording mode', () => {
      const controlId = 'tb303_cutoff';
      const value = 0.5;

      // Try to record without starting recording
      store.recordAutomation(controlId, value);

      expect(store.automation).toHaveLength(0);
    });
  });

  describe('clearAutomation', () => {
    it('should clear specific control automation', () => {
      const songId = 'test-song';
      const controlIds = ['tb303_cutoff', 'tb303_resonance'];

      // Start recording and record some values
      store.startAutomationRecording(songId, controlIds);
      store.recordAutomation('tb303_cutoff', 0.5);
      store.recordAutomation('tb303_resonance', 0.75);
      store.stopAutomationRecording(songId);

      // Clear one control
      store.clearAutomation(songId, 'tb303_cutoff');

      const automation = store.automation.find(a => a.songId === songId);
      
      expect(automation.globalTracks).toHaveLength(1);
      expect(automation.globalTracks[0].controlId).toBe('tb303_resonance');
    });

    it('should clear all automation when no controlId is specified', () => {
      const songId = 'test-song';
      const controlIds = ['tb303_cutoff', 'tb303_resonance'];

      // Start recording and record some values
      store.startAutomationRecording(songId, controlIds);
      store.recordAutomation('tb303_cutoff', 0.5);
      store.recordAutomation('tb303_resonance', 0.75);
      store.stopAutomationRecording(songId);

      // Clear all automation
      store.clearAutomation(songId);

      const automation = store.automation.find(a => a.songId === songId);
      
      expect(automation.globalTracks).toHaveLength(0);
    });
  });

  describe('getAutomationForSong', () => {
    it('should return automation points for a specific control', () => {
      const songId = 'test-song';
      const controlIds = ['tb303_cutoff'];

      // Start recording and record some values
      store.startAutomationRecording(songId, controlIds);
      store.recordAutomation('tb303_cutoff', 0.5);
      store.recordAutomation('tb303_cutoff', 0.75);
      store.stopAutomationRecording(songId);

      const points = store.getAutomationForSong(songId, 'tb303_cutoff');
      
      expect(points).toHaveLength(2);
      expect(points[0].value).toBe(0.5);
      expect(points[1].value).toBe(0.75);
    });

    it('should return empty array for non-existent control', () => {
      const songId = 'test-song';
      const points = store.getAutomationForSong(songId, 'tb303_cutoff');
      
      expect(points).toHaveLength(0);
    });
  });
});