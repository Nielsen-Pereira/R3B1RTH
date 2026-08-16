/**
 * Mods Store - R3B-88 to R3B-94
 * Zustand store for managing ReBirth RB-338 Mods
 */

import { create } from 'zustand';
import type { Mod, ModSection } from '../types/mods';
import { STANDARD_MOD } from '../types/mods';

interface ModsState {
  mods: Mod[];
  currentModId: string | null;
  isLoading: boolean;
  error: string | null;
}

interface ModsActions {
  loadMods: () => Promise<void>;
  activateMod: (modId: string) => void;
  deactivateMod: () => void;
  addMod: (mod: Omit<Mod, 'id'>) => Promise<Mod>;
  deleteMod: (modId: string) => Promise<boolean>;
  getNonStandardMods: () => Mod[];
  getCurrentMod: () => Mod | null;
}

type ModsStore = ModsState & ModsActions;

const initialMods: Mod[] = [STANDARD_MOD];

export const useModsStore = create<ModsStore>((set, get) => ({
  mods: initialMods,
  currentModId: STANDARD_MOD.id,
  isLoading: false,
  error: null,

  loadMods: async () => {
    set({ isLoading: true, error: null });
    try {
      const savedMods = localStorage.getItem('r3b1rth-mods');
      if (savedMods) {
        const parsedMods: Mod[] = JSON.parse(savedMods);
        set({ mods: [STANDARD_MOD, ...parsedMods.filter(m => !m.isStandard)] });
      }
    } catch (err) {
      set({ error: 'Failed to load mods' });
    } finally {
      set({ isLoading: false });
    }
  },

  activateMod: (modId: string) => {
    const { mods } = get();
    const modExists = mods.some(m => m.id === modId);
    if (modExists) {
      set({ currentModId: modId });
      localStorage.setItem('r3b1rth-current-mod', modId);
    }
  },

  deactivateMod: () => {
    set({ currentModId: STANDARD_MOD.id });
    localStorage.setItem('r3b1rth-current-mod', STANDARD_MOD.id);
  },

  addMod: async (modData: Omit<Mod, 'id'>) => {
    const { mods } = get();
    const newMod: Mod = {
      ...modData,
      id: crypto.randomUUID(),
    };
    const updatedMods = [...mods, newMod];
    set({ mods: updatedMods });
    localStorage.setItem('r3b1rth-mods', JSON.stringify(updatedMods));
    return newMod;
  },

  deleteMod: async (modId: string) => {
    const { mods, currentModId } = get();
    if (modId === STANDARD_MOD.id) {
      return false;
    }
    const updatedMods = mods.filter(m => m.id !== modId);
    set({ mods: updatedMods });
    if (currentModId === modId) {
      set({ currentModId: STANDARD_MOD.id });
    }
    localStorage.setItem('r3b1rth-mods', JSON.stringify(updatedMods));
    localStorage.setItem('r3b1rth-current-mod', STANDARD_MOD.id);
    return true;
  },

  getNonStandardMods: () => {
    const { mods } = get();
    return mods.filter(m => !m.isStandard);
  },

  getCurrentMod: () => {
    const { mods, currentModId } = get();
    if (!currentModId) return null;
    return mods.find(m => m.id === currentModId) ?? null;
  },
}));