import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useAudioStore } from '../store/audioStore';
import { SectionType } from '../types/audio';

describe('audioStore', () => {
  let store: any;

  beforeEach(() => {
    vi.clearAllMocks();
    store = useAudioStore.getState();
  });

  describe('initial state', () => {
    it('should initialize with null audioContext', () => {
      expect(store.audioContext).toBeNull();
    });

    it('should initialize with isAudioReady as false', () => {
      expect(store.isAudioReady).toBe(false);
    });

    it('should have default TR-808 parameters', () => {
      expect(store.tr808Params.BD.level).toBe(100);
      expect(store.tr808Params.BD.tune).toBe(50);
      expect(store.tr808Params.BD.decay).toBe(50);
    });

    it('should have default TR-909 parameters', () => {
      expect(store.tr909Params.flam).toBe(0);
      expect(store.tr909Params.BD.attack).toBe(50);
    });

    it('should have default TB-303 parameters', () => {
      expect(store.tb303_1Params.waveform).toBe('sawtooth');
      expect(store.tb303_1Params.cutoff).toBe(64);
      expect(store.tb303_1Params.resonance).toBe(0);
    });

    it('should have default section parameters', () => {
      const sections: SectionType[] = ['808', '909', '303_1', '303_2'];
      sections.forEach((section) => {
        expect(store.sectionParams[section].level).toBe(100);
        expect(store.sectionParams[section].pan).toBe(0);
        expect(store.sectionParams[section].mute).toBe(false);
        expect(store.sectionParams[section].solo).toBe(false);
      });
    });

    it('should have default effect settings', () => {
      expect(store.pcfSettings.enabled).toBe(false);
      expect(store.pcfSettings.pattern).toBe(0);
      expect(store.delaySettings.enabled).toBe(false);
      expect(store.delaySettings.step).toBe(4);
      expect(store.distortionSettings.enabled).toBe(false);
      expect(store.distortionSettings.amount).toBe(50);
    });
  });

  describe('actions', () => {
    describe('initAudioContext', () => {
      it('should initialize audio context', () => {
        const mockContext = { currentTime: 0 };
        window.AudioContext = vi.fn(() => mockContext) as any;
        
        store.initAudioContext();
        
        expect(store.audioContext).toBeDefined();
        expect(store.isAudioReady).toBe(true);
      });
    });

    describe('setTR808Param', () => {
      it('should update TR-808 parameter', () => {
        const initialLevel = store.tr808Params.BD.level;
        store.setTR808Param('BD', 'level', 75);
        expect(store.tr808Params.BD.level).toBe(75);
      });

      it('should clamp values between 0 and 100', () => {
        store.setTR808Param('BD', 'level', 150);
        expect(store.tr808Params.BD.level).toBe(100);
        
        store.setTR808Param('BD', 'level', -10);
        expect(store.tr808Params.BD.level).toBe(0);
      });
    });

    describe('setTB303_1Param', () => {
      it('should update TB-303 parameter', () => {
        store.setTB303_1Param('waveform', 'square');
        expect(store.tb303_1Params.waveform).toBe('square');
      });
    });

    describe('setSectionParam', () => {
      it('should update section parameter', () => {
        store.setSectionParam('808', 'level', 80);
        expect(store.sectionParams['808'].level).toBe(80);
      });
    });

    describe('resetSectionParams', () => {
      it('should reset section parameters to defaults', () => {
        store.setSectionParam('808', 'level', 50);
        store.setSectionParam('808', 'pan', 25);
        store.resetSectionParams('808');
        
        expect(store.sectionParams['808'].level).toBe(100);
        expect(store.sectionParams['808'].pan).toBe(0);
      });
    });

    describe('resetAllParams', () => {
      it('should reset all parameters to defaults', () => {
        store.setTR808Param('BD', 'level', 50);
        store.setTB303_1Param('cutoff', 50);
        store.resetAllParams();
        
        expect(store.tr808Params.BD.level).toBe(100);
        expect(store.tb303_1Params.cutoff).toBe(64);
      });
    });

    describe('voice management', () => {
      it('should add and remove voices', () => {
        const voiceId = 'test-voice';
        const voiceData = { id: voiceId };
        
        store.addVoice(voiceId, voiceData);
        expect(store.voiceCount).toBe(1);
        expect(store.activeVoices.get(voiceId)).toEqual(voiceData);
        
        store.removeVoice(voiceId);
        expect(store.voiceCount).toBe(0);
        expect(store.activeVoices.get(voiceId)).toBeUndefined();
      });

      it('should respect max voices limit', () => {
        store.setMaxVoices(5);
        
        for (let i = 0; i < 10; i++) {
          store.addVoice(`voice-${i}`, { id: `voice-${i}` });
        }
        
        expect(store.voiceCount).toBeLessThanOrEqual(5);
      });
    });
  });
});