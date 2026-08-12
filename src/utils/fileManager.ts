/**
 * File Manager for R3B1RTH
 * Handles JSON serialization/deserialization of songs, patterns, automation, and effects routing
 */

import { Song, Pattern } from '../types/songTypes';
import { AutomationData } from '../types/automationTypes';
import { EffectRouting, InstrumentType } from '../types/effectTypes';

const FILE_FORMAT_VERSION = '1.0';

export interface R3B1RTHProject {
  version: string;
  metadata: {
    name: string;
    createdAt: string;
    updatedAt: string;
    appVersion: string;
  };
  bpm: number;
  song: Song;
  patterns: Pattern[];
  automation: AutomationData;
  effectsRouting: Record<InstrumentType, EffectRouting>;
  currentPatternIndex: number;
  currentSongId: string | null;
}

export interface ExportOptions {
  includeMetadata?: boolean;
  includePatterns?: boolean;
  includeAutomation?: boolean;
  includeEffectsRouting?: boolean;
  prettyPrint?: boolean;
}

export interface FileOperationResult {
  success: boolean;
  message: string;
  data?: R3B1RTHProject;
  error?: Error;
}

const DEFAULT_EXPORT_OPTIONS: Required<ExportOptions> = {
  includeMetadata: true,
  includePatterns: true,
  includeAutomation: true,
  includeEffectsRouting: true,
  prettyPrint: true
};

export function createNewProject(name: string = 'Untitled'): R3B1RTHProject {
  const now = new Date().toISOString();
  return {
    version: FILE_FORMAT_VERSION,
    metadata: {
      name,
      createdAt: now,
      updatedAt: now,
      appVersion: '0.1.0'
    },
    bpm: 120,
    song: {
      id: crypto.randomUUID(),
      name: 'Song 1',
      patterns: [],
      loopEnabled: false,
      loopStart: 0,
      loopEnd: 0,
      currentPatternIndex: 0
    },
    patterns: [],
    automation: {
      global: {},
      patterns: {}
    },
    effectsRouting: {
      tb303: { insert: [], send: [] },
      tr808: { insert: [], send: [] },
      tr909: { insert: [], send: [] },
      master: { insert: [], send: [] }
    },
    currentPatternIndex: 0,
    currentSongId: null
  };
}

export function exportProjectToJSON(
  project: Partial<R3B1RTHProject>,
  options: ExportOptions = {}
): FileOperationResult {
  try {
    const mergedOptions = { ...DEFAULT_EXPORT_OPTIONS, ...options };
    const exportData: Partial<R3B1RTHProject> = { ...project };

    if (!mergedOptions.includeMetadata) {
      delete exportData.metadata;
    }
    if (!mergedOptions.includePatterns) {
      delete exportData.patterns;
    }
    if (!mergedOptions.includeAutomation) {
      delete exportData.automation;
    }
    if (!mergedOptions.includeEffectsRouting) {
      delete exportData.effectsRouting;
    }

    const jsonString = JSON.stringify(exportData, null, mergedOptions.prettyPrint ? 2 : undefined);
    
    return {
      success: true,
      message: 'Project exported successfully',
      data: exportData as R3B1RTHProject
    };
  } catch (error) {
    return {
      success: false,
      message: 'Failed to export project',
      error: error instanceof Error ? error : new Error(String(error))
    };
  }
}

export function importProjectFromJSON(
  jsonString: string
): FileOperationResult {
  try {
    const parsed = JSON.parse(jsonString) as R3B1RTHProject;
    if (!parsed.version) {
      throw new Error('Invalid file format: missing version');
    }
    const migratedProject = migrateProject(parsed);
    migratedProject.metadata.updatedAt = new Date().toISOString();
    return {
      success: true,
      message: 'Project imported successfully',
      data: migratedProject
    };
  } catch (error) {
    return {
      success: false,
      message: 'Failed to import project',
      error: error instanceof Error ? error : new Error(String(error))
    };
  }
}

function migrateProject(project: R3B1RTHProject): R3B1RTHProject {
  const migrated = { ...project };
  if (!migrated.metadata) {
    migrated.metadata = {
      name: 'Untitled',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      appVersion: '0.1.0'
    };
  }
  if (typeof migrated.bpm !== 'number') {
    migrated.bpm = 120;
  }
  if (!migrated.effectsRouting) {
    migrated.effectsRouting = {
      tb303: { insert: [], send: [] },
      tr808: { insert: [], send: [] },
      tr909: { insert: [], send: [] },
      master: { insert: [], send: [] }
    };
  }
  if (!migrated.automation) {
    migrated.automation = { global: {}, patterns: {} };
  }
  return migrated;
}

export function downloadProject(
  project: Partial<R3B1RTHProject>,
  filename: string,
  options: ExportOptions
): void {
  const result = exportProjectToJSON(project, options);
  if (!result.success) {
    throw result.error;
  }
  const jsonStr = result.data ? JSON.stringify(result.data, null, 2) : '{}';
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function downloadProjectDefault(
  project: Partial<R3B1RTHProject>,
  options: ExportOptions = {}
): void {
  const proj = project as R3B1RTHProject;
  const cleanName = proj.metadata?.name.replace(/[^a-zA-Z0-9-_]/g, '_').substring(0, 50) || 'untitled';
  const datePart = proj.metadata?.createdAt.substring(0, 10) || new Date().toISOString().substring(0, 10);
  downloadProject(project, 'r3b1rth_' + cleanName + '_' + datePart + '.json', options);
}

export async function handleFileUpload(
  file: File
): Promise<FileOperationResult> {
  try {
    const text = await file.text();
    return importProjectFromJSON(text);
  } catch (error) {
    return {
      success: false,
      message: 'Failed to read file',
      error: error instanceof Error ? error : new Error(String(error))
    };
  }
}

export function validateProject(project: unknown): project is R3B1RTHProject {
  if (!project || typeof project !== 'object') {
    return false;
  }
  const p = project as Record<string, unknown>;
  return (
    typeof p.version === 'string' &&
    typeof p.metadata === 'object' && p.metadata !== null &&
    typeof (p.metadata as Record<string, unknown>).name === 'string' &&
    Array.isArray(p.patterns) &&
    typeof p.bpm === 'number'
  );
}

export {
  FILE_FORMAT_VERSION,
  type R3B1RTHProject,
  type ExportOptions,
  type FileOperationResult
};
