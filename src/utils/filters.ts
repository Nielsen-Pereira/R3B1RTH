import { AudioNodeConfig } from '../types/audio';

interface AudioContextType extends AudioContext {
  createBiquadFilter(): BiquadFilterNode;
  createGain(): GainNode;
  createOscillator(): OscillatorNode;
  createWaveShaper(): WaveShaperNode;
  createDelay(maxDelayTime?: number): DelayNode;
  sampleRate: number;
  currentTime: number;
}

export class LadderFilter {
  private ctx: AudioContextType;
  private input: GainNode;
  private output: GainNode;
  private filters: BiquadFilterNode[];
  private resonance: number = 0;
  private cutoff: number = 1000;

  constructor(ctx: AudioContextType) {
    this.ctx = ctx;
    this.input = ctx.createGain();
    this.output = ctx.createGain();
    this.filters = [];
    for (let i = 0; i < 4; i++) {
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.Q.value = 0.5;
      this.filters.push(filter);
    }
    this.input.connect(this.filters[0]);
    for (let i = 0; i < 3; i++) {
      this.filters[i].connect(this.filters[i + 1]);
    }
    this.filters[3].connect(this.output);
    this.setCutoff(this.cutoff);
    this.setResonance(this.resonance);
  }

  setCutoff(freq: number): void {
    this.cutoff = freq;
    this.filters[0].frequency.value = freq * 1.02;
    this.filters[1].frequency.value = freq * 0.98;
    this.filters[2].frequency.value = freq * 1.01;
    this.filters[3].frequency.value = freq * 0.99;
  }

  setResonance(res: number): void {
    this.resonance = Math.min(Math.max(res, 0), 1);
    const q = 0.5 + (this.resonance * 15);
    this.filters.forEach(filter => { filter.Q.value = q; });
  }

  getInput(): GainNode { return this.input; }
  getOutput(): GainNode { return this.output; }
  connect(destination: AudioNode): void { this.output.connect(destination); }
  disconnect(): void { this.output.disconnect(); }
}

export class TB303Filter {
  private ctx: AudioContextType;
  private ladderFilter: LadderFilter;
  private input: GainNode;
  private output: GainNode;
  constructor(ctx: AudioContextType) {
    this.ctx = ctx;
    this.input = ctx.createGain();
    this.output = ctx.createGain();
    this.ladderFilter = new LadderFilter(ctx);
    this.input.connect(this.ladderFilter.getInput());
    this.ladderFilter.getOutput().connect(this.output);
  }
  setCutoff(freq: number): void { this.ladderFilter.setCutoff(freq); }
  setResonance(res: number): void { this.ladderFilter.setResonance(res); }
  getInput(): GainNode { return this.input; }
  getOutput(): GainNode { return this.output; }
  connect(destination: AudioNode): void { this.output.connect(destination); }
  disconnect(): void { this.output.disconnect(); }
}

export class TR808KickFilter {
  private ctx: AudioContextType;
  private input: GainNode;
  private output: GainNode;
  private filter: BiquadFilterNode;
  constructor(ctx: AudioContextType) {
    this.ctx = ctx;
    this.input = ctx.createGain();
    this.output = ctx.createGain();
    this.filter = ctx.createBiquadFilter();
    this.filter.type = 'lowpass';
    this.filter.frequency.value = 300;
    this.filter.Q.value = 1;
    this.input.connect(this.filter);
    this.filter.connect(this.output);
  }
  setCutoff(freq: number): void { this.filter.frequency.value = freq; }
  setResonance(res: number): void { this.filter.Q.value = res; }
  getInput(): GainNode { return this.input; }
  getOutput(): GainNode { return this.output; }
  connect(destination: AudioNode): void { this.output.connect(destination); }
  disconnect(): void { this.output.disconnect(); }
}

export class CombFilter {
  private ctx: AudioContextType;
  private input: GainNode;
  private output: GainNode;
  private delay: DelayNode;
  private feedback: GainNode;
  private delayTime: number = 0.003;
  private feedbackAmount: number = 0.5;
  constructor(ctx: AudioContextType) {
    this.ctx = ctx;
    this.input = ctx.createGain();
    this.output = ctx.createGain();
    this.delay = ctx.createDelay(0.1);
    this.feedback = ctx.createGain();
    this.delay.delayTime.value = this.delayTime;
    this.feedback.gain.value = this.feedbackAmount;
    this.input.connect(this.delay);
    this.delay.connect(this.output);
    this.delay.connect(this.feedback);
    this.feedback.connect(this.delay);
  }
  setDelayTime(time: number): void { this.delayTime = time; this.delay.delayTime.value = time; }
  setFeedback(feedback: number): void { this.feedbackAmount = feedback; this.feedback.gain.value = feedback; }
  getInput(): GainNode { return this.input; }
  getOutput(): GainNode { return this.output; }
  connect(destination: AudioNode): void { this.output.connect(destination); }
  disconnect(): void { this.output.disconnect(); }
}