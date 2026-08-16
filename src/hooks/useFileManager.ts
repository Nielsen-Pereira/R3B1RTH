/**
 * useFileManager Hook - R3B-114, R3B-141
 * Enhanced hook for file management operations
 */

import { useCallback } from 'react';
import { useFileManagerStore } from '../stores/fileManagerStore';
import type { ExportOptions } from '../types/fileTypes';

export interface UseFileManagerReturn {
  recentFiles: string[];
  currentFile: string | null;
  isSaving: boolean;
  isLoading: boolean;
  error: string | null;
  
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
  
  getSupportedFormats: () => string[];
  getDefaultExportOptions: (format: string) => ExportOptions;
}

export const useFileManager = (): UseFileManagerReturn => {
  const store = useFileManagerStore();
  
  const getSupportedFormats = useCallback(() => {
    return ['r3b', 'json', 'wav', 'aiff'];
  }, []);
  
  const getDefaultExportOptions = useCallback((format: string): ExportOptions => {
    switch (format) {
      case 'wav':
      case 'aiff':
        return { format: format as 'wav' | 'aiff', sampleRate: 44100, bitDepth: 16 };
      case 'json':
      case 'r3b':
      default:
        return { format: format as 'r3b' | 'json', includeMetadata: true };
    }
  }, []);
  
  return {
    recentFiles: store.recentFiles,
    currentFile: store.currentFile,
    isSaving: store.isSaving,
    isLoading: store.isLoading,
    error: store.error,
    
    saveProject: store.saveProject,
    loadProject: store.loadProject,
    exportProject: store.exportProject,
    
    exportPattern: store.exportPattern,
    importPattern: store.importPattern,
    
    exportPreset: store.exportPreset,
    importPreset: store.importPreset,
    
    addRecentFile: store.addRecentFile,
    clearRecentFiles: store.clearRecentFiles,
    setCurrentFile: store.setCurrentFile,
    
    getSupportedFormats,
    getDefaultExportOptions,
  };
};

export default useFileManager;