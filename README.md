# R3B1RTH

A responsive web application recreation of Propellerhead's ReBirth RB-338 with 1:1 feature parity.

## Overview

R3B1RTH is a faithful web-based implementation of the classic ReBirth RB-338 software drum machine and synthesizer. It reproduces the TR-808, TR-909 drum machines and dual TB-303 synthesizers in a modern, responsive web interface.

## Features

### Implemented
- TR-808 drum machine with 11 instruments
- TR-909 drum machine with 11 instruments + Flam control
- Dual TB-303 synthesizers (sawtooth/square waveforms)
- Pattern-based sequencer (32 patterns per section)
- Song mode with pattern chaining
- Step programming with tap recording
- Pattern copy/paste/clear
- Shuffle (0-100%)
- Tempo range: 40-300 BPM

### Effects
- PCF (Pattern Controlled Filter) with 32 preset patterns
- Delay (step-based with feedback)
- Distortion (insert effect)
- Compressor (insert and master)

### Mixer
- Volume and pan per section
- Mute and solo per section
- Delay send
- Effect routing

## Tech Stack

- **Frontend**: React 18 + TypeScript
- **State Management**: Zustand
- **Audio**: Web Audio API
- **Build**: Vite
- **Testing**: Vitest

## Project Structure

```
R3B1RTH/
├── src/
│   ├── components/
│   │   ├── effects/
│   │   ├── mixer/
│   │   ├── sections/
│   │   ├── sequencer/
│   │   ├── transport/
│   │   └── ui/
│   ├── hooks/
│   ├── store/
│   ├── styles/
│   ├── tests/
│   ├── types/
│   └── utils/
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

## Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

Opens the app at `http://localhost:3000`

### Build

```bash
npm run build
```

### Testing

```bash
npm test
```

## License

MIT License