/**
 * React hook for file management operations in R3B1RTH
 * Provides save, load, and export functionality for projects
 */

import { useState, useCallback } from 'react';
import {
  R3B1RTHProject,
  ExportOptions,
  FileOperationResult,
  createNewProject,
  exportProjectToJSON,
  importProjectFromJSON,
  downloadProjectDefault,
  handleFileUpload,
  validateProject,
  generateFilename
} from '../utils/fileManager';

import { useSongStore } from '../stores/songStore';
import { usePatternStore } from '../stores/patternStore';
import { useAutomationStore } from '../stores/automationStore';
import { useAudioEffectsStore } from '../stores/audioEffectsStore';

export interface FileManagerState {
  isLoading: boolean;
  isSaving: boolean;
  error: string | null;
  lastSaved: string | null;
  unsavedChanges: boolean;
}

interface FileManagerActions {
  saveProject: (filename?: string, options?: ExportOptions) => Promise<FileOperationResult>;
  loadProject: (file: File) => Promise<FileOperationResult>;
  exportProject: (options?: ExportOptions) => Promise<FileOperationResult>;
  createNewProject: () => Promise<FileOperationResult>;
  resetState: () => void;
}

type FileManagerReturn = FileManagerState & FileManagerActions;

export function useFileManager(): FileManagerReturn {
  const [state, setState] = useState<FileManagerState>({
    isLoading: false,
    isSaving: false,
    error: null,
    lastSaved: null,
    unsavedChanges: false
  });

  const songStore = useSongStore();
  const patternStore = usePatternStore();
  const automationStore = useAutomationStore();
  const effectsStore = useAudioEffectsStore();

  // Track unsaved changes
  const markUnsaved = useCallback(() => {
    setState(prev => ({ ...prev, unsavedChanges: true }));
  }, []);

  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  // Build project from current stores
  const buildProjectFromStores = useCallback((): Partial<R3B1RTHProject> => {
    return {
      metadata: {
        name: songStore.currentSong?.name || 'Untitled',
        createdAt: songStore.currentSong?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        appVersion: '0.1.0'
      },
      bpm: songStore.bpm,
      song: songStore.currentSong,
      patterns: patternStore.patterns,
      automation: automationStore.automation,
      effectsRouting: {
        tb303: effectsStore.getInstrumentRouting('tb303'),
        tr808: effectsStore.getInstrumentRouting('tr808'),
        tr909: effectsStore.getInstrumentRouting('tr909'),
        master: effectsStore.getMasterRouting()
      },
      currentPatternIndex: patternStore.currentPatternIndex,
      currentSongId: songStore.currentSongId
    };
  }, [songStore, patternStore, automationStore, effectsStore]);

  // Save project
  const saveProject = useCallback(async (
    filename?: string,
    options?: ExportOptions
  ): Promise<FileOperationResult> => {
    try {
      setState(prev => ({ ...prev, isSaving: true, error: null }));
      
      const project = buildProjectFromStores();
      const result = exportProjectToJSON(project, options);
      
      if (result.success && result.data) {
        const finalFilename = filename || generateFilename(result.data);
        downloadProjectDefault(result.data, { ...options, prettyPrint: true });
        
        setState(prev => ({
          ...prev,
          isSaving: false,
          lastSaved: finalFilename,
          unsavedChanges: false
        }));
        
        return { ...result, message: 'Project saved successfully' };
      }
      
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      setState(prev => ({ ...prev, isSaving: false, error: errorMessage }));
      return {
        success: false,
        message: 'Failed to save project',
        error: error instanceof Error ? error : new Error(errorMessage)
      };
    }
  }, [buildProjectFromStores]);

  // Load project from file
  const loadProject = useCallback(async (
    file: File
  ): Promise<FileOperationResult> => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      
      const result = await handleFileUpload(file);
      
      if (result.success && result.data) {
        // Here you would typically dispatch the loaded data to your stores
        // For now, we'll just return the result
        // The actual store updates would be handled by the component
        
        setState(prev => ({
          ...prev,
          isLoading: false,
          unsavedChanges: false
        }));
      }
      
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      setState(prev => ({ ...prev, isLoading: false, error: errorMessage }));
      return {
        success: false,
        message: 'Failed to load project',
        error: error instanceof Error ? error : new Error(errorMessage)
      };
    }
  }, []);

  // Export project (without downloading)
  const exportProject = useCallback(async (
    options?: ExportOptions
  ): Promise<FileOperationResult> => {
    try {
      setState(prev => ({ ...prev, error: null }));
      const project = buildProjectFromStores();
      return exportProjectToJSON(project, options);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      setState(prev => ({ ...prev, error: errorMessage }));
      return {
        success: false,
        message: 'Failed to export project',
        error: error instanceof Error ? error : new Error(errorMessage)
      };
    }
  }, [buildProjectFromStores]);

  // Create new project
  const createNewProjectFn = useCallback(async (): Promise<FileOperationResult> => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      
      const newProject = createNewProject('New Project');
      
      // Here you would reset all stores to initial state
      // For now, just return the new project structure
      
      setState(prev => ({
        ...prev,
        isLoading: false,
        unsavedChanges: false
      }));
      
      return {
        success: true,
        message: 'New project created',
        data: newProject
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      setState(prev => ({ ...prev, isLoading: false, error: errorMessage }));
      return {
        success: false,
        message: 'Failed to create new project',
        error: error instanceof Error ? error : new Error(errorMessage)
      };
    }
  }, []);

  // Reset state
  const resetState = useCallback(() => {
    setState({
      isLoading: false,
      isSaving: false,
      error: null,
      lastSaved: null,
      unsavedChanges: false
    });
  }, []);

  return {
    // State
    isLoading: state.isLoading,
    isSaving: state.isSaving,
    error: state.error,
    lastSaved: state.lastSaved,
    unsavedChanges: state.unsavedChanges,
    
    // Actions
    saveProject,
    loadProject,
    exportProject,
    createNewProject: createNewProjectFn,
    resetState
  };
}

export default useFileManager;
