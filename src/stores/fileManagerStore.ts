/**
 * File Manager Store - R3B-114, R3B-141
 * Zustand store for file management operations
 */

import { create } from 'zustand';
import type { PatternFile, PresetFile, ProjectFile, ExportOptions } from '../types/fileTypes';

interface FileManagerState {
  recentFiles: string[];
  currentFile: string | null;
  isSaving: boolean;
  isLoading: boolean;
  error: string | null;
}

interface FileManagerActions {
  saveProject: (project: any, options?: ExportOptions) => Promise<string>;
  loadProject: (file: File) => Promise<any>;
  exportProject: (project: any, options?: ExportOptions) => Promise<Blob>;
  exportPattern: (pattern: any, options?: ExportOptions) => Promise<Blob>;
  importPattern: (file: File) => Promise<any>;
  exportPreset: (preset: any, options?: ExportOptions) => Promise<Blob>;
  importPreset: (file: File) => Promise<any>;
  addRecentFile: (filePath: string) => void;
  clearRecentFiles: () => void;
  setCurrentFile: (filePath: string | null) => void;
}

type FileManagerStore = FileManagerState & FileManagerActions;

const RECENT_FILES_KEY = 'r3b1rth-recent-files';
const MAX_RECENT_FILES = 10;

export const useFileManagerStore = create<FileManagerStore>((set, get) => ({
  recentFiles: JSON.parse(localStorage.getItem(RECENT_FILES_KEY) || '[]'),
  currentFile: null,
  isSaving: false,
  isLoading: false,
  error: null,

  saveProject: async (project: any, options?: ExportOptions) => {
    set({ isSaving: true, error: null });
    try {
      const projectFile: ProjectFile = {
        version: '1.0.0',
        project,
        metadata: {
          createdAt: new Date().toISOString(),
          modifiedAt: new Date().toISOString(),
          createdBy: 'R3B1RTH',
          rebirthVersion: 'RB-338 v2.01',
        },
      };
      
      const format = options?.format || 'r3b';
      const content = JSON.stringify(projectFile, null, 2);
      const blob = new Blob([content], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      get().addRecentFile(project.name + '.' + format);
      set({ currentFile: project.name + '.' + format });
      
      return url;
    } catch (err) {
      set({ error: 'Failed to save project' });
      throw err;
    } finally {
      set({ isSaving: false });
    }
  },

  loadProject: async (file: File) => {
    set({ isLoading: true, error: null });
    try {
      const content = await file.text();
      const projectFile: ProjectFile = JSON.parse(content);
      get().addRecentFile(file.name);
      set({ currentFile: file.name });
      return projectFile.project;
    } catch (err) {
      set({ error: 'Failed to load project' });
      throw err;
    } finally {
      set({ isLoading: false });
    }
  },

  exportProject: async (project: any, options?: ExportOptions) => {
    set({ isSaving: true, error: null });
    try {
      const projectFile: ProjectFile = {
        version: '1.0.0',
        project,
        metadata: {
          createdAt: new Date().toISOString(),
          modifiedAt: new Date().toISOString(),
          createdBy: 'R3B1RTH',
          rebirthVersion: 'RB-338 v2.01',
        },
      };
      
      const format = options?.format || 'json';
      const content = JSON.stringify(projectFile, null, 2);
      return new Blob([content], { type: 'application/json' });
    } catch (err) {
      set({ error: 'Failed to export project' });
      throw err;
    } finally {
      set({ isSaving: false });
    }
  },

  exportPattern: async (pattern: any, options?: ExportOptions) => {
    set({ isSaving: true, error: null });
    try {
      const patternFile: PatternFile = {
        version: '1.0.0',
        pattern,
        metadata: {
          createdAt: new Date().toISOString(),
          createdBy: 'R3B1RTH',
          rebirthVersion: 'RB-338 v2.01',
        },
      };
      
      const format = options?.format || 'r3b';
      const content = JSON.stringify(patternFile, null, 2);
      return new Blob([content], { type: 'application/json' });
    } catch (err) {
      set({ error: 'Failed to export pattern' });
      throw err;
    } finally {
      set({ isSaving: false });
    }
  },

  importPattern: async (file: File) => {
    set({ isLoading: true, error: null });
    try {
      const content = await file.text();
      const patternFile: PatternFile = JSON.parse(content);
      return patternFile.pattern;
    } catch (err) {
      set({ error: 'Failed to import pattern' });
      throw err;
    } finally {
      set({ isLoading: false });
    }
  },

  exportPreset: async (preset: any, options?: ExportOptions) => {
    set({ isSaving: true, error: null });
    try {
      const presetFile: PresetFile = {
        version: '1.0.0',
        preset,
        metadata: {
          createdAt: new Date().toISOString(),
          createdBy: 'R3B1RTH',
        },
      };
      
      const format = options?.format || 'r3b';
      const content = JSON.stringify(presetFile, null, 2);
      return new Blob([content], { type: 'application/json' });
    } catch (err) {
      set({ error: 'Failed to export preset' });
      throw err;
    } finally {
      set({ isSaving: false });
    }
  },

  importPreset: async (file: File) => {
    set({ isLoading: true, error: null });
    try {
      const content = await file.text();
      const presetFile: PresetFile = JSON.parse(content);
      return presetFile.preset;
    } catch (err) {
      set({ error: 'Failed to import preset' });
      throw err;
    } finally {
      set({ isLoading: false });
    }
  },

  addRecentFile: (filePath: string) => {
    const recentFiles = get().recentFiles;
    const updatedFiles = [filePath, ...recentFiles.filter(f => f !== filePath)].slice(0, MAX_RECENT_FILES);
    set({ recentFiles: updatedFiles });
    localStorage.setItem(RECENT_FILES_KEY, JSON.stringify(updatedFiles));
  },

  clearRecentFiles: () => {
    set({ recentFiles: [] });
    localStorage.removeItem(RECENT_FILES_KEY);
  },

  setCurrentFile: (filePath: string | null) => {
    set({ currentFile: filePath });
  },
}));