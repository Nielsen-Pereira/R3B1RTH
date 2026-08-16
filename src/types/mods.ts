/**
 * Mods System Types - R3B-88 to R3B-94
 * ReBirth RB-338 Mods system implementation
 */

export type ModId = string;

export interface ModControl {
  id: string;
  label: string;
  type: 'knob' | 'fader' | 'button' | 'switch' | 'led';
  min: number;
  max: number;
  default: number;
  step?: number;
  x: number;
  y: number;
  size?: 'small' | 'medium' | 'large';
  color?: string;
  visible: boolean;
}

export interface ModSection {
  id: string;
  name: string;
  controls: ModControl[];
  x: number;
  y: number;
  width: number;
  height: number;
  visible: boolean;
}

export interface Mod {
  id: ModId;
  name: string;
  description: string;
  version: string;
  author?: string;
  createdAt: string;
  updatedAt: string;
  sections: ModSection[];
  isStandard: boolean;
  isActive: boolean;
}

export interface ModsState {
  mods: Mod[];
  currentModId: ModId | null;
  isLoading: boolean;
  error: string | null;
}

export interface ModsActions {
  loadMods: () => Promise<void>;
  loadMod: (modId: ModId) => Promise<Mod | null>;
  activateMod: (modId: ModId) => void;
  deactivateMod: () => void;
  addMod: (mod: Omit<Mod, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Mod>;
  updateMod: (modId: ModId, updates: Partial<Mod>) => Promise<Mod | null>;
  deleteMod: (modId: ModId) => Promise<boolean>;
  createStandardMod: () => Mod;
}

export type ModsStore = ModsState & ModsActions;

// Default ReBirth RB-338 standard mod structure
export const STANDARD_MOD: Mod = {
  id: 'standard',
  name: 'ReBirth RB-338 Standard',
  description: 'Standard ReBirth RB-338 control layout',
  version: '2.0.1',
  author: 'Propellerhead Software',
  createdAt: '1998-01-01T00:00:00Z',
  updatedAt: '1998-01-01T00:00:00Z',
  isStandard: true,
  isActive: true,
  sections: [
    {
      id: 'tb303',
      name: 'TB-303',
      x: 10,
      y: 10,
      width: 200,
      height: 300,
      visible: true,
      controls: [
        { id: 'tb303_volume', label: 'Volume', type: 'fader', min: 0, max: 1, default: 0.8, x: 150, y: 20, visible: true },
        { id: 'tb303_cutoff', label: 'Cutoff', type: 'knob', min: 0, max: 1, default: 0.5, x: 20, y: 60, visible: true },
        { id: 'tb303_resonance', label: 'Resonance', type: 'knob', min: 0, max: 1, default: 0.5, x: 80, y: 60, visible: true },
        { id: 'tb303_envmod', label: 'Env Mod', type: 'knob', min: 0, max: 1, default: 0.5, x: 140, y: 60, visible: true },
        { id: 'tb303_decay', label: 'Decay', type: 'knob', min: 0, max: 1, default: 0.5, x: 20, y: 120, visible: true },
        { id: 'tb303_accent', label: 'Accent', type: 'knob', min: 0, max: 1, default: 0.5, x: 80, y: 120, visible: true },
        { id: 'tb303_waveform', label: 'Waveform', type: 'switch', min: 0, max: 1, default: 0, x: 20, y: 180, visible: true },
        { id: 'tb303_slide', label: 'Slide', type: 'button', min: 0, max: 1, default: 0, x: 80, y: 180, visible: true },
      ]
    },
    {
      id: 'tr808',
      name: 'TR-808',
      x: 220,
      y: 10,
      width: 200,
      height: 300,
      visible: true,
      controls: [
        { id: 'tr808_volume', label: 'Volume', type: 'fader', min: 0, max: 1, default: 0.8, x: 150, y: 20, visible: true },
        { id: 'tr808_bd', label: 'BD', type: 'led', min: 0, max: 1, default: 0, x: 20, y: 60, visible: true },
        { id: 'tr808_sd', label: 'SD', type: 'led', min: 0, max: 1, default: 0, x: 80, y: 60, visible: true },
      ]
    },
    {
      id: 'tr909',
      name: 'TR-909',
      x: 430,
      y: 10,
      width: 200,
      height: 300,
      visible: true,
      controls: []
    },
    {
      id: 'effects',
      name: 'Effects',
      x: 640,
      y: 10,
      width: 200,
      height: 300,
      visible: true,
      controls: []
    }
  ]
};
