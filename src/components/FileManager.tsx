/**
 * FileManager Component
 * UI for saving, loading, and managing project files
 */

import React, { useState, useRef, useCallback } from 'react';
import { useFileManager } from '../hooks/useFileManager';
import './FileManager.css';

interface FileManagerProps {
  onProjectLoaded?: (project: unknown) => void;
  onNewProject?: () => void;
}

const FileManager: React.FC<FileManagerProps> = ({ onProjectLoaded, onNewProject }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'save' | 'load' | 'new'>('save');
  const [filename, setFilename] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const fileManager = useFileManager();

  // Toggle modal
  const toggleOpen = useCallback(() => {
    setIsOpen(prev => !prev);
    if (!isOpen) {
      fileManager.resetState();
    }
  }, [isOpen, fileManager]);

  // Handle save
  const handleSave = useCallback(async () => {
    const result = await fileManager.saveProject(filename || undefined);
    if (result.success) {
      setFilename('');
      setIsOpen(false);
    }
  }, [fileManager, filename]);

  // Handle file selection
  const handleFileSelect = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const result = await fileManager.loadProject(file);
      if (result.success && result.data && onProjectLoaded) {
        onProjectLoaded(result.data);
        setIsOpen(false);
      }
    }
  }, [fileManager, onProjectLoaded]);

  // Handle drag and drop
  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    const file = e.dataTransfer.files?.[0];
    if (file) {
      const result = await fileManager.loadProject(file);
      if (result.success && result.data && onProjectLoaded) {
        onProjectLoaded(result.data);
        setIsOpen(false);
      }
    }
  }, [fileManager, onProjectLoaded]);

  // Handle new project
  const handleNewProject = useCallback(async () => {
    const result = await fileManager.createNewProject();
    if (result.success && onNewProject) {
      onNewProject();
      setIsOpen(false);
    }
  }, [fileManager, onNewProject]);

  // Trigger file input click
  const triggerFileInput = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  if (!isOpen) {
    return null;
  }

  return (
    <div className="file-manager-overlay" onClick={toggleOpen}>
      <div className="file-manager-modal" onClick={e => e.stopPropagation()}>
        <div className="file-manager-header">
          <h2>File Manager</h2>
          <button className="close-button" onClick={toggleOpen}>X</button>
        </div>

        <div className="file-manager-tabs">
          <button 
            className={"tab-button " + (activeTab === 'save' ? 'active' : '')}
            onClick={() => setActiveTab('save')}
          >
            Save
          </button>
          <button 
            className={"tab-button " + (activeTab === 'load' ? 'active' : '')}
            onClick={() => setActiveTab('load')}
          >
            Load
          </button>
          <button 
            className={"tab-button " + (activeTab === 'new' ? 'active' : '')}
            onClick={() => setActiveTab('new')}
          >
            New
          </button>
        </div>

        <div className="file-manager-content">
          {activeTab === 'save' && (
            <div className="save-tab">
              <div className="form-group">
                <label>Filename:</label>
                <input
                  type="text"
                  value={filename}
                  onChange={(e) => setFilename(e.target.value)}
                  placeholder="Enter filename (optional)"
                />
              </div>
              <div className="file-manager-actions">
                <button 
                  className="save-button primary"
                  onClick={handleSave}
                  disabled={fileManager.isSaving}
                >
                  {fileManager.isSaving ? 'Saving...' : 'Save Project'}
                </button>
              </div>
              {fileManager.lastSaved && (
                <div className="status-message">
                  Last saved: {fileManager.lastSaved}
                </div>
              )}
            </div>
          )}

          {activeTab === 'load' && (
            <div className="load-tab">
              <div 
                className={"drop-zone " + (isDragging ? 'dragging' : '')}
                onDragEnter={handleDragEnter}
                onDragLeave={handleDragLeave}
                onDragOver={e => { e.preventDefault(); e.stopPropagation(); }}
                onDrop={handleDrop}
              >
                <p>Drag & drop .json file here</p>
                <p>or</p>
                <button className="browse-button" onClick={triggerFileInput}>
                  Browse Files
                </button>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileSelect}
                  accept=".json,application/json"
                  style={{ display: 'none' }}
                />
              </div>
              {fileManager.isLoading && (
                <div className="status-message">Loading...</div>
              )}
            </div>
          )}

          {activeTab === 'new' && (
            <div className="new-tab">
              <div className="warning-message">
                <p>This will create a new project and discard all unsaved changes.</p>
                <p>Are you sure you want to continue?</p>
              </div>
              <div className="file-manager-actions">
                <button className="cancel-button" onClick={toggleOpen}>
                  Cancel
                </button>
                <button 
                  className="create-button primary"
                  onClick={handleNewProject}
                  disabled={fileManager.isLoading}
                >
                  {fileManager.isLoading ? 'Creating...' : 'Create New Project'}
                </button>
              </div>
            </div>
          )}
        </div>

        {fileManager.error && (
          <div className="error-message">
            {fileManager.error}
            <button className="dismiss-error" onClick={fileManager.resetState}>
              X
            </button>
          </div>
        )}

        {fileManager.unsavedChanges && activeTab !== 'new' && (
          <div className="unsaved-warning">
            You have unsaved changes
          </div>
        )}
      </div>
    </div>
  );
};

export default FileManager;
