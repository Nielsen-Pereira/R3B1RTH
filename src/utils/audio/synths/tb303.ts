/**
 * TB-303 Synthesizer
 * Recreates the Roland TB-303 bass line synthesizer
 */

export interface TB303Synth {
  context: AudioContext;
  input: AudioNode;
  output: AudioNode;
  play: (note: string, accent: boolean) => void;
  stop: (note: string) => void;
  setWaveform: (waveform: 'sawtooth' | 'square') => void;
  setTune: (value: number) => void;
  setCutoff: (value: number) => void;
  setResonance: (value: number) => void;
  setEnvMod: (value: number) => void;
  setDecay: (value: number) => void;
  setAccent: (value: number) => void;
  dispose: () => void;
}

const NOTE_FREQUENCIES: Record<string, number> = {
  'C0': 16.35, 'C#0': 17.32, 'D0': 18.35, 'D#0': 19.45, 'E0': 20.60, 'F0': 21.83,
  'F#0': 23.12, 'G0': 24.50, 'G#0': 25.96, 'A0': 27.50, 'A#0': 29.14, 'B0': 30.87,
  'C1': 32.70, 'C#1': 34.65, 'D1': 36.71, 'D#1': 38.89, 'E1': 41.20, 'F1': 43.65,
  'F#1': 46.25, 'G1': 49.00, 'G#1': 51.91, 'A1': 55.00, 'A#1': 58.27, 'B1': 61.74,
  'C2': 65.41, 'C#2': 69.30, 'D2': 73.42, 'D#2': 77.78, 'E2': 82.41, 'F2': 87.31,
  'F#2': 92.50, 'G2': 98.00, 'G#2': 103.83, 'A2': 110.00, 'A#2': 116.54, 'B2': 123.47,
  'C3': 130.81, 'C#3': 138.59, 'D3': 146.83, 'D#3': 155.56, 'E3': 164.81, 'F3': 174.61,
  'F#3': 185.00, 'G3': 196.00, 'G#3': 207.65, 'A3': 220.00, 'A#3': 233.08, 'B3': 246.94,
  'C4': 261.63, 'C#4': 277.18, 'D4': 293.66, 'D#4': 311.13, 'E4': 329.63, 'F4': 349.23,
};

/**
 * Creates a TB-303 synthesizer
 */
export function createTB303Synth(context: AudioContext): TB303Synth {
  const input = context.createGain();
  const output = context.createGain();
  
  const oscillator = context.createOscillator();
  const oscillatorGain = context.createGain();
  const filter = context.createBiquadFilter();
  const envGain = context.createGain();
  const envOsc = context.createOscillator();
  const envFilter = context.createBiquadFilter();
  const accentGain = context.createGain();
  
  oscillator.connect(oscillatorGain);
  oscillatorGain.connect(filter);
  filter.connect(output);
  
  envOsc.connect(envGain);
  envGain.connect(envFilter);
  envFilter.connect(filter.frequency);
  accentGain.connect(envGain.gain);
  
  oscillator.start();
  envOsc.start();
  
  let params = {
    waveform: 'sawtooth' as 'sawtooth' | 'square',
    tune: 0,
    cutoff: 64,
    resonance: 0,
    envMod: 64,
    decay: 32,
    accent: 64,
    vintage: false,
  };
  
  const activeNotes = new Map<string, { 
    oscillator: OscillatorNode; 
    gain: GainNode; 
    filter: BiquadFilterNode;
    envOsc: OscillatorNode;
    envGain: GainNode;
    accentGain: GainNode;
  }>();
  
  const play = (note: string, accent: boolean) => {
    if (!NOTE_FREQUENCIES[note]) return;
    
    const frequency = NOTE_FREQUENCIES[note] * Math.pow(2, params.tune / 12);
    const now = context.currentTime;
    
    const osc = context.createOscillator();
    const gain = context.createGain();
    const filterNode = context.createBiquadFilter();
    const envOscNode = context.createOscillator();
    const envGainNode = context.createGain();
    const accentGainNode = context.createGain();
    
    osc.type = params.waveform;
    osc.frequency.value = frequency;
    
    filterNode.type = 'lowpass';
    filterNode.frequency.value = params.cutoff * 10;
    filterNode.Q.value = params.resonance * 10;
    
    envOscNode.type = 'sawtooth';
    envOscNode.frequency.value = 5;
    envGainNode.gain.value = 0;
    accentGainNode.gain.value = accent ? params.accent / 100 : 0;
    
    osc.connect(gain);
    gain.connect(filterNode);
    filterNode.connect(output);
    
    envOscNode.connect(envGainNode);
    accentGainNode.connect(envGainNode.gain);
    envGainNode.connect(filterNode.frequency);
    
    const decayTime = 0.1 + (params.decay / 100) * 0.5;
    const envModAmount = (params.envMod / 100) * (params.cutoff * 10);
    const baseCutoff = params.cutoff * 10;
    const minCutoff = 100;
    
    osc.start(now);
    envOscNode.start(now);
    
    gain.gain.setValueAtTime(0.5, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + decayTime);
    
    filterNode.frequency.setValueAtTime(baseCutoff + envModAmount, now);
    filterNode.frequency.exponentialRampToValueAtTime(minCutoff, now + decayTime);
    
    accentGainNode.gain.setValueAtTime(accent ? params.accent / 100 : 0, now);
    accentGainNode.gain.exponentialRampToValueAtTime(0, now + decayTime * 0.5);
    
    activeNotes.set(note, {
      oscillator: osc,
      gain,
      filter: filterNode,
      envOsc: envOscNode,
      envGain: envGainNode,
      accentGain: accentGainNode,
    });
    
    setTimeout(() => {
      stop(note);
    }, decayTime * 1000);
  };
  
  const stop = (note: string) => {
    const activeNote = activeNotes.get(note);
    if (activeNote) {
      activeNote.oscillator.stop();
      activeNote.oscillator.disconnect();
      activeNote.gain.disconnect();
      activeNote.filter.disconnect();
      activeNote.envOsc.stop();
      activeNote.envOsc.disconnect();
      activeNote.envGain.disconnect();
      activeNote.accentGain.disconnect();
      activeNotes.delete(note);
    }
  };
  
  const setWaveform = (waveform: 'sawtooth' | 'square') => {
    params.waveform = waveform;
    oscillator.type = waveform;
    activeNotes.forEach((note) => {
      note.oscillator.type = waveform;
    });
  };
  
  const setTune = (value: number) => {
    params.tune = Math.max(-24, Math.min(24, value));
  };
  
  const setCutoff = (value: number) => {
    params.cutoff = Math.max(0, Math.min(100, value));
    filter.frequency.value = params.cutoff * 10;
    activeNotes.forEach((note) => {
      note.filter.frequency.value = params.cutoff * 10;
    });
  };
  
  const setResonance = (value: number) => {
    params.resonance = Math.max(0, Math.min(100, value));
    filter.Q.value = params.resonance * 10;
    activeNotes.forEach((note) => {
      note.filter.Q.value = params.resonance * 10;
    });
  };
  
  const setEnvMod = (value: number) => {
    params.envMod = Math.max(0, Math.min(100, value));
  };
  
  const setDecay = (value: number) => {
    params.decay = Math.max(0, Math.min(100, value));
  };
  
  const setAccent = (value: number) => {
    params.accent = Math.max(0, Math.min(100, value));
  };
  
  const dispose = () => {
    oscillator.stop();
    oscillator.disconnect();
    oscillatorGain.disconnect();
    filter.disconnect();
    envOsc.stop();
    envOsc.disconnect();
    envGain.disconnect();
    envFilter.disconnect();
    accentGain.disconnect();
    
    activeNotes.forEach((note) => {
      note.oscillator.stop();
      note.oscillator.disconnect();
      note.gain.disconnect();
      note.filter.disconnect();
      note.envOsc.stop();
      note.envOsc.disconnect();
      note.envGain.disconnect();
      note.accentGain.disconnect();
    });
    activeNotes.clear();
    
    input.disconnect();
    output.disconnect();
  };
  
  setWaveform('sawtooth');
  setTune(0);
  setCutoff(64);
  setResonance(0);
  setEnvMod(64);
  setDecay(32);
  setAccent(64);
  
  return {
    context,
    input,
    output,
    play,
    stop,
    setWaveform,
    setTune,
    setCutoff,
    setResonance,
    setEnvMod,
    setDecay,
    setAccent,
    dispose,
  };
}

export default createTB303Synth;