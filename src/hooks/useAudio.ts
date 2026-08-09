import { useEffect, useRef, useCallback } from 'react';
import { useAudioStore } from '../store/audioStore';
import { useSequencerStore } from '../store/sequencerStore';

export interface AudioVoice {
  id: string;
  instrument: string;
  section: string;
  note?: string;
  accent: boolean;
  flam: boolean;
  startTime: number;
  duration: number;
  oscillator?: OscillatorNode;
  gainNode?: GainNode;
  filterNode?: BiquadFilterNode;
  stop: () => void;
}

export const useAudio = () => {
  const {
    audioContext,
    isAudioReady,
    tr808Params,
    tr909Params,
    tb303_1Params,
    tb303_2Params,
    sectionParams,
    pcfSettings,
    delaySettings,
    distortionSettings,
    compressorSettings,
    masterSettings,
    initAudioContext,
    addVoice,
    removeVoice,
  } = useAudioStore();

  const { isPlaying, tempo, currentStep, patterns, currentPattern, patternLength } = useSequencerStore();

  const activeVoices = useRef<Map<string, AudioVoice>>(new Map());
  const animationFrame = useRef<number>(0);
  const lastStep = useRef<number>(0);
  const stepStartTime = useRef<number>(0);

  const calculateStepDuration = useCallback((bpm: number) => {
    return (60 / bpm) * 1000;
  }, []);

  const createOscillator = useCallback((
    context: AudioContext,
    type: OscillatorType,
    frequency: number,
    gain: number
  ): { oscillator: OscillatorNode; gainNode: GainNode } => {
    const oscillator = context.createOscillator();
    const gainNode = context.createGain();
    
    oscillator.type = type;
    oscillator.frequency.value = frequency;
    gainNode.gain.value = gain;
    
    oscillator.connect(gainNode);
    
    return { oscillator, gainNode };
  }, []);

  const createTR808Drum = useCallback((
    context: AudioContext,
    instrument: string,
    params: any,
    section: string,
    accent: boolean
  ): { node: AudioNode; cleanup: () => void } => {
    const gainNode = context.createGain();
    const filterNode = context.createBiquadFilter();
    
    const level = (params[instrument]?.level || 100) / 100;
    const finalLevel = accent ? Math.min(level * 1.5, 1) : level;
    
    gainNode.gain.value = finalLevel * (sectionParams[section].level / 100);
    
    switch (instrument) {
      case 'BD':
        const osc1 = context.createOscillator();
        const osc2 = context.createOscillator();
        const gain1 = context.createGain();
        const gain2 = context.createGain();
        
        osc1.type = 'sine';
        osc2.type = 'sine';
        
        const baseFreq = 150;
        const tune = params.BD?.tune || 50;
        const frequency = baseFreq * Math.pow(2, (tune - 50) / 50);
        
        osc1.frequency.value = frequency;
        osc2.frequency.value = frequency * 0.5;
        
        gain1.gain.value = 0.7;
        gain2.gain.value = 0.3;
        
        osc1.connect(gain1);
        gain1.connect(filterNode);
        osc2.connect(gain2);
        gain2.connect(filterNode);
        
        filterNode.type = 'lowpass';
        filterNode.frequency.value = 200;
        filterNode.Q.value = 1;
        
        const decay = params.BD?.decay || 50;
        const decayTime = 0.1 + (decay / 100) * 0.4;
        
        gain1.gain.setValueAtTime(0.7, context.currentTime);
        gain1.gain.exponentialRampToValueAtTime(0.001, context.currentTime + decayTime);
        
        gain2.gain.setValueAtTime(0.3, context.currentTime);
        gain2.gain.exponentialRampToValueAtTime(0.001, context.currentTime + decayTime);
        
        osc1.start();
        osc2.start();
        
        return {
          node: filterNode,
          cleanup: () => {
            osc1.stop();
            osc2.stop();
          }
        };
      
      case 'SD':
        const noise = context.createBufferSource();
        const noiseBuffer = context.createBuffer(1, 0.1, context.sampleRate);
        const noiseData = noiseBuffer.getChannelData(0);
        for (let i = 0; i < noiseData.length; i++) {
          noiseData[i] = Math.random() * 2 - 1;
        }
        noise.buffer = noiseBuffer;
        
        const tone = params.SD?.tone || 50;
        filterNode.type = 'highpass';
        filterNode.frequency.value = 100 + (tone * 5);
        
        noise.connect(filterNode);
        
        const decayTime = 0.1 + (params.SD?.decay || 50) / 200;
        gainNode.gain.setValueAtTime(level, context.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, context.currentTime + decayTime);
        
        noise.start();
        
        return {
          node: filterNode,
          cleanup: () => noise.stop()
        };
      
      case 'LT':
      case 'MT':
      case 'HT':
        const osc = context.createOscillator();
        const baseFreq = instrument === 'LT' ? 200 : instrument === 'MT' ? 250 : 300;
        const tune = params[instrument]?.tune || 50;
        const frequency = baseFreq * Math.pow(2, (tune - 50) / 50);
        
        osc.type = 'sine';
        osc.frequency.value = frequency;
        
        filterNode.type = 'lowpass';
        filterNode.frequency.value = 500;
        
        const decayTime = 0.1 + (params[instrument]?.decay || 50) / 200;
        gainNode.gain.setValueAtTime(level, context.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, context.currentTime + decayTime);
        
        osc.connect(filterNode);
        osc.start();
        
        return {
          node: filterNode,
          cleanup: () => osc.stop()
        };
      
      case 'RS':
      case 'CP':
      case 'CH':
      case 'OH':
      case 'CC':
      case 'RC':
        const noise2 = context.createBufferSource();
        const noiseBuffer2 = context.createBuffer(1, 0.2, context.sampleRate);
        const noiseData2 = noiseBuffer2.getChannelData(0);
        for (let i = 0; i < noiseData2.length; i++) {
          noiseData2[i] = Math.random() * 2 - 1;
        }
        noise2.buffer = noiseBuffer2;
        
        filterNode.type = instrument === 'OH' || instrument === 'CC' ? 'lowpass' : 'bandpass';
        filterNode.frequency.value = instrument === 'RS' ? 8000 : 
                                 instrument === 'CP' ? 6000 : 
                                 instrument === 'CH' ? 5000 : 
                                 instrument === 'OH' ? 3000 : 
                                 instrument === 'CC' ? 2000 : 1000;
        
        noise2.connect(filterNode);
        
        const decayTime = 0.05 + (params[instrument]?.decay || 50) / 200;
        gainNode.gain.setValueAtTime(level, context.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, context.currentTime + decayTime);
        
        noise2.start();
        
        return {
          node: filterNode,
          cleanup: () => noise2.stop()
        };
      
      default:
        const defaultOsc = context.createOscillator();
        defaultOsc.type = 'sine';
        defaultOsc.frequency.value = 440;
        defaultOsc.connect(gainNode);
        defaultOsc.start();
        
        return {
          node: gainNode,
          cleanup: () => defaultOsc.stop()
        };
    }
    
    filterNode.connect(gainNode);
    return { node: gainNode, cleanup: () => {} };
  }, [tr808Params, tr909Params, sectionParams]);

  const createTB303Synth = useCallback((
    context: AudioContext,
    note: string,
    params: any,
    section: string,
    accent: boolean
  ): { node: AudioNode; cleanup: () => void } => {
    const gainNode = context.createGain();
    const filterNode = context.createBiquadFilter();
    
    const noteToFrequency = (noteStr: string): number => {
      const noteMap: Record<string, number> = {
        'C1': 32.70, 'C#1': 34.65, 'D1': 36.71, 'D#1': 38.89, 'E1': 41.20, 'F1': 43.65, 
        'F#1': 46.25, 'G1': 49.00, 'G#1': 51.91, 'A1': 55.00, 'A#1': 58.27, 'B1': 61.74,
        'C2': 65.41, 'C#2': 69.30, 'D2': 73.42, 'D#2': 77.78, 'E2': 82.41, 'F2': 87.31,
        'F#2': 92.50, 'G2': 98.00, 'G#2': 103.83, 'A2': 110.00, 'A#2': 116.54, 'B2': 123.47,
        'C3': 130.81, 'C#3': 138.59, 'D3': 146.83, 'D#3': 155.56, 'E3': 164.81, 'F3': 174.61,
        'F#3': 185.00, 'G3': 196.00, 'G#3': 207.65, 'A3': 220.00, 'A#3': 233.08, 'B3': 246.94,
        'C4': 261.63, 'C#4': 277.18, 'D4': 293.66, 'D#4': 311.13, 'E4': 329.63, 'F4': 349.23,
      };
      return noteMap[noteStr] || 440;
    };
    
    const frequency = noteToFrequency(note);
    const waveform = params.waveform || 'sawtooth';
    
    const osc = context.createOscillator();
    const envGain = context.createGain();
    const modGain = context.createGain();
    const modOsc = context.createOscillator();
    
    osc.type = waveform as OscillatorType;
    osc.frequency.value = frequency;
    
    filterNode.type = 'lowpass';
    filterNode.frequency.value = params.cutoff || 1000;
    filterNode.Q.value = params.resonance || 0;
    
    const envModAmount = params.envMod || 64;
    const cutoff = params.cutoff || 100;
    const maxCutoff = 10000;
    const minCutoff = 100;
    
    modOsc.type = 'sawtooth';
    modOsc.frequency.value = 5;
    modGain.gain.value = (cutoff / 100) * (envModAmount / 100) * (maxCutoff - minCutoff) + minCutoff;
    
    const decay = params.decay || 50;
    const decayTime = 0.1 + (decay / 100) * 0.5;
    
    const accentMultiplier = accent ? 1.5 : 1;
    const level = (params.accent || 64) / 100 * accentMultiplier;
    
    osc.connect(filterNode);
    filterNode.connect(envGain);
    envGain.connect(gainNode);
    
    modOsc.connect(modGain);
    modGain.connect(filterNode.frequency);
    
    envGain.gain.setValueAtTime(0, context.currentTime);
    envGain.gain.linearRampToValueAtTime(level * (sectionParams[section].level / 100), context.currentTime + 0.01);
    envGain.gain.exponentialRampToValueAtTime(0.001, context.currentTime + decayTime);
    
    filterNode.frequency.setValueAtTime(cutoff * 10, context.currentTime);
    filterNode.frequency.exponentialRampToValueAtTime(minCutoff, context.currentTime + decayTime);
    
    osc.start();
    modOsc.start();
    
    return {
      node: gainNode,
      cleanup: () => {
        osc.stop();
        modOsc.stop();
      }
    };
  }, [tb303_1Params, tb303_2Params, sectionParams]);

  const playStep = useCallback((stepIndex: number) => {
    if (!audioContext || !isPlaying) return;
    
    const stepTime = calculateStepDuration(tempo);
    const now = audioContext.currentTime;
    
    const sections: ('808' | '909' | '303_1' | '303_2')[] = ['808', '909', '303_1', '303_2'];
    
    sections.forEach((section) => {
      const patternIndex = currentPattern[section];
      const pattern = patterns[section][patternIndex];
      const step = pattern.steps[stepIndex];
      
      if (!step.instrument && !step.note) return;
      
      let node: AudioNode | null = null;
      let cleanup: () => void = () => {};
      
      if (section === '808' || section === '909') {
        const params = section === '808' ? tr808Params : tr909Params;
        const { node: drumNode, cleanup: drumCleanup } = createTR808Drum(
          audioContext,
          step.instrument || 'BD',
          params,
          section,
          step.accent || false
        );
        node = drumNode;
        cleanup = drumCleanup;
      } else if (section === '303_1' || section === '303_2') {
        const params = section === '303_1' ? tb303_1Params : tb303_2Params;
        if (step.note) {
          const { node: synthNode, cleanup: synthCleanup } = createTB303Synth(
            audioContext,
            step.note,
            params,
            section,
            step.accent || false
          );
          node = synthNode;
          cleanup = synthCleanup;
        }
      }
      
      if (node) {
        const finalGain = audioContext.createGain();
        node.connect(finalGain);
        
        const pan = sectionParams[section].pan / 50;
        const panNode = audioContext.createStereoPanner();
        panNode.pan.value = pan;
        
        finalGain.connect(panNode);
        panNode.connect(audioContext.destination);
        
        const voiceId = `${section}-${stepIndex}-${Date.now()}`;
        activeVoices.current.set(voiceId, {
          id: voiceId,
          instrument: step.instrument || step.note || '',
          section,
          note: step.note,
          accent: step.accent || false,
          flam: step.flam || false,
          startTime: now,
          duration: stepTime,
          stop: () => {
            cleanup();
            finalGain.gain.cancelScheduledValues(now);
            finalGain.gain.setValueAtTime(finalGain.gain.value, now);
            finalGain.gain.exponentialRampToValueAtTime(0.001, now + 0.01);
          }
        });
        
        finalGain.gain.setValueAtTime(1, now);
        finalGain.gain.exponentialRampToValueAtTime(0.001, now + stepTime * 0.95);
        
        setTimeout(() => {
          const voice = activeVoices.current.get(voiceId);
          if (voice) {
            voice.stop();
            activeVoices.current.delete(voiceId);
          }
        }, stepTime);
      }
    });
  }, [audioContext, isPlaying, tempo, currentPattern, patterns, tr808Params, tr909Params, tb303_1Params, tb303_2Params, sectionParams, calculateStepDuration, createTR808Drum, createTB303Synth]);

  const scheduleAudio = useCallback(() => {
    if (!audioContext || !isPlaying) return;
    
    const stepDuration = calculateStepDuration(tempo);
    const now = performance.now();
    const audioNow = audioContext.currentTime * 1000;
    
    const currentTime = now - stepStartTime.current;
    const currentStepCalc = Math.floor(currentTime / stepDuration) % (patternLength['808'] || 16);
    
    if (currentStepCalc !== lastStep.current) {
      playStep(currentStepCalc);
      lastStep.current = currentStepCalc;
    }
    
    animationFrame.current = requestAnimationFrame(scheduleAudio);
  }, [audioContext, isPlaying, tempo, patternLength, playStep, calculateStepDuration]);

  const startPlayback = useCallback(() => {
    if (!audioContext) {
      initAudioContext();
      return;
    }
    
    stepStartTime.current = performance.now();
    lastStep.current = 0;
    scheduleAudio();
  }, [audioContext, initAudioContext, scheduleAudio]);

  const stopPlayback = useCallback(() => {
    if (animationFrame.current) {
      cancelAnimationFrame(animationFrame.current);
      animationFrame.current = 0;
    }
    
    activeVoices.current.forEach((voice) => {
      voice.stop();
    });
    activeVoices.current.clear();
  }, []);

  useEffect(() => {
    if (isPlaying) {
      startPlayback();
    } else {
      stopPlayback();
    }
    
    return () => {
      stopPlayback();
    };
  }, [isPlaying, startPlayback, stopPlayback]);

  return {
    startPlayback,
    stopPlayback,
    activeVoices: activeVoices.current,
  };
};

const sections: ('808' | '909' | '303_1' | '303_2')[] = ['808', '909', '303_1', '303_2'];

export default useAudio;