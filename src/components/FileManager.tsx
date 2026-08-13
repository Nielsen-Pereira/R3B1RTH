import React, { useState, useCallback } from 'react';
import { useFileManager } from '../hooks/useFileManager';
import { Project } from '../types/audio';
import './FileManager.css';

interface FileManagerProps {
  onProjectLoaded: (project: Project) => void;
  onNewProject: () => void;
}

export const FileManager: React.FC<FileManagerProps> = ({
  onProjectLoaded,
  onNewProject,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const {
    saveProject,
    loadProject,
    exportProject,
    exportProjectAsAudio,
    importProject,
    getRecentProjects,
    clearRecentProjects,
  } = useFileManager();

  const [recentProjects, setRecentProjects] = useState<Project[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [exportFormat, setExportFormat] = useState<'wav' | 'aiff'>('wav');

  const handleOpen = useCallback(() => {
    setIsOpen(true);
    const projects = getRecentProjects();
    setRecentProjects(projects);
  }, [getRecentProjects]);

  const handleClose = useCallback(() => {
    setIsOpen(false);
    setError(null);
  }, []);

  const handleNew = useCallback(() => {
    onNewProject();
    handleClose();
  }, [onNewProject, handleClose]);

  const handleSave = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      await saveProject();
    } catch (err) {
      setError('Failed to save project');
    } finally {
      setIsLoading(false);
    }
  }, [saveProject]);

  const handleLoad = useCallback(async (project: Project) => {
    setIsLoading(true);
    setError(null);
    try {
      await loadProject(project);
      onProjectLoaded(project);
      handleClose();
    } catch (err) {
      setError('Failed to load project');
    } finally {
      setIsLoading(false);
    }
  }, [loadProject, onProjectLoaded, handleClose]);

  const handleExport = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      await exportProject();
    } catch (err) {
      setError('Failed to export project');
    } finally {
      setIsLoading(false);
    }
  }, [exportProject]);

  const handleExportAsAudio = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      await exportProjectAsAudio(undefined, exportFormat);
    } catch (err) {
      setError('Failed to export project as audio');
    } finally {
      setIsLoading(false);
    }
  }, [exportProjectAsAudio, exportFormat]);

  const handleImport = useCallback(async (file: File) => {
    setIsLoading(true);
    setError(null);
    try {
      const project = await importProject(file);
      onProjectLoaded(project);
      handleClose();
    } catch (err) {
      setError('Failed to import project');
    } finally {
      setIsLoading(false);
    }
  }, [importProject, onProjectLoaded, handleClose]);

  if (!isOpen) {
    return null;
  }

  return (
    <div className="file-manager-overlay" onClick={handleClose}>
      <div className="file-manager" onClick={(e) => e.stopPropagation()}>
        <div className="file-manager-header">
          <h2>File Manager</h2>
          <button className="close-button" onClick={handleClose}>
            &times;
          </button>
        </div>

        <div className="file-manager-content">
          <div className="file-actions">
            <button
              className="file-action-button new"
              onClick={handleNew}
              disabled={isLoading}
            >
              New Project
            </button>

            <button
              className="file-action-button save"
              onClick={handleSave}
              disabled={isLoading}
            >
              {isLoading ? 'Saving...' : 'Save Project'}
            </button>

            <button
              className="file-action-button export"
              onClick={handleExport}
              disabled={isLoading}
            >
              Export Project (JSON)
            </button>

            <div className="audio-export-group">
              <select
                value={exportFormat}
                onChange={(e) => setExportFormat(e.target.value as 'wav' | 'aiff')}
                disabled={isLoading}
                className="format-select"
              >
                <option value="wav">WAV</option>
                <option value="aiff">AIFF</option>
              </select>
              <button
                className="file-action-button export-audio"
                onClick={handleExportAsAudio}
                disabled={isLoading}
              >
                Export as Audio
              </button>
            </div>

            <label className="file-action-button import">
              Import Project
              <input
                type="file"
                accept=".json"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    handleImport(e.target.files[0]);
                  }
                }}
                style={{ display: 'none' }}
              />
            </label>
          </div>

          {error && (
            <div className="file-error">{error}</div>
          )}

          <div className="recent-projects">
            <h3>Recent Projects</h3>
            {recentProjects.length === 0 ? (
              <p className="no-projects">No recent projects</p>
            ) : (
              <ul className="project-list">
                {recentProjects.map((project, index) => (
                  <li
                    key={index}
                    className="project-item"
                    onClick={() => handleLoad(project)}
                  >
                    <span className="project-name">{project.name}</span>
                    <span className="project-date">
                      {new Date(project.createdAt || '').toLocaleDateString()}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FileManager;
