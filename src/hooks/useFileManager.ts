/**
 * File Manager Hook - Batch 8
 * R3B-95, R3B-96: File Save/Open
 * 
 * Custom hook for file management operations
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
    importProject,
    getRecentProjects,
    clearRecentProjects,
    getCurrentProject,
  };
};

export default useFileManager;