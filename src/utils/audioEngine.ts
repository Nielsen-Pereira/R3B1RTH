import { AudioNodeConfig, EffectType } from '../types/audio';

interface AudioContextType extends AudioContext {
  createOscillator(): OscillatorNode;
  createGain(): GainNode;
  createBiquadFilter(): BiquadFilterNode;
  createDelay(maxDelayTime?: number): DelayNode;
  createAnalyser(): AnalyserNode;
  createWaveShaper(): WaveShaperNode;
  createConvolver(): ConvolverNode;
  createChannelSplitter(destinationCount?: number): ChannelSplitterNode;
  createChannelMerger(destinationCount?: number): ChannelMergerNode;
  createConstantSource(): ConstantSourceNode;
  createBufferSource(): AudioBufferSourceNode;
  createBuffer(size: number, sampleRate: number): AudioBuffer;
  destination: AudioDestinationNode;
  currentTime: number;
  sampleRate: number;
}

function hasDynamicsCompressor(ctx: AudioContextType): ctx is AudioContextType & { DynamicsCompressor: new () => DynamicsCompressorNode } {
  return typeof (ctx as any).DynamicsCompressor === 'function';
}

let audioContext: AudioContextType | null = null;

export function getAudioContext(): AudioContextType {
  if (!audioContext) {
    audioContext = new (window.AudioContext || (window as any).webkitAudioContext)() as AudioContextType;
  }
  return audioContext;
}

export function resumeAudioContext(): Promise<void> {
  if (audioContext && typeof (audioContext as any).resume === 'function') {
    return (audioContext as any).resume();
  }
  return Promise.resolve();
}

class WhiteNoiseGenerator {
  private ctx: AudioContextType;
  private buffer: AudioBuffer | null = null;
  private bufferSource: AudioBufferSourceNode | null = null;
  private gainNode: GainNode;
  private output: GainNode;
  constructor(ctx: AudioContextType) {
    this.ctx = ctx;
    this.gainNode = ctx.createGain();
    this.output = ctx.createGain();
    this.gainNode.connect(this.output);
    this.createNoiseBuffer();
  }
  private createNoiseBuffer(): void {
    const bufferSize = this.ctx.sampleRate * 0.5;
    this.buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = this.buffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) {
      data[i] = Math.random() * 2 - 1;
    }
  }
  start(time: number = 0): void {
    if (!this.buffer) this.createNoiseBuffer();
    if (this.bufferSource) this.bufferSource.stop();
    this.bufferSource = this.ctx.createBufferSource();
    this.bufferSource.buffer = this.buffer!;
    this.bufferSource.loop = true;
    this.bufferSource.start(time);
    this.bufferSource.connect(this.gainNode);
  }
  stop(time: number = 0): void {
    if (this.bufferSource) {
      this.bufferSource.stop(time);
      this.bufferSource = null;
    }
  }
  setGain(gain: number): void { this.gainNode.gain.value = gain; }
  connect(destination: AudioNode): void { this.output.connect(destination); }
  disconnect(): void { this.output.disconnect(); }
  getOutput(): GainNode { return this.output; }
}

class TB303Synth {
  private ctx: AudioContextType;
  private oscillator: OscillatorNode;
  private gainNode: GainNode;
  private filter: BiquadFilterNode;
  private filterEnv: GainNode;
  private ampEnv: GainNode;
  private output: GainNode;
  constructor(ctx: AudioContextType) {
    this.ctx = ctx;
    this.oscillator = ctx.createOscillator();
    this.gainNode = ctx.createGain();
    this.filter = ctx.createBiquadFilter();
    this.filterEnv = ctx.createGain();
    this.ampEnv = ctx.createGain();
    this.output = ctx.createGain();
    this.filter.type = 'lowpass';
    this.filter.frequency.value = 1000;
    this.filter.Q.value = 10;
    this.oscillator.connect(this.filter);
    this.filter.connect(this.filterEnv);
    this.filterEnv.connect(this.ampEnv);
    this.ampEnv.connect(this.output);
    this.oscillator.type = 'square';
    this.filterEnv.gain.value = 0;
  }
  setFrequency(freq: number): void { this.oscillator.frequency.value = freq; }
  setFilterCutoff(cutoff: number): void { this.filter.frequency.value = cutoff; }
  setFilterResonance(resonance: number): void { this.filter.Q.value = resonance; }
  setFilterEnvelope(amount: number): void { this.filterEnv.gain.value = amount; }
  setAmplitude(amp: number): void { this.ampEnv.gain.value = amp; }
  start(time: number = 0): void { this.oscillator.start(time); }
  stop(time: number = 0): void { this.oscillator.stop(time); }
  connect(destination: AudioNode): void { this.output.connect(destination); }
  disconnect(): void { this.output.disconnect(); }
  getOutput(): GainNode { return this.output; }
}

class DrumInstrument {
  protected ctx: AudioContextType;
  protected output: GainNode;
  constructor(ctx: AudioContextType) {
    this.ctx = ctx;
    this.output = ctx.createGain();
    this.output.gain.value = 0;
  }
  trigger(time: number, velocity: number = 1.0): void {}
  connect(destination: AudioNode): void { this.output.connect(destination); }
  disconnect(): void { this.output.disconnect(); }
  getOutput(): GainNode { return this.output; }
  setOutputGain(gain: number): void { this.output.gain.value = gain; }
}

class KickDrum extends DrumInstrument {
  private oscillator: OscillatorNode;
  private gain: GainNode;
  private filter: BiquadFilterNode;
  constructor(ctx: AudioContextType) {
    super(ctx);
    this.oscillator = ctx.createOscillator();
    this.gain = ctx.createGain();
    this.filter = ctx.createBiquadFilter();
    this.oscillator.type = 'sine';
    this.filter.type = 'lowpass';
    this.filter.frequency.value = 200;
    this.oscillator.connect(this.filter);
    this.filter.connect(this.gain);
    this.gain.connect(this.output);
  }
  trigger(time: number, velocity: number = 1.0): void {
    this.oscillator.frequency.setValueAtTime(150, time);
    this.oscillator.frequency.exponentialRampToValueAtTime(30, time + 0.1);
    this.gain.gain.setValueAtTime(velocity, time);
    this.gain.gain.exponentialRampToValueAtTime(0.001, time + 0.3);
    this.filter.frequency.exponentialRampToValueAtTime(50, time + 0.1);
    this.oscillator.start(time);
    this.oscillator.stop(time + 0.3);
  }
}

class SnareDrum extends DrumInstrument {
  private noiseGenerator: WhiteNoiseGenerator;
  private noiseGain: GainNode;
  private tone: OscillatorNode;
  private toneGain: GainNode;
  private filter: BiquadFilterNode;
  constructor(ctx: AudioContextType) {
    super(ctx);
    this.noiseGenerator = new WhiteNoiseGenerator(ctx);
    this.noiseGain = ctx.createGain();
    this.tone = ctx.createOscillator();
    this.toneGain = ctx.createGain();
    this.filter = ctx.createBiquadFilter();
    this.tone.type = 'triangle';
    this.tone.frequency.value = 200;
    this.filter.type = 'highpass';
    this.filter.frequency.value = 1000;
    this.tone.connect(this.toneGain);
    this.toneGain.connect(this.filter);
    this.filter.connect(this.output);
    this.noiseGenerator.connect(this.noiseGain);
    this.noiseGain.connect(this.output);
  }
  trigger(time: number, velocity: number = 1.0): void {
    this.toneGain.gain.setValueAtTime(velocity * 0.5, time);
    this.toneGain.gain.exponentialRampToValueAtTime(0.001, time + 0.2);
    this.tone.start(time);
    this.tone.stop(time + 0.2);
    this.noiseGenerator.start(time);
    this.noiseGenerator.setGain(velocity * 0.3);
    this.noiseGenerator.stop(time + 0.1);
  }
}

class HiHat extends DrumInstrument {
  private noiseGenerator: WhiteNoiseGenerator;
  private gain: GainNode;
  private filter: BiquadFilterNode;
  constructor(ctx: AudioContextType) {
    super(ctx);
    this.noiseGenerator = new WhiteNoiseGenerator(ctx);
    this.gain = ctx.createGain();
    this.filter = ctx.createBiquadFilter();
    this.filter.type = 'highpass';
    this.filter.frequency.value = 5000;
    this.noiseGenerator.connect(this.filter);
    this.filter.connect(this.gain);
    this.gain.connect(this.output);
  }
  trigger(time: number, velocity: number = 1.0): void {
    this.gain.gain.setValueAtTime(velocity * 0.5, time);
    this.gain.gain.exponentialRampToValueAtTime(0.001, time + 0.05);
    this.noiseGenerator.start(time);
    this.noiseGenerator.stop(time + 0.05);
  }
}