import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useSequencerStore } from '../store/sequencerStore';
import { SectionType } from '../types/audio';

describe('sequencerStore', () => {
  let store: any;

  beforeEach(() => {
    vi.clearAllMocks();
    store = useSequencerStore.getState();
  });

  describe('initial state', () => {
    it('should initialize with isPlaying as false', () => {
      expect(store.isPlaying).toBe(false);
    });

    it('should initialize with isRecording as false', () => {
      expect(store.isRecording).toBe(false);
    });

    it('should initialize with currentStep as 0', () => {
      expect(store.currentStep).toBe(0);
    });

    it('should initialize with tempo 120', () => {
      expect(store.tempo).toBe(120);
    });

    it('should initialize with shuffle 0', () => {
      expect(store.shuffle).toBe(0);
    });

    it('should initialize with mode pattern', () => {
      expect(store.mode).toBe('pattern');
    });

    it('should have 32 patterns per section', () => {
      const sections: SectionType[] = ['808', '909', '303_1', '303_2'];
      sections.forEach((section) => {
        expect(store.patterns[section].length).toBe(32);
      });
    });

    it('should initialize patterns with correct default length', () => {
      const pattern = store.patterns['808'][0];
      expect(pattern.length).toBe(16);
    });

    it('should initialize song as null', () => {
      expect(store.song).toBeNull();
    });
  });

  describe('actions', () => {
    describe('play/stop', () => {
      it('should toggle isPlaying', () => {
        expect(store.isPlaying).toBe(false);
        store.play();
        expect(store.isPlaying).toBe(true);
        store.stop();
        expect(store.isPlaying).toBe(false);
      });

      it('should toggle with togglePlay', () => {
        store.togglePlay();
        expect(store.isPlaying).toBe(true);
        store.togglePlay();
        expect(store.isPlaying).toBe(false);
      });
    });

    describe('record', () => {
      it('should toggle isRecording', () => {
        expect(store.isRecording).toBe(false);
        store.record();
        expect(store.isRecording).toBe(true);
        store.record();
        expect(store.isRecording).toBe(false);
      });

      it('should toggle with toggleRecord', () => {
        store.toggleRecord();
        expect(store.isRecording).toBe(true);
        store.toggleRecord();
        expect(store.isRecording).toBe(false);
      });
    });

    describe('tempo', () => {
      it('should set tempo', () => {
        store.setTempo(150);
        expect(store.tempo).toBe(150);
      });

      it('should clamp tempo between 40 and 300', () => {
        store.setTempo(20);
        expect(store.tempo).toBe(40);
        
        store.setTempo(400);
        expect(store.tempo).toBe(300);
      });
    });

    describe('shuffle', () => {
      it('should set shuffle', () => {
        store.setShuffle(50);
        expect(store.shuffle).toBe(50);
      });

      it('should clamp shuffle between 0 and 100', () => {
        store.setShuffle(-10);
        expect(store.shuffle).toBe(0);
        
        store.setShuffle(150);
        expect(store.shuffle).toBe(100);
      });
    });

    describe('mode', () => {
      it('should set mode', () => {
        store.setMode('song');
        expect(store.mode).toBe('song');
        store.setMode('pattern');
        expect(store.mode).toBe('pattern');
      });
    });

    describe('pattern management', () => {
      it('should create pattern', () => {
        const pattern = store.createPattern('808', 32);
        expect(pattern.length).toBe(32);
        expect(pattern.steps.length).toBe(32);
      });

      it('should set pattern length', () => {
        store.setPatternLength('808', 32);
        expect(store.patternLength['808']).toBe(32);
      });

      it('should set step', () => {
        store.setStep('808', 0, { instrument: 'BD', accent: true });
        const step = store.patterns['808'][0].steps[0];
        expect(step.instrument).toBe('BD');
        expect(step.accent).toBe(true);
      });

      it('should toggle step', () => {
        const initialInstrument = store.patterns['808'][0].steps[0].instrument;
        store.toggleStep('808', 0);
        const step = store.patterns['808'][0].steps[0];
        expect(step.instrument).toBe(initialInstrument ? null : 'BD');
      });

      it('should set step instrument', () => {
        store.setStepInstrument('808', 0, 'SD');
        const step = store.patterns['808'][0].steps[0];
        expect(step.instrument).toBe('SD');
      });

      it('should toggle step accent', () => {
        const initialAccent = store.patterns['808'][0].steps[0].accent;
        store.toggleStepAccent('808', 0);
        const step = store.patterns['808'][0].steps[0];
        expect(step.accent).toBe(!initialAccent);
      });

      it('should toggle step flam', () => {
        const initialFlam = store.patterns['808'][0].steps[0].flam;
        store.toggleStepFlam('808', 0);
        const step = store.patterns['808'][0].steps[0];
        expect(step.flam).toBe(!initialFlam);
      });
    });

    describe('song management', () => {
      it('should create song', () => {
        const song = store.createSong();
        expect(song.name).toBe('New Song');
        expect(song.tempo).toBe(120);
        expect(song.mode).toBe('pattern');
      });

      it('should load song', () => {
        const song = store.createSong();
        store.loadSong(song);
        expect(store.song).toEqual(song);
      });

      it('should save song', () => {
        const song = store.createSong();
        store.loadSong(song);
        const saved = store.saveSong();
        expect(saved).toEqual(song);
      });

      it('should add track event', () => {
        const song = store.createSong();
        store.loadSong(song);
        store.addTrackEvent('808', 0, 0, 0);
        
        const track = store.song?.tracks.find((t: any) => t.section === '808');
        expect(track?.events.length).toBe(1);
      });

      it('should remove track event', () => {
        const song = store.createSong();
        store.loadSong(song);
        store.addTrackEvent('808', 0, 0, 0);
        store.addTrackEvent('808', 1, 0, 1);
        store.removeTrackEvent('808', 0);
        
        const track = store.song?.tracks.find((t: any) => t.section === '808');
        expect(track?.events.length).toBe(1);
      });
    });

    describe('loop', () => {
      it('should set loop', () => {
        store.setLoop(0, 15);
        expect(store.loopStart).toBe(0);
        expect(store.loopEnd).toBe(15);
      });

      it('should clear loop', () => {
        store.setLoop(0, 15);
        store.clearLoop();
        expect(store.loopStart).toBeNull();
        expect(store.loopEnd).toBeNull();
      });
    });

    describe('reset', () => {
      it('should reset sequencer', () => {
        store.setTempo(150);
        store.play();
        store.resetSequencer();
        
        expect(store.tempo).toBe(120);
        expect(store.isPlaying).toBe(false);
      });
    });
  });
});