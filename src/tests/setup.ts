import '@testing-library/jest-dom';
import { beforeEach, afterEach, vi } from 'vitest';

class MockAudioContext {
  currentTime = 0;
  sampleRate = 44100;
  destination: any = {};
  
  createOscillator() {
    return {
      type: 'sine',
      frequency: { value: 440 },
      start: vi.fn(),
      stop: vi.fn(),
      connect: vi.fn(),
      disconnect: vi.fn(),
    };
  }
  
  createGain() {
    return {
      gain: { value: 1 },
      connect: vi.fn(),
      disconnect: vi.fn(),
    };
  }
  
  createBiquadFilter() {
    return {
      type: 'lowpass',
      frequency: { value: 1000 },
      Q: { value: 1 },
      connect: vi.fn(),
      disconnect: vi.fn(),
    };
  }
  
  createDelay() {
    return {
      delayTime: { value: 0.1 },
      connect: vi.fn(),
      disconnect: vi.fn(),
    };
  }
  
  createWaveShaper() {
    return {
      curve: null,
      connect: vi.fn(),
      disconnect: vi.fn(),
    };
  }
  
  createDynamicsCompressor() {
    return {
      threshold: { value: -24 },
      ratio: { value: 4 },
      attack: { value: 0.003 },
      release: { value: 0.25 },
      knee: { value: 30 },
      connect: vi.fn(),
      disconnect: vi.fn(),
    };
  }
  
  createBufferSource() {
    return {
      buffer: null,
      connect: vi.fn(),
      disconnect: vi.fn(),
      start: vi.fn(),
      stop: vi.fn(),
    };
  }
  
  createBuffer() {
    return {
      getChannelData: () => new Float32Array(44100),
    };
  }
  
  createStereoPanner() {
    return {
      pan: { value: 0 },
      connect: vi.fn(),
      disconnect: vi.fn(),
    };
  }
}

beforeEach(() => {
  global.window = {
    AudioContext: MockAudioContext as any,
    webkitAudioContext: MockAudioContext as any,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    document: {
      visibilityState: 'visible',
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      createElement: vi.fn(() => ({
        click: vi.fn(),
        href: '',
        download: '',
        type: '',
        accept: '',
        onchange: null,
        files: [],
        dispatchEvent: vi.fn(),
      })),
      body: {
        appendChild: vi.fn(),
        removeChild: vi.fn(),
      },
    },
  } as any;
  
  global.document = {
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    createElement: vi.fn(),
    visibilityState: 'visible',
  } as any;
});

afterEach(() => {
  vi.restoreAllMocks();
});

export * from '@testing-library/react';