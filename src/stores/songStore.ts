import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import {
  Song,
  SongPattern,
  SongState,
  LoopRange,
  defaultSong,
  defaultSongState,
  MAX_PATTERNS,
  MAX_SONG_MEASURES,
} from '../types/songTypes';
import {
  ControlId,
  AutomationPoint,
  AutomationTrack,
  PatternAutomation,
  SongAutomation,
} from '../types/automationTypes';

interface SongActions {
  // Song management
  createSong: (name?: string) => Song;
  deleteSong: (songId: string) => void;
  setCurrentSong: (songId: string | null) => void;
  renameSong: (songId: string, newName: string) => void;
  
  // Pattern management in song
  addPatternToSong: (songId: string, pattern: SongPattern) => void;
  removePatternFromSong: (songId: string, patternId: string) => void;
  reorderPatterns: (songId: string, oldIndex: number, newIndex: number) => void;
  updatePatternInSong: (songId: string, patternId: string, updates: Partial<SongPattern>) => void;
  
  // Loop management
  setLoopRange: (songId: string, loop: LoopRange) => void;
  
  // Playback control
  playSong: (songId: string) => void;
  stopSong: (songId: string) => void;
  setCurrentPatternIndex: (songId: string, index: number) => void;
  nextPattern: (songId: string) => void;
  previousPattern: (songId: string) => void;
  
  // Recording
  startRecording: () => void;
  stopRecording: () => void;
  
  // Automation
  startAutomationRecording: (songId: string, controlIds: ControlId[]) => void;
  stopAutomationRecording: (songId: string) => void;
  recordAutomation: (controlId: ControlId, value: number) => void;
  clearAutomation: (songId: string, controlId?: ControlId) => void;
  getAutomationForPattern: (songId: string, patternId: string, controlId: ControlId) => AutomationPoint[];
  getAutomationForSong: (songId: string, controlId: ControlId) => AutomationPoint[];
  deleteAutomationPoint: (songId: string, patternId: string, controlId: ControlId, timestamp: number) => void;
  
  // Utility
  getSongById: (songId: string) => Song | undefined;
  getCurrentSong: () => Song | undefined;
  getTotalMeasures: (songId: string) => number;
  canAddPattern: (songId: string) => boolean;
}

interface SongStoreState extends SongState {
  automation: SongAutomation[];
  isRecordingAutomation: boolean;
  recordingStartTime: number | null;
  currentRecordingControls: ControlId[];
  currentRecordingSongId: string | null;
}

type SongStore = SongStoreState & SongActions;

const useSongStore = create<SongStore>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial state
        ...defaultSongState,
        automation: [],
        isRecordingAutomation: false,
        recordingStartTime: null,
        currentRecordingControls: [],
        currentRecordingSongId: null,
        
        // Song management
        createSong: (name = 'Untitled Song') => {
          const newSong: Song = {
            ...defaultSong,
            id: crypto.randomUUID(),
            name,
          };
          set((state) => ({
            songs: [...state.songs, newSong],
            currentSongId: newSong.id,
            automation: [
              ...state.automation,
              {
                songId: newSong.id,
                globalTracks: [],
                patternAutomation: [],
              },
            ],
          }));
          return newSong;
        },
        
        deleteSong: (songId) => {
          set((state) => ({
            songs: state.songs.filter((s) => s.id !== songId),
            currentSongId: state.currentSongId === songId ? null : state.currentSongId,
            automation: state.automation.filter((a) => a.songId !== songId),
          }));
        },
        
        setCurrentSong: (songId) => {
          set({ currentSongId: songId });
        },
        
        renameSong: (songId, newName) => {
          set((state) => ({
            songs: state.songs.map((s) =>
              s.id === songId ? { ...s, name: newName, updatedAt: new Date().toISOString() } : s
            ),
          }));
        },
        
        // Pattern management
        addPatternToSong: (songId, pattern) => {
          set((state) => ({
            songs: state.songs.map((s) => {
              if (s.id !== songId) return s;
              
              // Check if pattern already exists
              const patternExists = s.patterns.some((p) => p.id === pattern.id);
              if (patternExists) return s;
              
              // Check if we can add more patterns
              if (s.patterns.length >= MAX_PATTERNS) return s;
              
              // Check total measures would not exceed limit
              const totalMeasures = s.patterns.reduce(
                (sum, p) => sum + p.length,
                0
              ) + pattern.length;
              if (totalMeasures > MAX_SONG_MEASURES) return s;
              
              return {
                ...s,
                patterns: [...s.patterns, pattern],
                updatedAt: new Date().toISOString(),
              };
            }),
            automation: state.automation.map((a) => {
              if (a.songId !== songId) return a;
              return {
                ...a,
                patternAutomation: [
                  ...a.patternAutomation,
                  {
                    patternId: pattern.id,
                    tracks: [],
                  },
                ],
              };
            }),
          }));
        },
        
        removePatternFromSong: (songId, patternId) => {
          set((state) => ({
            songs: state.songs.map((s) => {
              if (s.id !== songId) return s;
              return {
                ...s,
                patterns: s.patterns.filter((p) => p.id !== patternId),
                currentPatternIndex: Math.min(s.currentPatternIndex, s.patterns.length - 2),
                updatedAt: new Date().toISOString(),
              };
            }),
            automation: state.automation.map((a) => {
              if (a.songId !== songId) return a;
              return {
                ...a,
                patternAutomation: a.patternAutomation.filter(
                  (pa) => pa.patternId !== patternId
                ),
              };
            }),
          }));
        },
        
        reorderPatterns: (songId, oldIndex, newIndex) => {
          set((state) => ({
            songs: state.songs.map((s) => {
              if (s.id !== songId) return s;
              
              const newPatterns = [...s.patterns];
              const [removed] = newPatterns.splice(oldIndex, 1);
              newPatterns.splice(newIndex, 0, removed);
              
              return {
                ...s,
                patterns: newPatterns,
                currentPatternIndex: newIndex,
                updatedAt: new Date().toISOString(),
              };
            }),
          }));
        },
        
        updatePatternInSong: (songId, patternId, updates) => {
          set((state) => ({
            songs: state.songs.map((s) => {
              if (s.id !== songId) return s;
              return {
                ...s,
                patterns: s.patterns.map((p) =>
                  p.id === patternId ? { ...p, ...updates } : p
                ),
                updatedAt: new Date().toISOString(),
              };
            }),
          }));
        },
        
        // Loop management
        setLoopRange: (songId, loop) => {
          set((state) => ({
            songs: state.songs.map((s) =>
              s.id === songId ? { ...s, loop, updatedAt: new Date().toISOString() } : s
            ),
          }));
        },
        
        // Playback control
        playSong: (songId) => {
          set((state) => ({
            songs: state.songs.map((s) =>
              s.id === songId ? { ...s, isPlaying: true, currentPatternIndex: 0 } : s
            ),
            currentSongId: songId,
          }));
        },
        
        stopSong: (songId) => {
          set((state) => ({
            songs: state.songs.map((s) =>
              s.id === songId ? { ...s, isPlaying: false, currentPatternIndex: 0 } : s
            ),
          }));
        },
        
        setCurrentPatternIndex: (songId, index) => {
          set((state) => ({
            songs: state.songs.map((s) =>
              s.id === songId ? { ...s, currentPatternIndex: index } : s
            ),
          }));
        },
        
        nextPattern: (songId) => {
          set((state) => ({
            songs: state.songs.map((s) => {
              if (s.id !== songId) return s;
              
              // Check if we're at the end
              if (s.currentPatternIndex >= s.patterns.length - 1) {
                // Loop logic
                if (s.loop.enabled && s.currentPatternIndex >= s.loop.start && s.currentPatternIndex < s.loop.end) {
                  return { ...s, currentPatternIndex: s.loop.start };
                }
                // If loop disabled or not in loop range, stop
                return { ...s, isPlaying: false };
              }
              
              return { ...s, currentPatternIndex: s.currentPatternIndex + 1 };
            }),
          }));
        },
        
        previousPattern: (songId) => {
          set((state) => ({
            songs: state.songs.map((s) => {
              if (s.id !== songId) return s;
              
              const newIndex = Math.max(0, s.currentPatternIndex - 1);
              
              // If we're at the start of the loop range, go to the end
              if (s.loop.enabled && newIndex < s.loop.start && s.currentPatternIndex === s.loop.start) {
                return { ...s, currentPatternIndex: s.loop.end };
              }
              
              return { ...s, currentPatternIndex: newIndex };
            }),
          }));
        },
        
        // Recording
        startRecording: () => {
          set({ 
            isRecording: true, 
            recordingStartTime: Date.now() 
          });
        },
        
        stopRecording: () => {
          set({ 
            isRecording: false, 
            recordingStartTime: null 
          });
        },
        
        // Automation
        startAutomationRecording: (songId, controlIds) => {
          set({
            isRecordingAutomation: true,
            recordingStartTime: Date.now(),
            currentRecordingControls: controlIds,
            currentRecordingSongId: songId,
          });
        },
        
        stopAutomationRecording: (songId) => {
          set({
            isRecordingAutomation: false,
            recordingStartTime: null,
            currentRecordingControls: [],
            currentRecordingSongId: null,
          });
        },
        
        recordAutomation: (controlId, value) => {
          set((state) => {
            if (!state.isRecordingAutomation || !state.recordingStartTime) {
              return state;
            }
            
            const elapsed = Date.now() - state.recordingStartTime;
            const currentSongId = state.currentRecordingSongId;
            
            if (!currentSongId) return state;
            
            // Find or create automation for this song
            let songAutomation = state.automation.find(a => a.songId === currentSongId);
            
            if (!songAutomation) {
              songAutomation = {
                songId: currentSongId,
                globalTracks: [],
                patternAutomation: [],
              };
            }
            
            // Check if this is a global control or pattern-specific
            const isGlobalControl = ['master_volume', 'tempo'].includes(controlId);
            
            if (isGlobalControl) {
              // Add to global tracks
              let track = songAutomation.globalTracks.find(t => t.controlId === controlId);
              if (!track) {
                track = {
                  controlId,
                  points: [],
                  enabled: true,
                };
                songAutomation.globalTracks.push(track);
              }
              track.points.push({ timestamp: elapsed, value });
            } else {
              // For now, add to the first pattern's automation
              // In a full implementation, this would be tied to the current pattern
              if (songAutomation.patternAutomation.length === 0) {
                // Create a default pattern automation if none exists
                const currentSong = state.songs.find(s => s.id === currentSongId);
                if (currentSong && currentSong.patterns.length > 0) {
                  songAutomation.patternAutomation.push({
                    patternId: currentSong.patterns[0].id,
                    tracks: [],
                  });
                }
              }
              
              if (songAutomation.patternAutomation.length > 0) {
                const patternAutomation = songAutomation.patternAutomation[0];
                let track = patternAutomation.tracks.find(t => t.controlId === controlId);
                if (!track) {
                  track = {
                    controlId,
                    points: [],
                    enabled: true,
                  };
                  patternAutomation.tracks.push(track);
                }
                track.points.push({ timestamp: elapsed, value });
              }
            }
            
            // Update or add the song automation
            const updatedAutomation = state.automation.some(a => a.songId === currentSongId)
              ? state.automation.map(a => a.songId === currentSongId ? songAutomation : a)
              : [...state.automation, songAutomation];
            
            return {
              ...state,
              automation: updatedAutomation,
            };
          });
        },
        
        clearAutomation: (songId, controlId) => {
          set((state) => ({
            automation: state.automation.map((a) => {
              if (a.songId !== songId) return a;
              
              if (controlId) {
                // Clear specific control from all patterns and global
                const updatedPatternAutomation = a.patternAutomation.map((pa) => ({
                  ...pa,
                  tracks: pa.tracks.filter(t => t.controlId !== controlId),
                }));
                
                const updatedGlobalTracks = a.globalTracks.filter(
                  t => t.controlId !== controlId
                );
                
                return {
                  ...a,
                  patternAutomation: updatedPatternAutomation,
                  globalTracks: updatedGlobalTracks,
                };
              } else {
                // Clear all automation for this song
                return {
                  ...a,
                  patternAutomation: a.patternAutomation.map((pa) => ({
                    ...pa,
                    tracks: [],
                  })),
                  globalTracks: [],
                };
              }
            }),
          }));
        },
        
        getAutomationForPattern: (songId, patternId, controlId) => {
          const state = get();
          const songAutomation = state.automation.find(a => a.songId === songId);
          if (!songAutomation) return [];
          
          const patternAutomation = songAutomation.patternAutomation.find(
            pa => pa.patternId === patternId
          );
          if (!patternAutomation) return [];
          
          const track = patternAutomation.tracks.find(t => t.controlId === controlId);
          return track?.points ?? [];
        },
        
        getAutomationForSong: (songId, controlId) => {
          const state = get();
          const songAutomation = state.automation.find(a => a.songId === songId);
          if (!songAutomation) return [];
          
          // Check global tracks first
          const globalTrack = songAutomation.globalTracks.find(
            t => t.controlId === controlId
          );
          if (globalTrack) return globalTrack.points;
          
          // If not found in global, check pattern automation
          for (const pa of songAutomation.patternAutomation) {
            const track = pa.tracks.find(t => t.controlId === controlId);
            if (track) return track.points;
          }
          
          return [];
        },
        
        deleteAutomationPoint: (songId, patternId, controlId, timestamp) => {
          set((state) => ({
            automation: state.automation.map((a) => {
              if (a.songId !== songId) return a;
              
              const updatedPatternAutomation = a.patternAutomation.map((pa) => {
                if (pa.patternId !== patternId) return pa;
                
                return {
                  ...pa,
                  tracks: pa.tracks.map((t) => {
                    if (t.controlId !== controlId) return t;
                    return {
                      ...t,
                      points: t.points.filter(p => p.timestamp !== timestamp),
                    };
                  }),
                };
              });
              
              return {
                ...a,
                patternAutomation: updatedPatternAutomation,
              };
            }),
          }));
        },
        
        // Utility methods
        getSongById: (songId) => {
          const state = get();
          return state.songs.find((s) => s.id === songId);
        },
        
        getCurrentSong: () => {
          const state = get();
          return state.songs.find((s) => s.id === state.currentSongId);
        },
        
        getTotalMeasures: (songId) => {
          const song = get().songs.find((s) => s.id === songId);
          if (!song) return 0;
          return song.patterns.reduce((sum, p) => sum + p.length, 0);
        },
        
        canAddPattern: (songId) => {
          const song = get().songs.find((s) => s.id === songId);
          if (!song) return false;
          return song.patterns.length < MAX_PATTERNS;
        },
      }),
      {
        name: 'song-store',
        partialize: (state) => ({
          songs: state.songs,
          currentSongId: state.currentSongId,
          automation: state.automation,
        }),
      }
    ),
    { name: 'SongStore' }
  )
);

export default useSongStore;