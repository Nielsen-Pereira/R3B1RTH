/**
 * PCF (Pattern Controlled Filter) Effect
 * Recreates the ReBirth RB-338's PCF effect
 */

export interface PCFEffect {
  context: AudioContext;
  input: AudioNode;
  output: AudioNode;
  bypass: () => void;
  enable: () => void;
  setPattern: (pattern: number) => void;
  setEnabled: (enabled: boolean) => void;
  dispose: () => void;
}

const PCF_PATTERNS = 32;

/**
 * Creates a PCF effect node
 * The PCF effect applies a filter with a pattern-controlled cutoff frequency
 */
export function createPCFEffect(context: AudioContext): PCFEffect {
  const input = context.createGain();
  const output = context.createGain();
  const filter = context.createBiquadFilter();
  const patternNode = context.createGain();
  
  const lfo = context.createOscillator();
  const lfoGain = context.createGain();
  
  filter.type = 'lowpass';
  filter.frequency.value = 1000;
  filter.Q.value = 1;
  
  lfo.type = 'sawtooth';
  lfo.frequency.value = 0.5;
  lfoGain.gain.value = 500;
  
  input.connect(filter);
  filter.connect(output);
  
  lfo.connect(lfoGain);
  lfoGain.connect(filter.frequency);
  
  lfo.start();
  
  let isEnabled = false;
  let currentPattern = 0;
  
  const setPattern = (pattern: number) => {
    currentPattern = Math.max(0, Math.min(PCF_PATTERNS - 1, pattern));
    const patternData = getPatternData(currentPattern);
    lfo.frequency.value = patternData.frequency;
    lfoGain.gain.value = patternData.depth;
    filter.frequency.value = patternData.baseFrequency;
  };
  
  const setEnabled = (enabled: boolean) => {
    isEnabled = enabled;
    if (isEnabled) {
      input.connect(filter);
      filter.connect(output);
    } else {
      input.disconnect();
      filter.disconnect();
      input.connect(output);
    }
  };
  
  const bypass = () => setEnabled(false);
  const enable = () => setEnabled(true);
  
  const dispose = () => {
    lfo.stop();
    input.disconnect();
    filter.disconnect();
    lfo.disconnect();
    lfoGain.disconnect();
    output.disconnect();
  };
  
  setPattern(0);
  setEnabled(false);
  
  return {
    context,
    input,
    output,
    bypass,
    enable,
    setPattern,
    setEnabled,
    dispose,
  };
}

interface PatternData {
  frequency: number;
  depth: number;
  baseFrequency: number;
}

function getPatternData(pattern: number): PatternData {
  const patterns: PatternData[] = [
    { frequency: 0.5, depth: 500, baseFrequency: 1000 },
    { frequency: 1.0, depth: 300, baseFrequency: 800 },
    { frequency: 0.25, depth: 800, baseFrequency: 1200 },
    { frequency: 2.0, depth: 200, baseFrequency: 600 },
    { frequency: 0.75, depth: 600, baseFrequency: 900 },
    { frequency: 1.5, depth: 400, baseFrequency: 700 },
    { frequency: 0.125, depth: 1000, baseFrequency: 1500 },
    { frequency: 3.0, depth: 150, baseFrequency: 500 },
    { frequency: 0.333, depth: 700, baseFrequency: 1100 },
    { frequency: 4.0, depth: 100, baseFrequency: 400 },
    { frequency: 0.666, depth: 550, baseFrequency: 950 },
    { frequency: 2.5, depth: 250, baseFrequency: 550 },
    { frequency: 0.2, depth: 900, baseFrequency: 1300 },
    { frequency: 5.0, depth: 120, baseFrequency: 350 },
    { frequency: 0.4, depth: 650, baseFrequency: 1050 },
    { frequency: 3.5, depth: 180, baseFrequency: 450 },
    ...Array(16).fill(null).map((_, i) => patterns[i % 8]),
  ];
  
  return patterns[pattern % PCF_PATTERNS];
}

export default createPCFEffect;