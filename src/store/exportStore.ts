import { create } from 'zustand';
import { Pattern, GlobalSettings, ExportFormat, ExportSettings } from '../types/audio';

interface ExportStoreState {
  settings: ExportSettings;
  isExporting: boolean;
  exportProgress: number;
  exportError: string | null;
}

interface ExportStoreActions {
  setExportSettings: (settings: Partial<ExportSettings>) => void;
  startExport: () => void;
  stopExport: () => void;
  setExportProgress: (progress: number) => void;
  setExportError: (error: string | null) => void;
  exportSong: (patterns: Pattern[][], settings: GlobalSettings) => Promise<Blob | null>;
  exportPattern: (pattern: Pattern, settings: GlobalSettings) => Promise<Blob | null>;
}

type ExportStore = ExportStoreState & ExportStoreActions;

const defaultExportSettings: ExportSettings = {
  format: 'wav',
  sampleRate: 44100,
  bitDepth: 16,
  quality: 0.9,
  includeEffects: true,
  normalize: true,
  bpm: 120,
  startPattern: 0,
  endPattern: 15
};

const initialState: ExportStoreState = {
  settings: { ...defaultExportSettings },
  isExporting: false,
  exportProgress: 0,
  exportError: null
};

export const useExportStore = create<ExportStore>((set, get) => ({
  ...initialState,
  setExportSettings: (settings: Partial<ExportSettings>) => {
    set({ settings: { ...get().settings, ...settings } });
  },
  startExport: () => {
    set({ isExporting: true, exportProgress: 0, exportError: null });
  },
  stopExport: () => {
    set({ isExporting: false });
  },
  setExportProgress: (progress: number) => {
    set({ exportProgress: Math.max(0, Math.min(1, progress)) });
  },
  setExportError: (error: string | null) => {
    set({ exportError: error });
  },
  exportSong: async (patterns: Pattern[][], settings: GlobalSettings): Promise<Blob | null> => {
    set({ isExporting: true, exportProgress: 0, exportError: null });
    try {
      set({ exportProgress: 0.3 });
      await new Promise(resolve => setTimeout(resolve, 100));
      set({ exportProgress: 0.6 });
      await new Promise(resolve => setTimeout(resolve, 100));
      set({ exportProgress: 0.9 });
      const blob = new Blob(['dummy audio data'], { type: 'audio/wav' });
      set({ exportProgress: 1, isExporting: false });
      return blob;
    } catch (error) {
      set({ isExporting: false, exportError: error instanceof Error ? error.message : 'Export failed' });
      return null;
    }
  },
  exportPattern: async (pattern: Pattern, settings: GlobalSettings): Promise<Blob | null> => {
    set({ isExporting: true, exportProgress: 0, exportError: null });
    try {
      await new Promise(resolve => setTimeout(resolve, 50));
      set({ exportProgress: 0.5 });
      await new Promise(resolve => setTimeout(resolve, 50));
      set({ exportProgress: 1, isExporting: false });
      const blob = new Blob(['dummy pattern audio data'], { type: 'audio/wav' });
      return blob;
    } catch (error) {
      set({ isExporting: false, exportError: error instanceof Error ? error.message : 'Pattern export failed' });
      return null;
    }
  }
}));

export function startSongExport(): void {
  useExportStore.getState().startExport();
}

export function exportSong(patterns: Pattern[][], settings: GlobalSettings): Promise<Blob | null> {
  return useExportStore.getState().exportSong(patterns, settings);
}

export function exportSinglePattern(pattern: Pattern, settings: GlobalSettings): Promise<Blob | null> {
  return useExportStore.getState().exportPattern(pattern, settings);
}

export function getExportSettings(): ExportSettings {
  return useExportStore.getState().settings;
}

export function setExportFormat(format: ExportFormat): void {
  useExportStore.getState().setExportSettings({ format });
}

export function getExportState() {
  return useExportStore.getState();
}