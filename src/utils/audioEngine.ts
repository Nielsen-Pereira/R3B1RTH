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

class DistortionEffect {
  private ctx: AudioContextType;
  private input: GainNode;
  private output: GainNode;
  private waveshaper: WaveShaperNode;
  private drive: number = 0.5;
  constructor(ctx: AudioContextType) {
    this.ctx = ctx;
    this.input = ctx.createGain();
    this.output = ctx.createGain();
    this.waveshaper = ctx.createWaveShaper();
    this.input.connect(this.waveshaper);
    this.waveshaper.connect(this.output);
    this.updateCurve();
  }
  private updateCurve(): void {
    const curve = new Float32Array(1024);
    const drive = this.drive * 10;
    for (let i = 0; i < curve.length; i++) {
      const x = (i / curve.length) * 2 - 1;
      curve[i] = Math.tanh(x * drive) / Math.tanh(drive);
    }
    this.waveshaper.curve = curve;
  }
  setDrive(drive: number): void { this.drive = drive; this.updateCurve(); }
  getInput(): GainNode { return this.input; }
  getOutput(): GainNode { return this.output; }
  connect(destination: AudioNode): void { this.output.connect(destination); }
  disconnect(): void { this.output.disconnect(); }
}

class PCFEffect {
  private ctx: AudioContextType;
  private input: GainNode;
  private output: GainNode;
  private delay: DelayNode;
  private feedback: GainNode;
  private filter: BiquadFilterNode;
  private wet: GainNode;
  private dry: GainNode;
  private wetGain: number = 0.5;
  private delayTime: number = 0.003;
  private feedbackAmount: number = 0.5;
  constructor(ctx: AudioContextType) {
    this.ctx = ctx;
    this.input = ctx.createGain();
    this.output = ctx.createGain();
    this.delay = ctx.createDelay(0.1);
    this.feedback = ctx.createGain();
    this.filter = ctx.createBiquadFilter();
    this.wet = ctx.createGain();
    this.dry = ctx.createGain();
    this.filter.type = 'lowpass';
    this.filter.frequency.value = 2000;
    this.input.connect(this.dry);
    this.dry.connect(this.output);
    this.input.connect(this.delay);
    this.delay.connect(this.filter);
    this.filter.connect(this.wet);
    this.wet.connect(this.output);
    this.filter.connect(this.feedback);
    this.feedback.connect(this.delay);
    this.dry.gain.value = 1 - this.wetGain;
    this.wet.gain.value = this.wetGain;
    this.feedback.gain.value = this.feedbackAmount;
    this.delay.delayTime.value = this.delayTime;
  }
  setWet(wet: number): void {
    this.wetGain = wet;
    this.dry.gain.value = 1 - wet;
    this.wet.gain.value = wet;
  }
  setDelayTime(time: number): void { this.delayTime = time; this.delay.delayTime.value = time; }
  setFeedback(feedback: number): void { this.feedbackAmount = feedback; this.feedback.gain.value = feedback; }
  getInput(): GainNode { return this.input; }
  getOutput(): GainNode { return this.output; }
  connect(destination: AudioNode): void { this.output.connect(destination); }
  disconnect(): void { this.output.disconnect(); }
}

class CompressorEffect {
  private ctx: AudioContextType;
  private input: GainNode;
  private output: GainNode;
  private compressor: DynamicsCompressorNode | GainNode;
  constructor(ctx: AudioContextType) {
    this.ctx = ctx;
    this.input = ctx.createGain();
    this.output = ctx.createGain();
    if (hasDynamicsCompressor(ctx)) {
      this.compressor = new (ctx as any).DynamicsCompressor();
    } else {
      this.compressor = ctx.createGain();
    }
    this.input.connect(this.compressor);
    this.compressor.connect(this.output);
    if (this.compressor instanceof DynamicsCompressorNode) {
      this.compressor.threshold.value = -20;
      this.compressor.knee.value = 30;
      this.compressor.ratio.value = 4;
      this.compressor.attack.value = 0.01;
      this.compressor.release.value = 0.1;
    }
  }
  setThreshold(threshold: number): void {
    if (this.compressor instanceof DynamicsCompressorNode) {
      this.compressor.threshold.value = threshold;
    }
  }
  getInput(): GainNode { return this.input; }
  getOutput(): GainNode { return this.output; }
  connect(destination: AudioNode): void { this.output.connect(destination); }
  disconnect(): void { this.output.disconnect(); }
}

class DelayEffect {
  private ctx: AudioContextType;
  private input: GainNode;
  private output: GainNode;
  private delay: DelayNode;
  private feedback: GainNode;
  private wet: GainNode;
  private dry: GainNode;
  private wetGain: number = 0.5;
  private delayTime: number = 0.3;
  private feedbackAmount: number = 0.5;
  constructor(ctx: AudioContextType) {
    this.ctx = ctx;
    this.input = ctx.createGain();
    this.output = ctx.createGain();
    this.delay = ctx.createDelay(1.0);
    this.feedback = ctx.createGain();
    this.wet = ctx.createGain();
    this.dry = ctx.createGain();
    this.input.connect(this.dry);
    this.dry.connect(this.output);
    this.input.connect(this.delay);
    this.delay.connect(this.wet);
    this.wet.connect(this.output);
    this.delay.connect(this.feedback);
    this.feedback.connect(this.delay);
    this.dry.gain.value = 1 - this.wetGain;
    this.wet.gain.value = this.wetGain;
    this.feedback.gain.value = this.feedbackAmount;
    this.delay.delayTime.value = this.delayTime;
  }
  setWet(wet: number): void {
    this.wetGain = wet;
    this.dry.gain.value = 1 - wet;
    this.wet.gain.value = wet;
  }
  setDelayTime(time: number): void { this.delayTime = time; this.delay.delayTime.value = time; }
  setFeedback(feedback: number): void { this.feedbackAmount = feedback; this.feedback.gain.value = feedback; }
  getInput(): GainNode { return this.input; }
  getOutput(): GainNode { return this.output; }
  connect(destination: AudioNode): void { this.output.connect(destination); }
  disconnect(): void { this.output.disconnect(); }
}

class AudioEngine {
  private ctx: AudioContextType;
  private masterGain: GainNode;
  private tb303Synths: TB303Synth[];
  private kickDrums: KickDrum[];
  private snareDrums: SnareDrum[];
  private hiHats: HiHat[];
  private distortion: DistortionEffect;
  private pcf: PCFEffect;
  private compressor: CompressorEffect;
  private delay: DelayEffect;
  private bpm: number = 120;
  private isPlaying: boolean = false;
  private startTime: number = 0;
  private currentBeat: number = 0;
  private beatInterval: number = 0;
  private animationFrameId: number = 0;

  constructor() {
    this.ctx = getAudioContext();
    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.value = 0.7;
    this.masterGain.connect(this.ctx.destination);
    this.tb303Synths = [new TB303Synth(this.ctx), new TB303Synth(this.ctx)];
    this.kickDrums = [new KickDrum(this.ctx), new KickDrum(this.ctx)];
    this.snareDrums = [new SnareDrum(this.ctx), new SnareDrum(this.ctx)];
    this.hiHats = [new HiHat(this.ctx), new HiHat(this.ctx)];
    this.distortion = new DistortionEffect(this.ctx);
    this.pcf = new PCFEffect(this.ctx);
    this.compressor = new CompressorEffect(this.ctx);
    this.delay = new DelayEffect(this.ctx);
    this.distortion.getOutput().connect(this.pcf.getInput());
    this.pcf.getOutput().connect(this.compressor.getInput());
    this.compressor.getOutput().connect(this.delay.getInput());
    this.delay.getOutput().connect(this.masterGain);
    this.tb303Synths.forEach(synth => synth.connect(this.distortion.getInput()));
    this.kickDrums.forEach(kick => kick.connect(this.distortion.getInput()));
    this.snareDrums.forEach(snare => snare.connect(this.distortion.getInput()));
    this.hiHats.forEach(hat => hat.connect(this.distortion.getInput()));
    this.updateBeatInterval();
  }
  private updateBeatInterval(): void { this.beatInterval = 60 / this.bpm / 4; }
  setBPM(bpm: number): void { this.bpm = bpm; this.updateBeatInterval(); }
  getBPM(): number { return this.bpm; }
  setMasterVolume(volume: number): void { this.masterGain.gain.value = volume; }
  setDistortionDrive(drive: number): void { this.distortion.setDrive(drive); }
  setPCFWet(wet: number): void { this.pcf.setWet(wet); }
  setPCFDelayTime(time: number): void { this.pcf.setDelayTime(time); }
  setPCFFeedback(feedback: number): void { this.pcf.setFeedback(feedback); }
  setCompressorThreshold(threshold: number): void { this.compressor.setThreshold(threshold); }
  setDelayWet(wet: number): void { this.delay.setWet(wet); }
  setDelayTime(time: number): void { this.delay.setDelayTime(time); }
  setDelayFeedback(feedback: number): void { this.delay.setFeedback(feedback); }
  playTB303Note(synthIndex: number, note: number, velocity: number = 1.0): void {
    if (synthIndex >= 0 && synthIndex < this.tb303Synths.length) {
      const freq = 440 * Math.pow(2, (note - 69) / 12);
      this.tb303Synths[synthIndex].setFrequency(freq);
      this.tb303Synths[synthIndex].setAmplitude(velocity);
      this.tb303Synths[synthIndex].start(this.ctx.currentTime);
    }
  }
  stopTB303Note(synthIndex: number, time: number = 0): void {
    if (synthIndex >= 0 && synthIndex < this.tb303Synths.length) {
      this.tb303Synths[synthIndex].stop(this.ctx.currentTime + time);
    }
  }
  setTB303FilterCutoff(synthIndex: number, cutoff: number): void {
    if (synthIndex >= 0 && synthIndex < this.tb303Synths.length) {
      this.tb303Synths[synthIndex].setFilterCutoff(cutoff);
    }
  }
  setTB303FilterResonance(synthIndex: number, resonance: number): void {
    if (synthIndex >= 0 && synthIndex < this.tb303Synths.length) {
      this.tb303Synths[synthIndex].setFilterResonance(resonance);
    }
  }
  triggerKick(drumIndex: number, velocity: number = 1.0): void {
    if (drumIndex >= 0 && drumIndex < this.kickDrums.length) {
      this.kickDrums[drumIndex].trigger(this.ctx.currentTime, velocity);
    }
  }
  triggerSnare(drumIndex: number, velocity: number = 1.0): void {
    if (drumIndex >= 0 && drumIndex < this.snareDrums.length) {
      this.snareDrums[drumIndex].trigger(this.ctx.currentTime, velocity);
    }
  }
  triggerHiHat(drumIndex: number, velocity: number = 1.0): void {
    if (drumIndex >= 0 && drumIndex < this.hiHats.length) {
      this.hiHats[drumIndex].trigger(this.ctx.currentTime, velocity);
    }
  }
  start(): void {
    if (this.isPlaying) return;
    this.isPlaying = true;
    this.startTime = this.ctx.currentTime;
    this.currentBeat = 0;
    this.playBeat();
  }
  stop(): void {
    this.isPlaying = false;
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = 0;
    }
  }
  private playBeat(): void {
    if (!this.isPlaying) return;
    const now = this.ctx.currentTime;
    const elapsed = now - this.startTime;
    const beatsElapsed = Math.floor(elapsed / this.beatInterval);
    if (beatsElapsed > this.currentBeat) {
      this.currentBeat = beatsElapsed;
    }
    this.animationFrameId = requestAnimationFrame(() => this.playBeat());
  }
  getCurrentBeat(): number { return this.currentBeat; }
  destroy(): void {
    this.stop();
    this.tb303Synths.forEach(synth => synth.disconnect());
    this.kickDrums.forEach(kick => kick.disconnect());
    this.snareDrums.forEach(snare => snare.disconnect());
    this.hiHats.forEach(hat => hat.disconnect());
    this.distortion.disconnect();
    this.pcf.disconnect();
    this.compressor.disconnect();
    this.delay.disconnect();
  }
}

let audioEngineInstance: AudioEngine | null = null;

export function getAudioEngine(): AudioEngine {
  if (!audioEngineInstance) {
    audioEngineInstance = new AudioEngine();
  }
  return audioEngineInstance;
}

export function destroyAudioEngine(): void {
  if (audioEngineInstance) {
    audioEngineInstance.destroy();
    audioEngineInstance = null;
  }
}