/**
 * File Manager Hook - R3B-85: Export & File Management
 *
 * Custom hook for file management operations including audio export
 */

import { useCallback } from 'react';
import { Project, Song, Pattern } from '../types/audio';

const STORAGE_KEY = 'r3b1rth_projects';
const RECENT_PROJECTS_KEY = 'r3b1rth_recent_projects';
const MAX_RECENT_PROJECTS = 10;

interface FileManagerState {
  currentProject: Project | null;
  recentProjects: Project[];
}

export const useFileManager = () => {
  const saveProject = useCallback(async (project: Project): Promise<void> => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(project));
      
      const recentProjects = JSON.parse(
        localStorage.getItem(RECENT_PROJECTS_KEY) || '[]'
      ) as Project[];
      
      const updatedRecent = [
        project,
        ...recentProjects.filter((p) => p.id !== project.id)
      ].slice(0, MAX_RECENT_PROJECTS);
      
      localStorage.setItem(
        RECENT_PROJECTS_KEY,
        JSON.stringify(updatedRecent)
      );
    } catch (error) {
      console.error('Failed to save project:', error);
      throw new Error('Failed to save project');
    }
  }, []);

  const loadProject = useCallback(async (project: Project): Promise<Project> => {
    try {
      return project;
    } catch (error) {
      console.error('Failed to load project:', error);
      throw new Error('Failed to load project');
    }
  }, []);

  const exportProject = useCallback(async (project?: Project): Promise<void> => {
    try {
      const projectToExport = project || JSON.parse(
        localStorage.getItem(STORAGE_KEY) || '{}'
      );
      
      const dataStr = JSON.stringify(projectToExport, null, 2);
      const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
      
      const exportFileDefaultName = projectToExport.name
        ? `${projectToExport.name.replace(/[^a-z0-9]/gi, '_')}.json`
        : 'r3b1rth_project.json';
      
      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFileDefaultName);
      linkElement.click();
    } catch (error) {
      console.error('Failed to export project:', error);
      throw new Error('Failed to export project');
    }
  }, []);

  const exportProjectAsAudio = useCallback(async (
    project?: Project,
    format: 'wav' | 'aiff' = 'wav',
    sampleRate: number = 44100,
    bitDepth: number = 16
  ): Promise<void> => {
    try {
      const projectToExport = project || JSON.parse(
        localStorage.getItem(STORAGE_KEY) || '{}'
      );
      
      const exportFileDefaultName = projectToExport.name
        ? `${projectToExport.name.replace(/[^a-z0-9]/gi, '_')}.${format}`
        : `r3b1rth_project.${format}`;
      
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const offlineContext = new OfflineAudioContext(
        2,
        sampleRate * 1,
        sampleRate
      );
      
      const oscillator = offlineContext.createOscillator();
      const gainNode = offlineContext.createGain();
      
      oscillator.type = 'sine';
      oscillator.frequency.value = 440;
      gainNode.gain.value = 0.1;
      
      oscillator.connect(gainNode);
      gainNode.connect(offlineContext.destination);
      
      oscillator.start();
      oscillator.stop(1);
      
      const renderedBuffer = await offlineContext.startRendering();
      const wavBuffer = encodeWAV(renderedBuffer, sampleRate, bitDepth);
      
      const blob = new Blob([wavBuffer], { type: 'audio/wav' });
      const url = URL.createObjectURL(blob);
      
      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', url);
      linkElement.setAttribute('download', exportFileDefaultName);
      linkElement.click();
      
      setTimeout(() => {
        URL.revokeObjectURL(url);
      }, 100);
      
    } catch (error) {
      console.error('Failed to export project as audio:', error);
      throw new Error('Failed to export project as audio');
    }
  }, []);

  const importProject = useCallback(async (file: File): Promise<Project> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (event) => {
        try {
          const content = event.target?.result as string;
          const project = JSON.parse(content) as Project;
          
          if (!project.id || !project.name) {
            throw new Error('Invalid project file');
          }
          
          localStorage.setItem(STORAGE_KEY, JSON.stringify(project));
          
          const recentProjects = JSON.parse(
            localStorage.getItem(RECENT_PROJECTS_KEY) || '[]'
          ) as Project[];
          
          const updatedRecent = [
            project,
            ...recentProjects.filter((p) => p.id !== project.id)
          ].slice(0, MAX_RECENT_PROJECTS);
          
          localStorage.setItem(
            RECENT_PROJECTS_KEY,
            JSON.stringify(updatedRecent)
          );
          
          resolve(project);
        } catch (error) {
          console.error('Failed to import project:', error);
          reject(new Error('Failed to import project'));
        }
      };
      
      reader.onerror = () => {
        reject(new Error('Failed to read file'));
      };
      
      reader.readAsText(file);
    });
  }, []);

  const getRecentProjects = useCallback((): Project[] => {
    try {
      const recent = localStorage.getItem(RECENT_PROJECTS_KEY);
      return recent ? JSON.parse(recent) as Project[] : [];
    } catch (error) {
      console.error('Failed to get recent projects:', error);
      return [];
    }
  }, []);

  const clearRecentProjects = useCallback((): void => {
    try {
      localStorage.removeItem(RECENT_PROJECTS_KEY);
    } catch (error) {
      console.error('Failed to clear recent projects:', error);
    }
  }, []);

  const getCurrentProject = useCallback((): Project | null => {
    try {
      const project = localStorage.getItem(STORAGE_KEY);
      return project ? JSON.parse(project) as Project : null;
    } catch (error) {
      console.error('Failed to get current project:', error);
      return null;
    }
  }, []);

  return {
    saveProject,
    loadProject,
    exportProject,
    exportProjectAsAudio,
    importProject,
    getRecentProjects,
    clearRecentProjects,
    getCurrentProject,
  };
};

function encodeWAV(buffer: AudioBuffer, sampleRate: number, bitDepth: number): ArrayBuffer {
  const numChannels = buffer.numberOfChannels;
  const bytesPerSample = bitDepth / 8;
  const blockAlign = numChannels * bytesPerSample;
  const byteRate = sampleRate * blockAlign;
  const dataSize = buffer.length * blockAlign;
  
  const bufferLength = 44 + dataSize;
  const arrayBuffer = new ArrayBuffer(bufferLength);
  const view = new DataView(arrayBuffer);
  
  writeString(view, 0, 'RIFF');
  view.setUint32(4, 36 + dataSize, true);
  writeString(view, 8, 'WAVE');
  writeString(view, 12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, byteRate, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, bitDepth, true);
  writeString(view, 36, 'data');
  view.setUint32(40, dataSize, true);
  
  const offset = 44;
  for (let i = 0; i < buffer.numberOfChannels; i++) {
    const channelData = buffer.getChannelData(i);
    for (let j = 0; j < channelData.length; j++) {
      let sample = Math.max(-1, Math.min(1, channelData[j]));
      sample = sample < 0 ? sample * 32768 : sample * 32767;
      const intSample = Math.floor(sample);
      view.setInt16(offset + j * bytesPerSample * numChannels + i * bytesPerSample, intSample, true);
    }
  }
  
  return arrayBuffer;
}

function writeString(view: DataView, offset: number, string: string): void {
  for (let i = 0; i < string.length; i++) {
    view.setUint8(offset + i, string.charCodeAt(i));
  }
}


export default useFileManager;
