import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useFileManager } from '../useFileManager';
import { Project } from '../../types/audio';

describe('useFileManager Hook', () => {
  const mockProject: Project = {
    id: 'test-project',
    name: 'Test Project',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    version: '1.0',
    song: {
      id: 'test-song',
      name: 'Test Song',
      tempo: 120,
      patterns: [],
    },
  };

  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  describe('saveProject', () => {
    it('should save project to localStorage', async () => {
      const { saveProject } = useFileManager();
      
      await saveProject(mockProject);
      
      const saved = localStorage.getItem('r3b1rth_projects');
      expect(saved).toBeDefined();
      const parsed = JSON.parse(saved || '{}') as Project;
      expect(parsed.id).toBe(mockProject.id);
      expect(parsed.name).toBe(mockProject.name);
    });

    it('should update recent projects', async () => {
      const { saveProject } = useFileManager();
      
      await saveProject(mockProject);
      
      const recent = localStorage.getItem('r3b1rth_recent_projects');
      expect(recent).toBeDefined();
      const parsed = JSON.parse(recent || '[]') as Project[];
      expect(parsed.length).toBe(1);
      expect(parsed[0].id).toBe(mockProject.id);
    });
  });

  describe('loadProject', () => {
    it('should return the project', async () => {
      const { loadProject } = useFileManager();
      
      const result = await loadProject(mockProject);
      expect(result).toEqual(mockProject);
    });
  });

  describe('getRecentProjects', () => {
    it('should return empty array when no recent projects', () => {
      const { getRecentProjects } = useFileManager();
      
      const result = getRecentProjects();
      expect(result).toEqual([]);
    });

    it('should return recent projects', async () => {
      const { saveProject, getRecentProjects } = useFileManager();
      
      await saveProject(mockProject);
      const result = getRecentProjects();
      expect(result.length).toBe(1);
      expect(result[0].id).toBe(mockProject.id);
    });
  });

  describe('clearRecentProjects', () => {
    it('should clear recent projects', async () => {
      const { saveProject, clearRecentProjects, getRecentProjects } = useFileManager();
      
      await saveProject(mockProject);
      expect(getRecentProjects().length).toBe(1);
      
      clearRecentProjects();
      expect(getRecentProjects().length).toBe(0);
    });
  });

  describe('getCurrentProject', () => {
    it('should return null when no current project', () => {
      const { getCurrentProject } = useFileManager();
      
      const result = getCurrentProject();
      expect(result).toBeNull();
    });

    it('should return current project', async () => {
      const { saveProject, getCurrentProject } = useFileManager();
      
      await saveProject(mockProject);
      const result = getCurrentProject();
      expect(result).toBeDefined();
      expect(result?.id).toBe(mockProject.id);
    });
  });
});