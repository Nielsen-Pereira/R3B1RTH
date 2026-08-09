/**
 * Distortion Effect
 * Recreates the ReBirth RB-338's distortion effect
 */

export interface DistortionEffect {
  context: AudioContext;
  input: AudioNode;
  output: AudioNode;
  bypass: () => void;
  enable: () => void;
  setAmount: (amount: number) => void;
  setEnabled: (enabled: boolean) => void;
  dispose: () => void;
}

/**
 * Creates a distortion effect node
 * Uses a waveshaper for distortion
 */
export function createDistortionEffect(context: AudioContext): DistortionEffect {
  const input = context.createGain();
  const output = context.createGain();
  
  const waveshaper = context.createWaveShaper();
  const drive = context.createGain();
  const makeUpGain = context.createGain();
  
  input.connect(drive);
  drive.connect(waveshaper);
  waveshaper.connect(makeUpGain);
  makeUpGain.connect(output);
  
  const createDistortionCurve = (amount: number): Float32Array => {
    const curve = new Float32Array(44100);
    const k = amount * 10;
    
    for (let i = 0; i < curve.length; i++) {
      const x = (i * 2) / curve.length - 1;
      curve[i] = (Math.PI + k) * x / (Math.PI + k * Math.abs(x));
    }
    
    return curve;
  };
  
  let isEnabled = false;
  let currentAmount = 50;
  let curve: Float32Array;
  
  const setAmount = (amount: number) => {
    currentAmount = Math.max(0, Math.min(100, amount));
    curve = createDistortionCurve(currentAmount / 100);
    waveshaper.curve = curve;
    drive.gain.value = 1 + (currentAmount / 50);
    makeUpGain.gain.value = 1 + (currentAmount / 200);
  };
  
  const setEnabled = (enabled: boolean) => {
    isEnabled = enabled;
    if (isEnabled) {
      input.connect(drive);
      drive.connect(waveshaper);
      waveshaper.connect(makeUpGain);
      makeUpGain.connect(output);
    } else {
      input.disconnect();
      drive.disconnect();
      waveshaper.disconnect();
      makeUpGain.disconnect();
      input.connect(output);
    }
  };
  
  const bypass = () => setEnabled(false);
  const enable = () => setEnabled(true);
  
  const dispose = () => {
    input.disconnect();
    drive.disconnect();
    waveshaper.disconnect();
    makeUpGain.disconnect();
    output.disconnect();
  };
  
  curve = createDistortionCurve(0.5);
  waveshaper.curve = curve;
  setAmount(50);
  setEnabled(false);
  
  return {
    context,
    input,
    output,
    bypass,
    enable,
    setAmount,
    setEnabled,
    dispose,
  };
}

export default createDistortionEffect;