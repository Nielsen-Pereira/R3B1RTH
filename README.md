# R3B1RTH - ReBirth RB-338 Web Implementation

A responsive web application that recreates the classic Propellerhead ReBirth RB-338 software synthesizer.

## Features
- 2 TB-303 Synthesizers with authentic filter controls
- TR-808 and TR-909 Drum Machines with 11 instruments each
- 4 Effects: Distortion, PCF, Compressor, Delay
- Complete signal chain: synths/drums -> distortion -> PCF -> compressor -> delay -> master
- Transport Controls (play, stop, BPM adjustment)
- Pattern Sequencer with 16-step grids
- Clipboard Operations for pattern copy/paste
- Tap Recording with octave handling
- Swing/Shuffle timing implementation
- Export Functionality (WAV, AIFF, MP3 support)
- Responsive Design for desktop and mobile

## Tech Stack
- React 18 - UI framework
- TypeScript - Type safety (strict mode, no unsafe casting)
- Web Audio API - Audio synthesis and effects
- Zustand - State management
- Vite - Build tool
- Vitest - Testing

## Project Structure
R3B1RTH/
- src/
  - components/ (sections, effects, Transport)
  - store/ (6 Zustand stores)
  - utils/ (audioEngine, filters)
  - types/ (audio.ts)
  - App.tsx, main.tsx, index.css
- public/
- package.json, vite.config.ts, tsconfig.json

## Getting Started
npm install
npm run dev

## Jira
https://nielsenpereirapro.atlassian.net/jira/software/projects/R3B

## GitHub
https://github.com/Nielsen-Pereira/R3B1RTH