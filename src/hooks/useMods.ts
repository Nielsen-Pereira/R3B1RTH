/**
 * useMods Hook - R3B-88 to R3B-94
 * Custom hook for accessing mods store
 */

import { useModsStore } from '../stores/modsStore';
import type { Mod } from '../types/mods';

export const useMods = () => {
  const store = useModsStore();
  return {
    ...store,
    currentMod: store.getCurrentMod(),
  };
};