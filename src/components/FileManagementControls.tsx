/**
 * File Management Controls - R3B-114, R3B-141
 * UI controls for file management operations
 */

import React, { useCallback, useState, useRef } from 'react';
import { useFileManager } from '../hooks/useFileManager';
import type { ExportOptions } from '../types/fileTypes';

interface FileManagementControlsProps {
  project?: any;
  currentPattern?: any;
  currentPreset?: any;
  onProjectSaved?: (url: string) => void;
  onProjectLoaded?: (project: any) => void;
  onPatternExported?: (blob: Blob) => void;
  onPatternImported?: (pattern: any) => void;
  onPresetExported?: (blob: Blob) => void;
  onPresetImported?: (preset: any) => void;
}

export const FileManagementControls: React.FC<FileManagementControlsProps> = ({
  project,
  currentPattern,
  currentPreset,
  onProjectSaved,
  onProjectLoaded,
  onPatternExported,
  onPatternImported,
  onPresetExported,
  onPresetImported,
}) => {
  const {
    saveProject,
    loadProject,
    exportProject,
    exportPattern,
    importPattern,
    exportPreset,
    importPreset,
    isSaving,
    isLoading,
    error,
    getSupportedFormats,
    getDefaultExportOptions,
  } = useFileManager();
  
  const [showProjectMenu, setShowProjectMenu] = useState(false);
  const [showPatternMenu, setShowPatternMenu] = useState(false);
  const [showPresetMenu, setShowPresetMenu] = useState(false);
  const [exportFormat, setExportFormat] = useState<string>('json');
  const [isExporting, setIsExporting] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const patternInputRef = useRef<HTMLInputElement>(null);
  const presetInputRef = useRef<HTMLInputElement>(null);

  const handleSaveProject = useCallback(async () => {
    if (!project) return;
    setIsExporting(true);
    try {
      const url = await saveProject(project, { format: exportFormat as any });
      onProjectSaved?.(url);
    } catch (err) {
      console.error('Failed to save project:', err);
    } finally {
      setIsExporting(false);
    }
  }, [project, exportFormat, saveProject, onProjectSaved]);

  const handleLoadProject = useCallback(async (file: File) => {
    try {
      const loadedProject = await loadProject(file);
      onProjectLoaded?.(loadedProject);
    } catch (err) {
      console.error('Failed to load project:', err);
    }
  }, [loadProject, onProjectLoaded]);

  const handleExportProject = useCallback(async () => {
    if (!project) return;
    setIsExporting(true);
    try {
      const blob = await exportProject(project, { format: exportFormat as any });
      onProjectSaved?.(URL.createObjectURL(blob));
    } catch (err) {
      console.error('Failed to export project:', err);
    } finally {
      setIsExporting(false);
    }
  }, [project, exportFormat, exportProject, onProjectSaved]);

  const handleExportPattern = useCallback(async () => {
    if (!currentPattern) return;
    setIsExporting(true);
    try {
      const blob = await exportPattern(currentPattern, { format: exportFormat as any });
      onPatternExported?.(blob);
    } catch (err) {
      console.error('Failed to export pattern:', err);
    } finally {
      setIsExporting(false);
    }
  }, [currentPattern, exportFormat, exportPattern, onPatternExported]);

  const handleImportPattern = useCallback(async (file: File) => {
    try {
      const pattern = await importPattern(file);
      onPatternImported?.(pattern);
    } catch (err) {
      console.error('Failed to import pattern:', err);
    }
  }, [importPattern, onPatternImported]);

  const handleExportPreset = useCallback(async () => {
    if (!currentPreset) return;
    setIsExporting(true);
    try {
      const blob = await exportPreset(currentPreset, { format: exportFormat as any });
      onPresetExported?.(blob);
    } catch (err) {
      console.error('Failed to export preset:', err);
    } finally {
      setIsExporting(false);
    }
  }, [currentPreset, exportFormat, exportPreset, onPresetExported]);

  const handleImportPreset = useCallback(async (file: File) => {
    try {
      const preset = await importPreset(file);
      onPresetImported?.(preset);
    } catch (err) {
      console.error('Failed to import preset:', err);
    }
  }, [importPreset, onPresetImported]);

  const triggerFileInput = useCallback((ref: React.RefObject<HTMLInputElement>) => {
    ref.current?.click();
  }, []);

  const handleFileChange = useCallback((
    e: React.ChangeEvent<HTMLInputElement>,
    handler: (file: File) => Promise<void>
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      handler(file);
    }
    e.target.value = '';
  }, []);

  const supportedFormats = getSupportedFormats();

  return (
    <div className="file-management-controls">
      {error && (
        <div className="file-error">{error}</div>
      )}

      <div className="file-control-group">
        <button
          className="file-action-button"
          onClick={() => setShowProjectMenu(!showProjectMenu)}
          disabled={isSaving || isLoading || isExporting}
        >
          Project
        </button>
        
        {showProjectMenu && (
          <div className="file-menu">
            <button
              className="menu-item"
              onClick={handleSaveProject}
              disabled={!project || isSaving || isExporting}
            >
              Save Project
            </button>
            <button
              className="menu-item"
              onClick={() => triggerFileInput(fileInputRef)}
              disabled={isLoading}
            >
              Load Project
            </button>
            <input
              type="file"
              ref={fileInputRef}
              style={{ display: 'none' }}
              accept=".json,.r3b"
              onChange={(e) => handleFileChange(e, handleLoadProject)}
            />
            <button
              className="menu-item"
              onClick={handleExportProject}
              disabled={!project || isExporting}
            >
              Export Project
            </button>
          </div>
        )}
      </div>

      <div className="file-control-group">
        <button
          className="file-action-button"
          onClick={() => setShowPatternMenu(!showPatternMenu)}
          disabled={isSaving || isLoading || isExporting}
        >
          Pattern
        </button>
        
        {showPatternMenu && (
          <div className="file-menu">
            <button
              className="menu-item"
              onClick={handleExportPattern}
              disabled={!currentPattern || isExporting}
            >
              Export Pattern
            </button>
            <button
              className="menu-item"
              onClick={() => triggerFileInput(patternInputRef)}
              disabled={isLoading}
            >
              Import Pattern
            </button>
            <input
              type="file"
              ref={patternInputRef}
              style={{ display: 'none' }}
              accept=".json,.r3b"
              onChange={(e) => handleFileChange(e, handleImportPattern)}
            />
          </div>
        )}
      </div>

      <div className="file-control-group">
        <button
          className="file-action-button"
          onClick={() => setShowPresetMenu(!showPresetMenu)}
          disabled={isSaving || isLoading || isExporting}
        >
          Preset
        </button>
        
        {showPresetMenu && (
          <div className="file-menu">
            <button
              className="menu-item"
              onClick={handleExportPreset}
              disabled={!currentPreset || isExporting}
            >
              Export Preset
            </button>
            <button
              className="menu-item"
              onClick={() => triggerFileInput(presetInputRef)}
              disabled={isLoading}
            >
              Import Preset
            </button>
            <input
              type="file"
              ref={presetInputRef}
              style={{ display: 'none' }}
              accept=".json,.r3b"
              onChange={(e) => handleFileChange(e, handleImportPreset)}
            />
          </div>
        )}
      </div>

      <div className="file-control-group">
        <select
          value={exportFormat}
          onChange={(e) => setExportFormat(e.target.value)}
          disabled={isSaving || isLoading || isExporting}
          className="format-select"
        >
          {supportedFormats.map((format) => (
            <option key={format} value={format}>
              {format.toUpperCase()}
            </option>
          ))}
        </select>
      </div>

      {(isSaving || isLoading || isExporting) && (
        <div className="file-loading">Processing...</div>
      )}
    </div>
  );
};

export default FileManagementControls;