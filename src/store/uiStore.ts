import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { SectionType } from '../types/audio';

interface UIState {
  theme: string;
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
  colors: any;
}

interface UIActions {
  setTheme: (theme: string) => void;
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

type UIStore = UIState & UIActions;

const defaultColors = {
  background: '#1a1a2e',
  backgroundSecondary: '#16213e',
  text: '#eaeaea',
  textSecondary: '#a0a0a0',
  textTertiary: '#6c6c6c',
  accent: '#e94560',
  accentSecondary: '#ff6b6b',
  section808: '#e94560',
  section909: '#0f3460',
  section303_1: '#e94560',
  section303_2: '#0f3460',
  knobBackground: '#2a2a4a',
  knobForeground: '#ffffff',
  knobActive: '#e94560',
  faderTrack: '#3a3a5a',
  faderThumb: '#ffffff',
  buttonPrimary: '#e94560',
  buttonSecondary: '#3a3a5a',
  buttonActive: '#ff6b6b',
  ledOn: '#ff0000',
  ledOff: '#2a2a2a',
  ledGreen: '#00ff00',
  ledYellow: '#ffff00',
  ledBlue: '#0000ff',
  ledOrange: '#ffa500',
  border: '#3a3a5a',
  panelBackground: 'rgba(0, 0, 0, 0.3)',
  stepButtonOn: '#e94560',
  stepButtonOff: '#2a2a2a',
  stepButtonAccent: '#ff6b6b',
  stepButtonFlam: '#ffa500',
  stepButtonSlide: '#00ffff',
  stepButtonMuted: '#4a4a4a',
};

const initialState: UIState = {
  theme: 'dark',
  focusedControl: null,
  focusedSection: null,
  showTooltips: true,
  tooltipContent: null,
  tooltipPosition: null,
  activeModal: null,
  modalContent: null,
  keyboardShortcutsEnabled: true,
  lastKeyPress: null,
  width: typeof window !== 'undefined' ? window.innerWidth : 1024,
  height: typeof window !== 'undefined' ? window.innerHeight : 768,
  isDesktop: true,
  isTablet: false,
  isMobile: false,
  isPortrait: false,
  isLandscape: true,
  visibleSections: ['808', '909', '303_1', '303_2'],
  collapsedSections: [],
  touchActive: false,
  touchStartTime: null,
  dragActive: false,
  dragStartValue: null,
  dragStartY: null,
  colors: defaultColors,
};

export const useUIStore = create<UIStore>()(
  devtools(
    persist(
      (set) => ({
        ...initialState,
        setTheme: (theme) => {
          set({ theme, colors: theme === 'dark' ? defaultColors : defaultColors });
          if (typeof document !== 'undefined') {
            document.documentElement.setAttribute('data-theme', theme);
          }
        },
        toggleTheme: () => set((state) => ({ theme: state.theme === 'dark' ? 'light' : 'dark' })),
        setFocusedControl: (control) => set({ focusedControl: control }),
        setFocusedSection: (section) => set({ focusedSection: section }),
        setShowTooltips: (show) => set({ showTooltips: show }),
        setTooltip: (content, position) => set({ tooltipContent: content, tooltipPosition: position || null }),
        clearTooltip: () => set({ tooltipContent: null, tooltipPosition: null }),
        openModal: (modalId, content) => {
          set({ activeModal: modalId, modalContent: content || null });
          if (typeof document !== 'undefined') document.body.style.overflow = 'hidden';
        },
        closeModal: () => {
          set({ activeModal: null, modalContent: null });
          if (typeof document !== 'undefined') document.body.style.overflow = '';
        },
        setKeyboardShortcuts: (enabled) => set({ keyboardShortcutsEnabled: enabled }),
        setLastKeyPress: (key) => set({ lastKeyPress: key }),
        setLayout: (width, height) => {
          const isPortrait = width < height;
          set({
            width,
            height,
            isDesktop: width >= 1024,
            isTablet: width >= 768 && width < 1024,
            isMobile: width < 768,
            isPortrait,
            isLandscape: !isPortrait,
          });
        },
        setMode: (mode) => set({ mode }),
        toggleSection: (section) => set((state) => {
          const collapsed = [...state.collapsedSections];
          const index = collapsed.indexOf(section);
          if (index >= 0) collapsed.splice(index, 1);
          else collapsed.push(section);
          return { collapsedSections: collapsed };
        }),
        setTouchActive: (active) => set({ touchActive: active }),
        setDragActive: (active) => set({ dragActive: active }),
        startDrag: (controlId, startY, startValue) => set({
          dragActive: true,
          dragStartValue: startValue,
          dragStartY: startY,
        }),
        updateDrag: (y) => {},
        endDrag: () => set({
          dragActive: false,
          dragStartValue: null,
          dragStartY: null,
        }),
        resetUI: () => set(initialState),
      }),
      {
        name: 'ui-store',
        partialize: (state) => ({
          theme: state.theme,
          showTooltips: state.showTooltips,
          keyboardShortcutsEnabled: state.keyboardShortcutsEnabled,
          collapsedSections: state.collapsedSections,
        }),
      }
    ),
    { name: 'UIStore' }
  )
);

export default useUIStore;