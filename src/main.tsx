import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { getAudioContext, resumeAudioContext } from './utils/audioEngine';

const initAudio = async () => {
  try { const audioContext = getAudioContext(); await resumeAudioContext(); } catch (error) { console.error('Error initializing audio context:', error); }
};

const handleUserInteraction = async () => {
  await initAudio();
  document.removeEventListener('click', handleUserInteraction);
  document.removeEventListener('keydown', handleUserInteraction);
};

document.addEventListener('click', handleUserInteraction);
document.addEventListener('keydown', handleUserInteraction);

const rootElement = document.getElementById('root');
if (rootElement) {
  ReactDOM.createRoot(rootElement).render(<React.StrictMode><App /></React.StrictMode>);
}
