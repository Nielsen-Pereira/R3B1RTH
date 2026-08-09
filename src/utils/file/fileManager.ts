/**
 * File Manager
 * Handles loading and saving project files
 */

export interface ProjectFile {
  version: string;
  name: string;
  created: string;
  modified: string;
  tempo: number;
  shuffle: number;
  patterns: any[];
  song: any;
  audioSettings: any;
  sequencerSettings: any;
  uiSettings: any;
}

const PROJECT_FILE_VERSION = '1.0.0';

/**
 * Saves the current project to a file
 */
export function saveProjectFile(
  name: string,
  tempo: number,
  shuffle: number,
  patterns: any[],
  song: any,
  audioSettings: any,
  sequencerSettings: any,
  uiSettings: any
): ProjectFile {
  return {
    version: PROJECT_FILE_VERSION,
    name,
    created: new Date().toISOString(),
    modified: new Date().toISOString(),
    tempo,
    shuffle,
    patterns,
    song,
    audioSettings,
    sequencerSettings,
    uiSettings,
  };
}

/**
 * Loads a project from a file
 */
export function loadProjectFile(file: ProjectFile): ProjectFile {
  if (file.version !== PROJECT_FILE_VERSION) {
    console.warn(`Project file version mismatch. Expected: ${PROJECT_FILE_VERSION}, Got: ${file.version}`);
  }
  
  return file;
}

/**
 * Exports project to JSON string
 */
export function exportProjectToJSON(project: ProjectFile): string {
  return JSON.stringify(project, null, 2);
}

/**
 * Imports project from JSON string
 */
export function importProjectFromJSON(json: string): ProjectFile {
  try {
    const project = JSON.parse(json) as ProjectFile;
    return loadProjectFile(project);
  } catch (error) {
    throw new Error(`Failed to parse project file: ${error}`);
  }
}

/**
 * Downloads project as a file
 */
export function downloadProjectFile(project: ProjectFile, filename?: string) {
  const json = exportProjectToJSON(project);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  
  const a = document.createElement('a');
  a.href = url;
  a.download = filename || `${project.name || 'untitled'}.r3b.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Uploads project from a file
 */
export function uploadProjectFile(callback: (project: ProjectFile) => void) {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.json,.r3b.json';
  
  input.onchange = (event) => {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const json = e.target?.result as string;
          const project = importProjectFromJSON(json);
          callback(project);
        } catch (error) {
          console.error('Failed to load project:', error);
        }
      };
      reader.readAsText(file);
    }
  };
  
  input.click();
}

export default {
  saveProjectFile,
  loadProjectFile,
  exportProjectToJSON,
  importProjectFromJSON,
  downloadProjectFile,
  uploadProjectFile,
};