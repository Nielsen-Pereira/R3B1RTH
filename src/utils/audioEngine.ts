/**
 * Audio Engine - Batch 1 Development
 * R3B-90 to R3B-94: Song Mode & Audio Effects
 * 
 * Web Audio API integration for audio processing
 */

import type { EffectType, EffectConfig, EffectRouting } from '../types';

// Audio Context Management
let audioContext: AudioContext | null = null;

export const getAudioContext = (): AudioContext => {
  if (!audioContext) {
    audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  return audioContext;
};

export const resumeAudioContext = async (): Promise<void> => {
  if (audioContext && audioContext.state === 'suspended') {
    await audioContext.resume();
  }
};

export const suspendAudioContext = async (): Promise<void> => {
  if (audioContext && audioContext.state === 'running') {
    await audioContext.suspend();
  }
};

// Audio Node Creation
export const createGainNode = (
  context: AudioContext,
  gainValue: number = 1
): GainNode => {
  const gainNode = context.createGain();
  gainNode.gain.value = gainValue;
  return gainNode;
};

export const createOscillatorNode = (
  context: AudioContext,
  type: OscillatorType = 'sine',
  frequency: number = 440
): OscillatorNode => {
  const oscillator = context.createOscillator();
  oscillator.type = type;
  oscillator.frequency.value = frequency;
  return oscillator;
};

// Effect Nodes
export const createDistortionNode = (
  context: AudioContext,
  config: Partial<EffectConfig> = {}
): { input: AudioNode; output: AudioNode; update: (config: Partial<EffectConfig>) => void } => {
  const input = context.createGain();
  const waveshaper = context.createWaveShaper();
  const output = context.createGain();
  
  const curve = new Float32Array(44100);
  const drive = config.parameters?.drive ?? 0.5;
  for (let i = 0; i < curve.length; i++) {
    const x = (i / curve.length) * 2 - 1;
    curve[i] = Math.min(Math.max(x * (1 + drive * 10), -1), 1);
  }
  waveshaper.curve = curve;
  output.gain.value = config.parameters?.output ?? 0.8;
  
  input.connect(waveshaper);
  waveshaper.connect(output);
  
  return {
    input,
    output,
    update: (newConfig: Partial<EffectConfig>) => {
      const newDrive = newConfig.parameters?.drive ?? drive;
      const newCurve = new Float32Array(44100);
      for (let i = 0; i < newCurve.length; i++) {
        const x = (i / newCurve.length) * 2 - 1;
        newCurve[i] = Math.min(Math.max(x * (1 + newDrive * 10), -1), 1);
      }
      waveshaper.curve = newCurve;
      output.gain.value = newConfig.parameters?.output ?? 0.8;
    },
  };
};

export const createPCFNode = (
  context: AudioContext,
  config: Partial<EffectConfig> = {}
): { input: AudioNode; output: AudioNode; update: (config: Partial<EffectConfig>) => void } => {
  const input = context.createGain();
  const delay = context.createDelay();
  const feedback = context.createGain();
  const filter = context.createBiquadFilter();
  const output = context.createGain();
  
  const cutoff = config.parameters?.cutoff ?? 0.5;
  const resonance = config.parameters?.resonance ?? 0.5;
  const delayTime = config.parameters?.delay ?? 0.002;
  const feedbackGain = config.parameters?.feedback ?? 0.3;
  
  delay.delayTime.value = delayTime;
  feedback.gain.value = feedbackGain;
  filter.type = 'lowpass';
  filter.frequency.value = 200 + cutoff * 10000;
  filter.Q.value = 1 + resonance * 10;
  
  input.connect(delay);
  delay.connect(feedback);
  feedback.connect(delay);
  delay.connect(filter);
  filter.connect(output);
  
  return {
    input,
    output,
    update: (newConfig: Partial<EffectConfig>) => {
      if (newConfig.parameters?.cutoff !== undefined) {
        filter.frequency.value = 200 + newConfig.parameters.cutoff * 10000;
      }
      if (newConfig.parameters?.resonance !== undefined) {
        filter.Q.value = 1 + newConfig.parameters.resonance * 10;
      }
      if (newConfig.parameters?.delay !== undefined) {
        delay.delayTime.value = newConfig.parameters.delay;
      }
      if (newConfig.parameters?.feedback !== undefined) {
        feedback.gain.value = newConfig.parameters.feedback;
      }
    },
  };
};

export const createCompressorNode = (
  context: AudioContext,
  config: Partial<EffectConfig> = {}
): { input: AudioNode; output: AudioNode; update: (config: Partial<EffectConfig>) => void } => {
  const input = context.createGain();
  const compressor = context.createDynamicsCompressor();
  const output = context.createGain();
  
  compressor.threshold.value = config.parameters?.threshold ?? -20;
  compressor.ratio.value = config.parameters?.ratio ?? 4;
  compressor.attack.value = config.parameters?.attack ?? 0.01;
  compressor.release.value = config.parameters?.release ?? 0.1;
  compressor.knee.value = config.parameters?.knee ?? 5;
  
  input.connect(compressor);
  compressor.connect(output);
  
  return {
    input,
    output,
    update: (newConfig: Partial<EffectConfig>) => {
      if (newConfig.parameters?.threshold !== undefined) {
        compressor.threshold.value = newConfig.parameters.threshold;
      }
      if (newConfig.parameters?.ratio !== undefined) {
        compressor.ratio.value = newConfig.parameters.ratio;
      }
      if (newConfig.parameters?.attack !== undefined) {
        compressor.attack.value = newConfig.parameters.attack;
      }
      if (newConfig.parameters?.release !== undefined) {
        compressor.release.value = newConfig.parameters.release;
      }
      if (newConfig.parameters?.knee !== undefined) {
        compressor.knee.value = newConfig.parameters.knee;
      }
    },
  };
};

export const createDelayNode = (
  context: AudioContext,
  config: Partial<EffectConfig> = {}
): { input: AudioNode; output: AudioNode; update: (config: Partial<EffectConfig>) => void } => {
  const input = context.createGain();
  const delay = context.createDelay();
  const feedback = context.createGain();
  const filter = context.createBiquadFilter();
  const output = context.createGain();
  
  delay.delayTime.value = config.parameters?.time ?? 0.5;
  feedback.gain.value = config.parameters?.feedback ?? 0.3;
  filter.type = 'lowpass';
  filter.frequency.value = 2000 + (config.parameters?.cutoff ?? 0.8) * 10000;
  
  input.connect(delay);
  delay.connect(feedback);
  delay.connect(filter);
  filter.connect(output);
  feedback.connect(delay);
  
  return {
    input,
    output,
    update: (newConfig: Partial<EffectConfig>) => {
      if (newConfig.parameters?.time !== undefined) {
        delay.delayTime.value = newConfig.parameters.time;
      }
      if (newConfig.parameters?.feedback !== undefined) {
        feedback.gain.value = newConfig.parameters.feedback;
      }
      if (newConfig.parameters?.cutoff !== undefined) {
        filter.frequency.value = 2000 + newConfig.parameters.cutoff * 10000;
      }
    },
  };
};

export const createEffectNode = (
  context: AudioContext,
  effect: EffectType,
  config: Partial<EffectConfig> = {}
): { input: AudioNode; output: AudioNode; update: (config: Partial<EffectConfig>) => void } => {
  switch (effect) {
    case 'distortion':
      return createDistortionNode(context, config);
    case 'pcf':
      return createPCFNode(context, config);
    case 'compressor':
      return createCompressorNode(context, config);
    case 'delay':
      return createDelayNode(context, config);
    default:
      const input = context.createGain();
      const output = context.createGain();
      input.connect(output);
      return { input, output, update: () => {} };
  }
};

// Routing Utilities
export const connectInsertRouting = (
  source: AudioNode,
  effects: Map<EffectType, { input: AudioNode; output: AudioNode }>,
  routing: EffectRouting,
  destination: AudioNode
): void => {
  let current = source;
  for (const effect of routing.insert) {
    const effectNode = effects.get(effect);
    if (effectNode) {
      current.connect(effectNode.input);
      current = effectNode.output;
    }
  }
  current.connect(destination);
};

export const connectSendRouting = (
  source: AudioNode,
  effects: Map<EffectType, { input: AudioNode; output: AudioNode }>,
  routing: EffectRouting,
  destination: AudioNode,
  sendLevel: number = 0.5
): { dry: AudioNode; wet: AudioNode } => {
  const dry = source;
  const wet = source.context.createGain();
  wet.gain.value = sendLevel;
  
  source.connect(dry);
  source.connect(wet);
  
  let current = wet;
  for (const effect of routing.send) {
    const effectNode = effects.get(effect);
    if (effectNode) {
      current.connect(effectNode.input);
      current = effectNode.output;
    }
  }
  
  current.connect(destination);
  
  return { dry, wet };
};
