/**
 * TB-303 Store Tests - Enhanced for Batch 4
 * R3B-95, R3B-96, R3B-135: TR-808/TR-909 + TB-303 Advanced Parameters
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { useTB303Store, TB303_PRESETS, applyTB303Preset } from '../stores/tb303Store';

describe('useTB303Store', () => {
  let store: ReturnType<typeof useTB303Store>;

  beforeEach(() => {
    store = useTB303Store();
    store.getState().reset();
  });

  it('should initialize with default parameters', () => {
    const state = store.getState();
    expect(state.enabled).toBe(true);
    expect(state.volume).toBe(0.8);
    expect(state.parameters.cutoff).toBe(0.5);
    expect(state.parameters.resonance).toBe(0.5);
    expect(state.parameters.waveform).toBe('sawtooth');
  });

  it('should initialize with advanced parameters', () => {
    const state = store.getState();
    expect(state.parameters.accentAmount).toBe(0.5);
    expect(state.parameters.slideTime).toBe(0.3);
    expect(state.parameters.cutoffEnv).toBeDefined();
    expect(state.parameters.cutoffEnv.attack).toBe(0.1);
    expect(state.parameters.cutoffEnv.decay).toBe(0.5);
    expect(state.parameters.cutoffEnv.sustain).toBe(0.5);
    expect(state.parameters.cutoffEnv.release).toBe(0.3);
    expect(state.parameters.accentVelocity).toBe(0.5);
    expect(state.parameters.portamento).toBe(false);
  });

  it('should set accentAmount parameter', () => {
    store.getState().setParameter('accentAmount', 0.8);
    expect(store.getState().parameters.accentAmount).toBe(0.8);
  });

  it('should set slideTime parameter', () => {
    store.getState().setParameter('slideTime', 0.6);
    expect(store.getState().parameters.slideTime).toBe(0.6);
  });

  it('should set accentVelocity parameter', () => {
    store.getState().setParameter('accentVelocity', 0.9);
    expect(store.getState().parameters.accentVelocity).toBe(0.9);
  });

  it('should set portamento parameter', () => {
    store.getState().setParameter('portamento', true);
    expect(store.getState().parameters.portamento).toBe(true);
  });

  it('should set cutoffEnv via setCutoffEnv', () => {
    store.getState().setCutoffEnv({
      attack: 0.2,
      decay: 0.3,
      sustain: 0.7,
      release: 0.4
    });
    const env = store.getState().parameters.cutoffEnv;
    expect(env.attack).toBe(0.2);
    expect(env.decay).toBe(0.3);
    expect(env.sustain).toBe(0.7);
    expect(env.release).toBe(0.4);
  });

  it('should set slide parameter', () => {
    store.getState().setParameter('slide', true);
    expect(store.getState().parameters.slide).toBe(true);
  });

  it('should clamp parameter values between 0 and 1', () => {
    store.getState().setParameter('accentAmount', 1.5);
    expect(store.getState().parameters.accentAmount).toBe(1);
    
    store.getState().setParameter('accentAmount', -0.5);
    expect(store.getState().parameters.accentAmount).toBe(0);
  });

  it('should have 16 voices', () => {
    const state = store.getState();
    expect(state.voices.length).toBe(16);
  });

  it('should reset to default state', () => {
    store.getState().setVolume(0.2);
    store.getState().setParameter('cutoff', 0.8);
    store.getState().setParameter('accentAmount', 0.9);
    
    store.getState().reset();
    
    const state = store.getState();
    expect(state.volume).toBe(0.8);
    expect(state.parameters.cutoff).toBe(0.5);
    expect(state.parameters.accentAmount).toBe(0.5);
  });
});

describe('TB303_PRESETS', () => {
  it('should have Default preset', () => {
    expect(TB303_PRESETS).toHaveProperty('Default');
  });

  it('should have Acid preset with advanced parameters', () => {
    const acid = TB303_PRESETS.Acid;
    expect(acid.waveform).toBe('square');
    expect(acid.accentAmount).toBe(0.8);
    expect(acid.cutoffEnv).toBeDefined();
  });

  it('should have Deep preset', () => {
    expect(TB303_PRESETS).toHaveProperty('Deep');
  });

  it('should have Bright preset', () => {
    expect(TB303_PRESETS).toHaveProperty('Bright');
  });

  it('should have Punchy preset', () => {
    expect(TB303_PRESETS).toHaveProperty('Punchy');
  });

  it('should have Slidy preset with slide and portamento', () => {
    const slidy = TB303_PRESETS.Slidy;
    expect(slidy.slide).toBe(true);
    expect(slidy.portamento).toBe(true);
    expect(slidy.slideTime).toBe(0.5);
  });
});

describe('applyTB303Preset', () => {
  it('should apply preset to store', () => {
    const mockStore = {
      getState: () => useTB303Store.getState(),
      setState: vi.fn()
    };
    
    applyTB303Preset(mockStore as any, 'Default');
    expect(mockStore.setState).toHaveBeenCalled();
  });
});
