/**
 * Serialization Utilities
 * Handles serialization and deserialization of project data
 */

export interface SerializablePattern {
  id: string;
  bank: number;
  index: number;
  length: number;
  name: string;
  steps: SerializableStep[];
}

export interface SerializableStep {
  instrument: string | null;
  accent: boolean;
  flam: boolean;
  note?: string | null;
  notePause?: 'note' | 'pause' | 'rest';
  down?: boolean;
  up?: boolean;
  slide?: boolean;
}

export interface SerializableSong {
  id: string;
  name: string;
  created: string;
  modified: string;
  tempo: number;
  shuffle: number;
  mode: 'pattern' | 'song';
  currentPattern: Record<string, number>;
  tracks: SerializableSongTrack[];
  automation: any[];
  loopStart: number | null;
  loopEnd: number | null;
}

export interface SerializableSongTrack {
  section: string;
  events: SerializableTrackEvent[];
}

export interface SerializableTrackEvent {
  time: number;
  patternBank: number;
  patternIndex: number;
}

/**
 * Serializes a pattern to a plain object
 */
export function serializePattern(pattern: any): SerializablePattern {
  return {
    id: pattern.id,
    bank: pattern.bank,
    index: pattern.index,
    length: pattern.length,
    name: pattern.name,
    steps: pattern.steps.map((step: any) => {
      const serialized: SerializableStep = {
        instrument: step.instrument,
        accent: step.accent || false,
        flam: step.flam || false,
      };
      
      if (step.note !== undefined) serialized.note = step.note;
      if (step.notePause !== undefined) serialized.notePause = step.notePause;
      if (step.down !== undefined) serialized.down = step.down;
      if (step.up !== undefined) serialized.up = step.up;
      if (step.slide !== undefined) serialized.slide = step.slide;
      
      return serialized;
    }),
  };
}

/**
 * Deserializes a pattern from a plain object
 */
export function deserializePattern(serialized: SerializablePattern): any {
  return {
    id: serialized.id,
    bank: serialized.bank,
    index: serialized.index,
    length: serialized.length,
    name: serialized.name,
    steps: serialized.steps.map((step: SerializableStep) => {
      const deserialized: any = {
        instrument: step.instrument,
        accent: step.accent || false,
        flam: step.flam || false,
      };
      
      if (step.note !== undefined) deserialized.note = step.note;
      if (step.notePause !== undefined) deserialized.notePause = step.notePause;
      if (step.down !== undefined) deserialized.down = step.down;
      if (step.up !== undefined) deserialized.up = step.up;
      if (step.slide !== undefined) deserialized.slide = step.slide;
      
      return deserialized;
    }),
  };
}

/**
 * Serializes a song to a plain object
 */
export function serializeSong(song: any): SerializableSong {
  if (!song) {
    return {
      id: '',
      name: 'New Song',
      created: new Date().toISOString(),
      modified: new Date().toISOString(),
      tempo: 120,
      shuffle: 0,
      mode: 'pattern',
      currentPattern: { '808': 0, '909': 0, '303_1': 0, '303_2': 0 },
      tracks: [],
      automation: [],
      loopStart: null,
      loopEnd: null,
    };
  }
  
  return {
    id: song.id,
    name: song.name,
    created: song.created,
    modified: song.modified,
    tempo: song.tempo,
    shuffle: song.shuffle,
    mode: song.mode,
    currentPattern: song.currentPattern,
    tracks: song.tracks.map((track: any) => ({
      section: track.section,
      events: track.events.map((event: any) => ({
        time: event.time,
        patternBank: event.patternBank,
        patternIndex: event.patternIndex,
      })),
    })),
    automation: song.automation || [],
    loopStart: song.loopStart,
    loopEnd: song.loopEnd,
  };
}

/**
 * Deserializes a song from a plain object
 */
export function deserializeSong(serialized: SerializableSong): any {
  if (!serialized) return null;
  
  return {
    id: serialized.id,
    name: serialized.name,
    created: serialized.created,
    modified: serialized.modified,
    tempo: serialized.tempo,
    shuffle: serialized.shuffle,
    mode: serialized.mode,
    currentPattern: serialized.currentPattern,
    tracks: serialized.tracks.map((track: SerializableSongTrack) => ({
      section: track.section,
      events: track.events.map((event: SerializableTrackEvent) => ({
        time: event.time,
        patternBank: event.patternBank,
        patternIndex: event.patternIndex,
      })),
    })),
    automation: serialized.automation || [],
    loopStart: serialized.loopStart,
    loopEnd: serialized.loopEnd,
  };
}

/**
 * Serializes all patterns for a section
 */
export function serializePatterns(patterns: any[]): SerializablePattern[] {
  return patterns.map(serializePattern);
}

/**
 * Deserializes all patterns for a section
 */
export function deserializePatterns(serialized: SerializablePattern[]): any[] {
  return serialized.map(deserializePattern);
}

export default {
  serializePattern,
  deserializePattern,
  serializeSong,
  deserializeSong,
  serializePatterns,
  deserializePatterns
};