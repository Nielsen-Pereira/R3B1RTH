/**
 * Compressor Effect
 * Recreates the ReBirth RB-338's compressor effect
 */

export interface CompressorEffect {
  context: AudioContext;
  input: AudioNode;
  output: AudioNode;
  bypass: () => void;
  enable: () => void;
  setThreshold: (threshold: number) => void;
  setRatio: (ratio: number) => void;
  setEnabled: (enabled: boolean) => void;
  dispose: () => void;
}

/**
 * Creates a compressor effect node
 */
export function createCompressorEffect(context: AudioContext): CompressorEffect {
  const input = context.createGain();
  const output = context.createGain();
  
  const compressor = context.createDynamicsCompressor();
  
  input.connect(compressor);
  compressor.connect(output);
  
  let isEnabled = false;
  
  const setThreshold = (threshold: number) => {
    compressor.threshold.value = Math.max(-100, Math.min(0, threshold - 48));
  };
  
  const setRatio = (ratio: number) => {
    compressor.ratio.value = Math.max(1, Math.min(20, ratio));
  };
  
  compressor.attack.value = 0.003;
  compressor.release.value = 0.25;
  compressor.knee.value = 30;
  
  const setEnabled = (enabled: boolean) => {
    isEnabled = enabled;
    if (isEnabled) {
      input.connect(compressor);
      compressor.connect(output);
    } else {
      input.disconnect();
      compressor.disconnect();
      input.connect(output);
    }
  };
  
  const bypass = () => setEnabled(false);
  const enable = () => setEnabled(true);
  
  const dispose = () => {
    input.disconnect();
    compressor.disconnect();
    output.disconnect();
  };
  
  setThreshold(-24);
  setRatio(4);
  setEnabled(false);
  
  return {
    context,
    input,
    output,
    bypass,
    enable,
    setThreshold,
    setRatio,
    setEnabled,
    dispose,
  };
}

export default createCompressorEffect;