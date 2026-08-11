/**
 * SongMode Component - Batch 1 Development
 * R3B-90 to R3B-93: Song Mode Implementation
 * 
 * React component for Song Mode functionality
 */

import React from 'react';
import { useSongStore, getCurrentSong, isRecording, isPlaying } from '../stores/songStore';

export const SongMode: React.FC = () => {
  const {
    songs,
    currentSongId,
    addSong,
    deleteSong,
    setCurrentSong,
    startRecording,
    stopRecording,
    startPlayback,
    stopPlayback,
  } = useSongStore();

  const currentSong = getCurrentSong({ songs, currentSongId });
  const recording = isRecording({ songs, currentSongId });
  const playing = isPlaying({ songs, currentSongId });

  const handleAddSong = () => {
    addSong({
      name: 'New Song',
      tempo: 120,
      patterns: [],
      isRecording: false,
      isPlaying: false,
      currentPosition: 0,
    });
  };

  const handleDeleteSong = () => {
    if (currentSong) {
      deleteSong(currentSong.id);
    }
  };

  const handleRecord = () => {
    if (recording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  const handlePlay = () => {
    if (playing) {
      stopPlayback();
    } else {
      startPlayback();
    }
  };

  return (
    <div className="song-mode">
      <h2>Song Mode</h2>
      
      <div className="song-controls">
        <button onClick={handleAddSong} disabled={songs.length >= 10}>
          Add Song
        </button>
        <button onClick={handleDeleteSong} disabled={songs.length <= 1}>
          Delete Song
        </button>
      </div>

      {currentSong && (
        <div className="current-song">
          <h3>{currentSong.name}</h3>
          <p>Tempo: {currentSong.tempo} BPM</p>
          <p>Patterns: {currentSong.patterns.length}</p>
          
          <div className="transport-controls">
            <button onClick={handleRecord}>
              {recording ? 'Stop Recording' : 'Start Recording'}
            </button>
            <button onClick={handlePlay}>
              {playing ? 'Stop Playback' : 'Start Playback'}
            </button>
          </div>

          {recording && (
            <div className="recording-indicator">
              RECORDING
            </div>
          )}
        </div>
      )}

      <div className="song-list">
        <h4>Songs</h4>
        <ul>
          {songs.map((song) => (
            <li
              key={song.id}
              onClick={() => setCurrentSong(song.id)}
              className={currentSongId === song.id ? 'active' : ''}
            >
              {song.name}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default SongMode;
