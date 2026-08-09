/**
 * Delay Effect
 * Recreates the ReBirth RB-338's delay effect
 */

export interface DelayEffect {
  context: AudioContext;
  input: AudioNode;
  output: AudioNode;
  bypass: () => void;
  enable: () => void;
  setStep: (step: number) => void;
  setTriplet: (triplet: boolean) => void;
  setFeedback: (feedback: number) => void;
  setEnabled: (enabled: boolean) => void;
  dispose: () => void;
}

const MAX_DELAY_STEPS = 16;

/**
 * Creates a delay effect node
 * The delay is step-based, syncing to the sequencer tempo
 */
export function createDelayEffect(context: AudioContext, tempo: number): DelayEffect {
  const input = context.createGain();
  const output = context.createGain();
  
  const wetGain = context.createGain();
  const dryGain = context.createGain();
  
  dryGain.gain.value = 1;
  wetGain.gain.value = 0;
  
  const maxDelayTime = 2;
  const delayNode = context.createDelay(maxDelayTime);
  const feedbackNode = context.createGain();
  
  input.connect(dryGain);
  dryGain.connect(output);
  
  input.connect(delayNode);
  delayNode.connect(feedbackNode);
  feedbackNode.connect(delayNode);
  feedbackNode.connect(wetGain);
  wetGain.connect(output);
  
  let isEnabled = false;
  let currentStep = 1;
  let isTriplet = false;
  let feedbackAmount = 0.5;
  
  const calculateDelayTime = (step: number, triplet: boolean, bpm: number) => {
    const beatDuration = 60 / bpm;
    const stepMultiplier = triplet ? (2 / 3) : 1;
    return beatDuration * step * stepMultiplier;
  };
  
  const updateDelay = () => {
    const delayTime = calculateDelayTime(currentStep, isTriplet, tempo);
    delayNode.delayTime.value = Math.min(delayTime, maxDelayTime);
  };
  
  const setStep = (step: number) => {
    currentStep = Math.max(1, Math.min(MAX_DELAY_STEPS, step));
    updateDelay();
  };
  
  const setTriplet = (triplet: boolean) => {
    isTriplet = triplet;
    updateDelay();
  };
  
  const setFeedback = (feedback: number) => {
    feedbackAmount = Math.max(0, Math.min(100, feedback)) / 100;
    feedbackNode.gain.value = feedbackAmount;
  };
  
  const setEnabled = (enabled: boolean) => {
    isEnabled = enabled;
    if (isEnabled) {
      dryGain.gain.value = 0.5;
      wetGain.gain.value = 0.5;
    } else {
      dryGain.gain.value = 1;
      wetGain.gain.value = 0;
    }
  };
  
  const bypass = () => setEnabled(false);
  const enable = () => setEnabled(true);
  
  const dispose = () => {
    input.disconnect();
    delayNode.disconnect();
    feedbackNode.disconnect();
    dryGain.disconnect();
    wetGain.disconnect();
    output.disconnect();
  };
  
  setStep(1);
  setTriplet(false);
  setFeedback(50);
  setEnabled(false);
  
  return {
    context,
    input,
    output,
    bypass,
    enable,
    setStep,
    setTriplet,
    setFeedback,
    setEnabled,
    dispose,
  };
}

export default createDelayEffect;