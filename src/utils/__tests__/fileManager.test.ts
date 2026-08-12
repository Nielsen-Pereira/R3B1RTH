/**
 * Tests for fileManager utility functions
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  createNewProject,
  exportProjectToJSON,
  importProjectFromJSON,
  validateProject,
  generateFilename,
  FILE_FORMAT_VERSION
} from '../fileManager';

describe('fileManager', () => {
  describe('createNewProject', () => {
    it('should create a project with default values', () => {
      const project = createNewProject();
      
      expect(project.version).toBe(FILE_FORMAT_VERSION);
      expect(project.metadata.name).toBe('Untitled');
      expect(project.metadata.appVersion).toBe('0.1.0');
      expect(project.bpm).toBe(120);
      expect(project.patterns).toEqual([]);
      expect(project.song.patterns).toEqual([]);
    });

    it('should accept custom name', () => {
      const project = createNewProject('My Project');
      expect(project.metadata.name).toBe('My Project');
    });

    it('should have valid effects routing structure', () => {
      const project = createNewProject();
      
      expect(project.effectsRouting.tb303).toEqual({ insert: [], send: [] });
      expect(project.effectsRouting.tr808).toEqual({ insert: [], send: [] });
      expect(project.effectsRouting.tr909).toEqual({ insert: [], send: [] });
      expect(project.effectsRouting.master).toEqual({ insert: [], send: [] });
    });

    it('should have valid automation structure', () => {
      const project = createNewProject();
      
      expect(project.automation).toEqual({
        global: {},
        patterns: {}
      });
    });
  });

  describe('exportProjectToJSON', () => {
    it('should export project to JSON string', () => {
      const project = createNewProject('Test Project');
      const result = exportProjectToJSON(project);
      
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data?.metadata.name).toBe('Test Project');
    });

    it('should respect export options', () => {
      const project = createNewProject();
      const result = exportProjectToJSON(project, { includeMetadata: false });
      
      expect(result.success).toBe(true);
      expect(result.data?.metadata).toBeUndefined();
    });

    it('should use pretty print by default', () => {
      const project = createNewProject();
      const result = exportProjectToJSON(project);
      
      expect(result.success).toBe(true);
      if (result.data) {
        const jsonStr = JSON.stringify(result.data, null, 2);
        expect(jsonStr).toContain('
');
      }
    });

    it('should handle partial project data', () => {
      const partialProject = {
        metadata: { name: 'Partial' }
      };
      const result = exportProjectToJSON(partialProject);
      
      expect(result.success).toBe(true);
      expect(result.data?.metadata.name).toBe('Partial');
    });
  });

  describe('importProjectFromJSON', () => {
    it('should import valid JSON string', () => {
      const project = createNewProject('Import Test');
      const exported = exportProjectToJSON(project);
      
      if (exported.success && exported.data) {
        const jsonStr = JSON.stringify(exported.data);
        const result = importProjectFromJSON(jsonStr);
        
        expect(result.success).toBe(true);
        expect(result.data?.metadata.name).toBe('Import Test');
      }
    });

    it('should update timestamp on import', () => {
      const project = createNewProject();
      const oldUpdatedAt = project.metadata.updatedAt;
      const exported = exportProjectToJSON(project);
      
      if (exported.success && exported.data) {
        const jsonStr = JSON.stringify(exported.data);
        const result = importProjectFromJSON(jsonStr);
        
        if (result.success && result.data) {
          expect(result.data.metadata.updatedAt).not.toBe(oldUpdatedAt);
        }
      }
    });

    it('should fail with invalid JSON', () => {
      const result = importProjectFromJSON('invalid json');
      expect(result.success).toBe(false);
    });

    it('should fail with missing version', () => {
      const result = importProjectFromJSON('{"metadata":{}}');
      expect(result.success).toBe(false);
    });
  });

  describe('validateProject', () => {
    it('should validate complete project', () => {
      const project = createNewProject();
      expect(validateProject(project)).toBe(true);
    });

    it('should reject null', () => {
      expect(validateProject(null)).toBe(false);
    });

    it('should reject non-object', () => {
      expect(validateProject('string')).toBe(false);
    });

    it('should reject object without version', () => {
      const invalidProject = { metadata: { name: 'test' } };
      expect(validateProject(invalidProject)).toBe(false);
    });

    it('should reject object without metadata', () => {
      const invalidProject = { version: '1.0', bpm: 120 };
      expect(validateProject(invalidProject as any)).toBe(false);
    });

    it('should reject object without patterns array', () => {
      const invalidProject = { version: '1.0', metadata: { name: 'test' } };
      expect(validateProject(invalidProject as any)).toBe(false);
    });

    it('should reject object without bpm', () => {
      const invalidProject = { version: '1.0', metadata: { name: 'test' }, patterns: [] };
      expect(validateProject(invalidProject as any)).toBe(false);
    });
  });

  describe('generateFilename', () => {
    it('should generate filename from project name', () => {
      const project = createNewProject('My Song');
      const filename = generateFilename(project);
      
      expect(filename).toContain('My_Song');
      expect(filename).toContain('.json');
    });

    it('should sanitize special characters', () => {
      const project = createNewProject('My/Song:Name*Test?');
      const filename = generateFilename(project);
      
      expect(filename).not.toContain('/');
      expect(filename).not.toContain(':');
      expect(filename).not.toContain('*');
      expect(filename).not.toContain('?');
    });

    it('should limit filename length', () => {
      const longName = 'a'.repeat(100);
      const project = createNewProject(longName);
      const filename = generateFilename(project);
      
      expect(filename.length).toBeLessThan(100);
    });

    it('should include date in filename', () => {
      const project = createNewProject();
      const filename = generateFilename(project);
      
      expect(filename).toMatch(/r3b1rth_.*_d{4}-d{2}-d{2}.json/);
    });
  });

  describe('migration', () => {
    it('should add missing metadata during import', () => {
      const jsonStr = JSON.stringify({
        version: '1.0',
        bpm: 120,
        patterns: []
      });
      
      const result = importProjectFromJSON(jsonStr);
      expect(result.success).toBe(true);
      if (result.data) {
        expect(result.data.metadata).toBeDefined();
        expect(result.data.metadata.name).toBe('Untitled');
      }
    });

    it('should add missing bpm during import', () => {
      const jsonStr = JSON.stringify({
        version: '1.0',
        metadata: { name: 'test' },
        patterns: []
      });
      
      const result = importProjectFromJSON(jsonStr);
      expect(result.success).toBe(true);
      if (result.data) {
        expect(result.data.bpm).toBe(120);
      }
    });

    it('should add missing effectsRouting during import', () => {
      const jsonStr = JSON.stringify({
        version: '1.0',
        metadata: { name: 'test' },
        bpm: 120,
        patterns: []
      });
      
      const result = importProjectFromJSON(jsonStr);
      expect(result.success).toBe(true);
      if (result.data) {
        expect(result.data.effectsRouting).toBeDefined();
        expect(result.data.effectsRouting.tb303).toEqual({ insert: [], send: [] });
      }
    });

    it('should add missing automation during import', () => {
      const jsonStr = JSON.stringify({
        version: '1.0',
        metadata: { name: 'test' },
        bpm: 120,
        patterns: []
      });
      
      const result = importProjectFromJSON(jsonStr);
      expect(result.success).toBe(true);
      if (result.data) {
        expect(result.data.automation).toBeDefined();
        expect(result.data.automation.global).toEqual({});
        expect(result.data.automation.patterns).toEqual({});
      }
    });
  });
});
