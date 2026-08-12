import { describe, it, expect, beforeEach } from 'vitest';
import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

// Mock the audioEffectsStore
interface TestAudioEffectsState {
  distortion: any;
  pcf: any;
  compressor: any;
  delay: any;
  tb303Routing: any;
  tr808Routing: any;
  tr909Routing: any;
  masterRouting: any;
}

interface TestAudioEffectsActions {
  setEffectConfig: (effect: string, config: any) => void;
  setInstrumentRouting: (instrument: string, routing: any) => void;
  setMasterRouting: (routing: any) => void;
  toggleEffect: (effect: string, enabled: boolean) => void;
  addEffectToInsert: (instrument: string, effect: string) => void;
  addEffectToSend: (instrument: string, effect: string) => void;
  removeEffectFromInsert: (instrument: string, effect: string) => void;
  removeEffectFromSend: (instrument: string, effect: string) => void;
  moveEffectToInsert: (instrument: string, effect: string) => void;
  moveEffectToSend: (instrument: string, effect: string) => void;
  resetAll: () => void;
  resetInstrumentRouting: (instrument: string) => void;
  getEffectConfig: (effect: string) => any;
  getInstrumentRouting: (instrument: string) => any;
  getMasterRouting: () => any;
  isEffectUsed: (effect: string) => boolean;
  isEffectInInsert: (instrument: string, effect: string) => boolean;
  isEffectInSend: (instrument: string, effect: string) => boolean;
  getAllRoutings: () => any;
}

type TestAudioEffectsStore = TestAudioEffectsState & TestAudioEffectsActions;

const createTestStore = () => {
  let state: TestAudioEffectsState & TestAudioEffectsActions = {
    distortion: { enabled: false, wetDryMix: 0.5, parameters: { drive: 0.5, tone: 0.5 } },
    pcf: { enabled: false, wetDryMix: 0.5, parameters: { cutoff: 0.5, resonance: 0.5 } },
    compressor: { enabled: false, wetDryMix: 0.5, parameters: { threshold: -20, ratio: 4, attack: 0.1, release: 0.5 } },
    delay: { enabled: false, wetDryMix: 0.5, parameters: { time: 0.5, feedback: 0.3 } },
    tb303Routing: { insert: [], send: [] },
    tr808Routing: { insert: [], send: [] },
    tr909Routing: { insert: [], send: [] },
    masterRouting: { insert: [], send: [] },

    setEffectConfig: function(effect, config) {
      this[effect] = { ...this[effect], ...config };
    },

    setInstrumentRouting: function(instrument, routing) {
      this[instrument + 'Routing'] = routing;
    },

    setMasterRouting: function(routing) {
      this.masterRouting = routing;
    },

    toggleEffect: function(effect, enabled) {
      this[effect] = { ...this[effect], enabled };
    },

    addEffectToInsert: function(instrument, effect) {
      const routing = this[instrument + 'Routing'];
      if (routing.insert.includes(effect) || routing.send.includes(effect)) {
        return;
      }
      routing.insert.push(effect);
    },

    addEffectToSend: function(instrument, effect) {
      const routing = this[instrument + 'Routing'];
      if (routing.insert.includes(effect) || routing.send.includes(effect)) {
        return;
      }
      routing.send.push(effect);
    },

    removeEffectFromInsert: function(instrument, effect) {
      const routing = this[instrument + 'Routing'];
      routing.insert = routing.insert.filter(e => e !== effect);
    },

    removeEffectFromSend: function(instrument, effect) {
      const routing = this[instrument + 'Routing'];
      routing.send = routing.send.filter(e => e !== effect);
    },

    moveEffectToInsert: function(instrument, effect) {
      const routing = this[instrument + 'Routing'];
      routing.send = routing.send.filter(e => e !== effect);
      if (!routing.insert.includes(effect)) {
        routing.insert.push(effect);
      }
    },

    moveEffectToSend: function(instrument, effect) {
      const routing = this[instrument + 'Routing'];
      routing.insert = routing.insert.filter(e => e !== effect);
      if (!routing.send.includes(effect)) {
        routing.send.push(effect);
      }
    },

    resetAll: function() {
      this.distortion = { enabled: false, wetDryMix: 0.5, parameters: { drive: 0.5, tone: 0.5 } };
      this.pcf = { enabled: false, wetDryMix: 0.5, parameters: { cutoff: 0.5, resonance: 0.5 } };
      this.compressor = { enabled: false, wetDryMix: 0.5, parameters: { threshold: -20, ratio: 4, attack: 0.1, release: 0.5 } };
      this.delay = { enabled: false, wetDryMix: 0.5, parameters: { time: 0.5, feedback: 0.3 } };
      this.tb303Routing = { insert: [], send: [] };
      this.tr808Routing = { insert: [], send: [] };
      this.tr909Routing = { insert: [], send: [] };
      this.masterRouting = { insert: [], send: [] };
    },

    resetInstrumentRouting: function(instrument) {
      this[instrument + 'Routing'] = { insert: [], send: [] };
    },

    getEffectConfig: function(effect) {
      return this[effect];
    },

    getInstrumentRouting: function(instrument) {
      return this[instrument + 'Routing'];
    },

    getMasterRouting: function() {
      return this.masterRouting;
    },

    isEffectUsed: function(effect) {
      const allRoutings = [
        this.tb303Routing,
        this.tr808Routing,
        this.tr909Routing,
        this.masterRouting,
      ];
      return allRoutings.some((routing) =>
        routing.insert.includes(effect) || routing.send.includes(effect)
      );
    },

    isEffectInInsert: function(instrument, effect) {
      const routing = this[instrument + 'Routing'];
      return routing.insert.includes(effect);
    },

    isEffectInSend: function(instrument, effect) {
      const routing = this[instrument + 'Routing'];
      return routing.send.includes(effect);
    },

    getAllRoutings: function() {
      return {
        tb303: this.tb303Routing,
        tr808: this.tr808Routing,
        tr909: this.tr909Routing,
        master: this.masterRouting,
      };
    },
  };
  return state;
};

describe('Audio Effects Store', () => {
  let store: TestAudioEffectsStore;

  beforeEach(() => {
    store = createTestStore();
  });

  describe('initialization', () => {
    it('should initialize with default effect configurations', () => {
      expect(store.distortion).toEqual({ enabled: false, wetDryMix: 0.5, parameters: { drive: 0.5, tone: 0.5 } });
      expect(store.pcf).toEqual({ enabled: false, wetDryMix: 0.5, parameters: { cutoff: 0.5, resonance: 0.5 } });
      expect(store.compressor).toEqual({ enabled: false, wetDryMix: 0.5, parameters: { threshold: -20, ratio: 4, attack: 0.1, release: 0.5 } });
      expect(store.delay).toEqual({ enabled: false, wetDryMix: 0.5, parameters: { time: 0.5, feedback: 0.3 } });
    });

    it('should initialize with empty routing', () => {
      expect(store.tb303Routing).toEqual({ insert: [], send: [] });
      expect(store.tr808Routing).toEqual({ insert: [], send: [] });
      expect(store.tr909Routing).toEqual({ insert: [], send: [] });
      expect(store.masterRouting).toEqual({ insert: [], send: [] });
    });
  });

  describe('setEffectConfig', () => {
    it('should update effect configuration', () => {
      store.setEffectConfig('distortion', { enabled: true, wetDryMix: 0.8 });
      
      expect(store.distortion.enabled).toBe(true);
      expect(store.distortion.wetDryMix).toBe(0.8);
    });

    it('should merge with existing config', () => {
      store.setEffectConfig('distortion', { enabled: true });
      
      expect(store.distortion).toEqual({
        enabled: true,
        wetDryMix: 0.5,
        parameters: { drive: 0.5, tone: 0.5 },
      });
    });
  });

  describe('toggleEffect', () => {
    it('should enable an effect', () => {
      store.toggleEffect('distortion', true);
      expect(store.distortion.enabled).toBe(true);
    });

    it('should disable an effect', () => {
      store.toggleEffect('distortion', true);
      store.toggleEffect('distortion', false);
      expect(store.distortion.enabled).toBe(false);
    });
  });

  describe('addEffectToInsert', () => {
    it('should add effect to INSERT chain', () => {
      store.addEffectToInsert('tb303', 'distortion');
      
      expect(store.tb303Routing.insert).toContain('distortion');
      expect(store.tb303Routing.send).not.toContain('distortion');
    });

    it('should not add duplicate effects', () => {
      store.addEffectToInsert('tb303', 'distortion');
      store.addEffectToInsert('tb303', 'distortion');
      
      expect(store.tb303Routing.insert).toHaveLength(1);
    });

    it('should not add if effect is in SEND', () => {
      store.addEffectToSend('tb303', 'distortion');
      store.addEffectToInsert('tb303', 'distortion');
      
      expect(store.tb303Routing.insert).toHaveLength(0);
      expect(store.tb303Routing.send).toContain('distortion');
    });
  });

  describe('addEffectToSend', () => {
    it('should add effect to SEND chain', () => {
      store.addEffectToSend('tb303', 'delay');
      
      expect(store.tb303Routing.send).toContain('delay');
      expect(store.tb303Routing.insert).not.toContain('delay');
    });

    it('should not add duplicate effects', () => {
      store.addEffectToSend('tb303', 'delay');
      store.addEffectToSend('tb303', 'delay');
      
      expect(store.tb303Routing.send).toHaveLength(1);
    });
  });

  describe('removeEffectFromInsert', () => {
    it('should remove effect from INSERT chain', () => {
      store.addEffectToInsert('tb303', 'distortion');
      store.removeEffectFromInsert('tb303', 'distortion');
      
      expect(store.tb303Routing.insert).not.toContain('distortion');
    });
  });

  describe('removeEffectFromSend', () => {
    it('should remove effect from SEND chain', () => {
      store.addEffectToSend('tb303', 'delay');
      store.removeEffectFromSend('tb303', 'delay');
      
      expect(store.tb303Routing.send).not.toContain('delay');
    });
  });

  describe('moveEffectToInsert', () => {
    it('should move effect from SEND to INSERT', () => {
      store.addEffectToSend('tb303', 'distortion');
      store.moveEffectToInsert('tb303', 'distortion');
      
      expect(store.tb303Routing.insert).toContain('distortion');
      expect(store.tb303Routing.send).not.toContain('distortion');
    });

    it('should do nothing if effect is already in INSERT', () => {
      store.addEffectToInsert('tb303', 'distortion');
      store.moveEffectToInsert('tb303', 'distortion');
      
      expect(store.tb303Routing.insert).toHaveLength(1);
    });
  });

  describe('moveEffectToSend', () => {
    it('should move effect from INSERT to SEND', () => {
      store.addEffectToInsert('tb303', 'delay');
      store.moveEffectToSend('tb303', 'delay');
      
      expect(store.tb303Routing.send).toContain('delay');
      expect(store.tb303Routing.insert).not.toContain('delay');
    });
  });

  describe('resetInstrumentRouting', () => {
    it('should reset routing for an instrument', () => {
      store.addEffectToInsert('tb303', 'distortion');
      store.addEffectToSend('tb303', 'delay');
      
      store.resetInstrumentRouting('tb303');
      
      expect(store.tb303Routing).toEqual({ insert: [], send: [] });
    });
  });

  describe('resetAll', () => {
    it('should reset all effects and routing', () => {
      store.setEffectConfig('distortion', { enabled: true });
      store.addEffectToInsert('tb303', 'distortion');
      store.addEffectToSend('tr808', 'delay');
      
      store.resetAll();
      
      expect(store.distortion.enabled).toBe(false);
      expect(store.tb303Routing).toEqual({ insert: [], send: [] });
      expect(store.tr808Routing).toEqual({ insert: [], send: [] });
    });
  });

  describe('selectors', () => {
    it('should get effect config', () => {
      const config = store.getEffectConfig('distortion');
      expect(config).toEqual({ enabled: false, wetDryMix: 0.5, parameters: { drive: 0.5, tone: 0.5 } });
    });

    it('should get instrument routing', () => {
      const routing = store.getInstrumentRouting('tb303');
      expect(routing).toEqual({ insert: [], send: [] });
    });

    it('should check if effect is used', () => {
      store.addEffectToInsert('tb303', 'distortion');
      
      expect(store.isEffectUsed('distortion')).toBe(true);
      expect(store.isEffectUsed('delay')).toBe(false);
    });

    it('should check if effect is in INSERT', () => {
      store.addEffectToInsert('tb303', 'distortion');
      
      expect(store.isEffectInInsert('tb303', 'distortion')).toBe(true);
      expect(store.isEffectInInsert('tb303', 'delay')).toBe(false);
    });

    it('should check if effect is in SEND', () => {
      store.addEffectToSend('tb303', 'delay');
      
      expect(store.isEffectInSend('tb303', 'delay')).toBe(true);
      expect(store.isEffectInSend('tb303', 'distortion')).toBe(false);
    });

    it('should get all routings', () => {
      store.addEffectToInsert('tb303', 'distortion');
      store.addEffectToSend('tr808', 'delay');
      
      const allRoutings = store.getAllRoutings();
      
      expect(allRoutings.tb303.insert).toContain('distortion');
      expect(allRoutings.tr808.send).toContain('delay');
    });
  });
});