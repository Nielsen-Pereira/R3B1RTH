import React, { useCallback, useEffect } from 'react';
import { useSongStore } from '../stores/songStore';
import { SongPattern } from '../types/songTypes';
import './SongMode.css';

interface SongModeProps {
  onClose: () => void;
}

const SongMode: React.FC<SongModeProps> = ({ onClose }) => {
  const {
    songs,
    currentSongId,
    createSong,
    deleteSong,
    setCurrentSong,
    renameSong,
    addPatternToSong,
    removePatternFromSong,
    reorderPatterns,
    setLoopRange,
    playSong,
    stopSong,
    nextPattern,
    previousPattern,
    getCurrentSong,
    getTotalMeasures,
    canAddPattern,
    isRecording,
    startRecording,
    stopRecording,
  } = useSongStore();

  const currentSong = getCurrentSong();

  const handleAddPattern = useCallback((pattern: SongPattern) => {
    if (!currentSongId) return;
    if (!canAddPattern(currentSongId)) {
      alert('Maximum patterns reached (96)');
      return;
    }
    addPatternToSong(currentSongId, pattern);
  }, [currentSongId, canAddPattern, addPatternToSong]);

  useEffect(() => {
    if (!currentSong?.isPlaying) return;
    const interval = setInterval(() => {
      nextPattern(currentSongId);
    }, 1000);
    return () => clearInterval(interval);
  }, [currentSong?.isPlaying, currentSongId, nextPattern]);

  const handleDragStart = (e: React.DragEvent, index: number) => {
    e.dataTransfer.setData('text/plain', index.toString());
  };

  const handleDrop = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    const sourceIndex = parseInt(e.dataTransfer.getData('text/plain'));
    if (!isNaN(sourceIndex) && sourceIndex !== targetIndex && currentSongId) {
      reorderPatterns(currentSongId, sourceIndex, targetIndex);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleLoopChange = (start: number, end: number, enabled: boolean) => {
    if (!currentSongId) return;
    setLoopRange(currentSongId, { start, end, enabled });
  };

  const handleCreateSong = () => {
    const newSong = createSong(`Song ${songs.length + 1}`);
    setCurrentSong(newSong.id);
  };

  const handleDeleteSong = () => {
    if (!currentSongId) return;
    if (window.confirm('Are you sure you want to delete this song?')) {
      deleteSong(currentSongId);
      setCurrentSong(null);
    }
  };

  const handleRenameSong = () => {
    if (!currentSongId) return;
    const newName = window.prompt('Enter new song name:', currentSong?.name);
    if (newName) {
      renameSong(currentSongId, newName);
    }
  };

  const handleToggleRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  if (!currentSongId) {
    return (
      <div className="song-mode-container">
        <div className="song-mode-header">
          <h2>Song Mode</h2>
          <button onClick={onClose} className="close-button">×</button>
        </div>
        <div className="song-mode-empty">
          <p>No song selected. Create a new song to get started.</p>
          <button onClick={handleCreateSong} className="create-song-button">
            Create New Song
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="song-mode-container">
      <div className="song-mode-header">
        <h2>Song Mode: {currentSong?.name}</h2>
        <div className="song-mode-actions">
          <button onClick={handleRenameSong} title="Rename Song">
            ✏️
          </button>
          <button onClick={handleDeleteSong} title="Delete Song">
            🗑️
          </button>
          <button onClick={onClose} className="close-button">×</button>
        </div>
      </div>

      <div className="song-mode-controls">
        <div className="playback-controls">
          <button onClick={() => currentSongId && playSong(currentSongId)} disabled={!currentSong?.patterns.length} title="Play">
            ▶️
          </button>
          <button onClick={() => currentSongId && stopSong(currentSongId)} disabled={!currentSong?.isPlaying} title="Stop">
            ⏹️
          </button>
          <button onClick={() => currentSongId && previousPattern(currentSongId)} disabled={!currentSong?.isPlaying} title="Previous Pattern">
            ⏮️
          </button>
          <button onClick={() => currentSongId && nextPattern(currentSongId)} disabled={!currentSong?.isPlaying} title="Next Pattern">
            ⏭️
          </button>
          <button onClick={handleToggleRecording} className={isRecording ? 'recording-active' : ''} title={isRecording ? 'Stop Recording' : 'Start Recording'}>
            {isRecording ? '🔴 REC' : '🎤 Rec'}
          </button>
        </div>

        <div className="song-info">
          <span>Patterns: {currentSong?.patterns.length || 0}/{96}</span>
          <span>Total Measures: {getTotalMeasures(currentSongId)}</span>
          <span>BPM: {currentSong?.bpm || 120}</span>
        </div>
      </div>

      <div className="loop-controls">
        <label>
          <input
            type="checkbox"
            checked={currentSong?.loop.enabled || false}
            onChange={(e) => handleLoopChange(currentSong?.loop.start || 0, currentSong?.loop.end || 0, e.target.checked)}
          />
          Enable Loop
        </label>
        {currentSong?.loop.enabled && (
          <>
            <label>
              Start:
              <input
                type="number"
                min="0"
                max={currentSong.patterns.length - 1 || 0}
                value={currentSong.loop.start || 0}
                onChange={(e) => handleLoopChange(parseInt(e.target.value) || 0, currentSong.loop.end || 0, true)}
              />
            </label>
            <label>
              End:
              <input
                type="number"
                min="0"
                max={currentSong.patterns.length - 1 || 0}
                value={currentSong.loop.end || 0}
                onChange={(e) => handleLoopChange(currentSong.loop.start || 0, parseInt(e.target.value) || 0, true)}
              />
            </label>
          </>
        )}
      </div>

      <div className="pattern-list">
        <h3>Song Pattern Sequence</h3>
        {currentSong?.patterns.length === 0 ? (
          <p className="empty-patterns">No patterns added. Add patterns from Pattern Mode.</p>
        ) : (
          <ul>
            {currentSong?.patterns.map((pattern, index) => {
              const classNames = [
                index === currentSong.currentPatternIndex ? 'current-pattern' : '',
                currentSong.loop.enabled && index === currentSong.loop.start ? 'loop-start' : '',
                currentSong.loop.enabled && index === currentSong.loop.end ? 'loop-end' : '',
              ].filter(Boolean).join(' ');
              
              return (
                <li
                  key={pattern.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, index)}
                  onDrop={(e) => handleDrop(e, index)}
                  onDragOver={handleDragOver}
                  className={classNames}
                >
                  <span className="pattern-index">{index + 1}.</span>
                  <span className="pattern-info">
                    {pattern.section} - Pattern {String.fromCharCode(65 + Math.floor(pattern.patternIndex / 8))}
                    {pattern.patternIndex % 8 + 1}
                  </span>
                  <span className="pattern-length">{pattern.length} steps</span>
                  <button onClick={() => currentSongId && removePatternFromSong(currentSongId, pattern.id)} className="remove-pattern" title="Remove Pattern">
                    ×
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <div className="song-mode-footer">
        <p>Drag and drop patterns to reorder them.</p>
        <p>Max patterns: 96 | Max measures: 896</p>
      </div>
    </div>
  );
};

export default SongMode;
