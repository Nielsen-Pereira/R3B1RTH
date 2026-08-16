/**
 * Mods Store - R3B-88 to R3B-94
 * Zustand store for ReBirth RB-338 Mods system
 */

import { create } from 'zustand';
import { STANDARD_MOD } from '../types/mods';
import type { Mod, ModId, ModsState, ModsActions } from '../types/mods';

const MODS_STORAGE_KEY = 'r3b1rth_mods';
const ACTIVE_MOD_KEY = 'r3b1rth_active_mod';

export const useModsStore = create<ModsState & ModsActions>((set, get) => ({
  // State
  mods: [STANDARD_MOD],
  currentModId: STANDARD_MOD.id,
  isLoading: false,
  error: null,

  // Actions
  loadMods: async () => {
    set({ isLoading: true, error: null });
    try {
      const savedMods = localStorage.getItem(MODS_STORAGE_KEY);
      const savedActiveMod = localStorage.getItem(ACTIVE_MOD_KEY);
      
      let mods: Mod[] = [STANDARD_MOD];
      if (savedMods) {
        try {
          const parsed = JSON.parse(savedMods) as Mod[];
          mods = [STANDARD_MOD, ...parsed.filter(m => m.id !== STANDARD_MOD.id)];
        } catch (e) {
          console.error('Failed to parse saved mods:', e);
        }
      }
      
      const activeModId = savedActiveMod || STANDARD_MOD.id;
      
      set({
        mods,
        currentModId: activeModId,
        isLoading: false
      });
    } catch (error) {
      set({
        isLoading: false,
        error: 'Failed to load mods'
      });
      throw error;
    }
  },

  loadMod: async (modId: ModId) => {
    const mods = get().mods;
    const mod = mods.find(m => m.id === modId);
    return mod || null;
  },

  activateMod: (modId: ModId) => {
    const mods = get().mods;
    const modExists = mods.some(m => m.id === modId);
    
    if (modExists) {
      set({ currentModId: modId });
      localStorage.setItem(ACTIVE_MOD_KEY, modId);
    } else {
      set({ error: 'Mod not found' });
    }
  },

  deactivateMod: () => {
    set({ currentModId: STANDARD_MOD.id });
    localStorage.setItem(ACTIVE_MOD_KEY, STANDARD_MOD.id);
  },

  addMod: async (modData: Omit<Mod, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newMod: Mod = {
      ...modData,
      id: 'mod-' + Date.now().toString(36) + '-' + Math.random().toString(36).substr(2, 4),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isStandard: false,
      isActive: false
    };
    
    const mods = get().mods;
    const updatedMods = [...mods, newMod];
    
    set({ mods: updatedMods });
    localStorage.setItem(MODS_STORAGE_KEY, JSON.stringify(updatedMods));
    
    return newMod;
  },

  updateMod: async (modId: ModId, updates: Partial<Mod>) => {
    const mods = get().mods;
    const modIndex = mods.findIndex(m => m.id === modId);
    
    if (modIndex === -1) {
      set({ error: 'Mod not found' });
      return null;
    }
    
    const updatedMod = {
      ...mods[modIndex],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    
    const updatedMods = [...mods];
    updatedMods[modIndex] = updatedMod;
    
    set({ mods: updatedMods });
    localStorage.setItem(MODS_STORAGE_KEY, JSON.stringify(updatedMods));
    
    return updatedMod;
  },

  deleteMod: async (modId: ModId) => {
    if (modId === STANDARD_MOD.id) {
      set({ error: 'Cannot delete standard mod' });
      return false;
    }
    
    const mods = get().mods;
    const currentModId = get().currentModId;
    
    if (currentModId === modId) {
      set({ currentModId: STANDARD_MOD.id });
      localStorage.setItem(ACTIVE_MOD_KEY, STANDARD_MOD.id);
    }
    
    const updatedMods = mods.filter(m => m.id !== modId);
    set({ mods: updatedMods });
    localStorage.setItem(MODS_STORAGE_KEY, JSON.stringify(updatedMods));
    
    return true;
  },

  createStandardMod: () => {
    return STANDARD_MOD;
  }
}));

// Selectors
export const getCurrentMod = (state: ModsState): Mod | null => {
  const mod = state.mods.find(m => m.id === state.currentModId);
  return mod || state.mods[0] || null;
};

export const getModById = (state: ModsState, modId: ModId): Mod | null => {
  return state.mods.find(m => m.id === modId) || null;
};

export const getAllMods = (state: ModsState): Mod[] => {
  return state.mods;
};

export const getNonStandardMods = (state: ModsState): Mod[] => {
  return state.mods.filter(m => !m.isStandard);
};

export const isStandardModActive = (state: ModsState): boolean => {
  return state.currentModId === STANDARD_MOD.id;
};
