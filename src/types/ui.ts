// UI types for R3B1RTH

import { SectionType } from './audio';

export type Theme = 'dark' | 'light' | 'retro' | 'modern';

export interface ThemeColors {
  background: string;
  backgroundSecondary: string;
  text: string;
  textSecondary: string;
  textTertiary: string;
  accent: string;
  accentSecondary: string;
  section808: string;
  section909: string;
  section303_1: string;
  section303_2: string;
  knobBackground: string;
  knobForeground: string;
  knobActive: string;
  faderTrack: string;
  faderThumb: string;
  buttonPrimary: string;
  buttonSecondary: string;
  buttonActive: string;
  ledOn: string;
  ledOff: string;
  border: string;
  panelBackground: string;
  stepButtonOn: string;
  stepButtonOff: string;
  stepButtonAccent: string;
  stepButtonFlam: string;
  stepButtonSlide: string;
}

export interface UIState {
  theme: Theme;
  focusedControl: string | null;
  focusedSection: SectionType | null;
  showTooltips: boolean;
  tooltipContent: string | null;
  tooltipPosition: { x: number; y: number } | null;
  activeModal: string | null;
  modalContent: any;
  keyboardShortcutsEnabled: boolean;
  lastKeyPress: string | null;
  width: number;
  height: number;
  isDesktop: boolean;
  isTablet: boolean;
  isMobile: boolean;
  isPortrait: boolean;
  isLandscape: boolean;
  visibleSections: SectionType[];
  collapsedSections: SectionType[];
  touchActive: boolean;
  touchStartTime: number | null;
  dragActive: boolean;
  dragStartValue: number | null;
  dragStartY: number | null;
  colors: ThemeColors;
}

export interface UIActions {
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  setFocusedControl: (control: string | null) => void;
  setFocusedSection: (section: SectionType | null) => void;
  setShowTooltips: (show: boolean) => void;
  setTooltip: (content: string | null, position?: { x: number; y: number }) => void;
  clearTooltip: () => void;
  openModal: (modalId: string, content?: any) => void;
  closeModal: () => void;
  setKeyboardShortcuts: (enabled: boolean) => void;
  setLastKeyPress: (key: string | null) => void;
  setLayout: (width: number, height: number) => void;
  setMode: (mode: string) => void;
  toggleSection: (section: SectionType) => void;
  setTouchActive: (active: boolean) => void;
  setDragActive: (active: boolean) => void;
  startDrag: (controlId: string, startY: number, startValue: number) => void;
  updateDrag: (y: number) => void;
  endDrag: () => void;
  resetUI: () => void;
}

export type UIStore = UIState & UIActions;
