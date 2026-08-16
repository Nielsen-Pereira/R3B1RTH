/**
 * useMods Hook - R3B-88 to R3B-94
 * Custom hook for Mods system operations
 */

import { useCallback } from 'react';
import { useModsStore } from '../stores/modsStore';
import type { Mod, ModId } from '../types/mods';

export const useMods = () => {
  const store = useModsStore();
  
  const loadMods = useCallback(async () => {
    await store.loadMods();
  }, [store]);

  const loadMod = useCallback(async (modId: ModId): Promise<Mod | null> => {
    return await store.loadMod(modId);
  }, [store]);

  const activateMod = useCallback((modId: ModId) => {
    store.activateMod(modId);
  }, [store]);

  const deactivateMod = useCallback(() => {
    store.deactivateMod();
  }, [store]);

  const addMod = useCallback(async (modData: Omit<Mod, 'id' | 'createdAt' | 'updatedAt'>): Promise<Mod> => {
    return await store.addMod(modData);
  }, [store]);

  const updateMod = useCallback(async (modId: ModId, updates: Partial<Mod>): Promise<Mod | null> => {
    return await store.updateMod(modId, updates);
  }, [store]);

  const deleteMod = useCallback(async (modId: ModId): Promise<boolean> => {
    return await store.deleteMod(modId);
  }, [store]);

  const createStandardMod = useCallback((): Mod => {
    return store.createStandardMod();
  }, [store]);

  const getCurrentMod = useCallback((): Mod | null => {
    const state = store.getState();
    return state.mods.find(m => m.id === state.currentModId) || state.mods[0] || null;
  }, [store]);

  const getAllMods = useCallback((): Mod[] => {
    return store.getState().mods;
  }, [store]);

  const getNonStandardMods = useCallback((): Mod[] => {
    return store.getState().mods.filter(m => !m.isStandard);
  }, [store]);

  const isStandardModActive = useCallback((): boolean => {
    return store.getState().currentModId === 'standard';
  }, [store]);

  return {
    // State
    mods: store((state) => state.mods),
    currentModId: store((state) => state.currentModId),
    currentMod: getCurrentMod(),
    isLoading: store((state) => state.isLoading),
    error: store((state) => state.error),
    
    // Actions
    loadMods,
    loadMod,
    activateMod,
    deactivateMod,
    addMod,
    updateMod,
    deleteMod,
    createStandardMod,
    getAllMods,
    getNonStandardMods,
    isStandardModActive,
  };
};

export default useMods;
