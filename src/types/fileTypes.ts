/**
 * File Types - R3B-114, R3B-141
 * Type definitions for file management operations
 */

export interface PatternFile {
  version: string;
  pattern: {
    id: string;
    name: string;
    steps: number[][];
    length: number;
    tempo: number;
  };
  metadata: {
    createdAt: string;
    createdBy: string;
    rebirthVersion: string;
  };
}

export interface PresetFile {
  version: string;
  preset: {
    id: string;
    name: string;
    deviceType: 'tb303' | 'tr808' | 'tr909';
    parameters: Record<string, number>;
  };
  metadata: {
    createdAt: string;
    createdBy: string;
  };
}

export interface ProjectFile {
  version: string;
  project: {
    id: string;
    name: string;
    patterns: PatternFile[];
    song: any;
    tempo: number;
    swing: number;
  };
  metadata: {
    createdAt: string;
    modifiedAt: string;
    createdBy: string;
    rebirthVersion: string;
  };
}

export type FileExportFormat = 'r3b' | 'json' | 'wav' | 'aiff';

export interface ExportOptions {
  format: FileExportFormat;
  includeMetadata?: boolean;
  sampleRate?: number;
  bitDepth?: number;
}

export interface FileManagerState {
  recentFiles: string[];
  currentFile: string | null;
  isSaving: boolean;
  isLoading: boolean;
  error: string | null;
}