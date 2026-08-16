/**
 * Mod Types - R3B-88 to R3B-94
 * Type definitions for ReBirth RB-338 Mods system
 */

export interface Mod {
  id: string;
  name: string;
  description: string;
  version: string;
  author?: string;
  sections: ModSection[];
  isStandard: boolean;
}

export interface ModSection {
  id: string;
  name: string;
  component: string;
  position: { x: number; y: number };
  visible: boolean;
}

export const STANDARD_MOD: Mod = {
  id: 'standard',
  name: 'Standard',
  description: 'Default ReBirth RB-338 layout matching the original hardware',
  version: '1.0.0',
  author: 'Propellerhead Software',
  sections: [],
  isStandard: true,
};