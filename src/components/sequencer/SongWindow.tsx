import React from 'react';
import { useSequencerStore } from '../../store/sequencerStore';
import Button from '../ui/Button';
import { SectionType } from '../../types/audio';

interface SongWindowProps {}

const SongWindow: React.FC<SongWindowProps> = () => {
  const {
    song,
    mode,
    patterns,
    currentPattern,
    setSelectedPattern,
    createSong,
    saveSong,
    loadSong,
    setMode,
  } = useSequencerStore();

  const sections: SectionType[] = ['808', '909', '303_1', '303_2'];

  const handlePatternSelect = (section: SectionType, bank: number, index: number) => {
    setSelectedPattern(section, bank, index);
  };

  const getPatternName = (section: SectionType, bank: number, index: number) => {
    const pattern = patterns[section][bank * 8 + index];
    return pattern?.name || `Pattern ${bank * 8 + index + 1}`;
  };

  return (
    <div className="song-window">
      <div className="song-header">
        <div className="song-title">
          {song ? song.name : mode === 'song' ? 'New Song' : 'Pattern Mode'}
        </div>
        <div className="song-controls">
          <Button size="small" onClick={() => setMode('pattern')}>Pattern</Button>
          <Button size="small" onClick={() => setMode('song')}>Song</Button>
          <Button size="small" onClick={createSong}>New Song</Button>
          <Button size="small" onClick={saveSong} disabled={!song}>Save</Button>
        </div>
      </div>

      {mode === 'pattern' ? (
        <div className="pattern-mode">
          <div className="pattern-banks">
            {sections.map((section) => (
              <div key={section} className="pattern-bank">
                <div className="bank-header">{section.toUpperCase()}</div>
                <div className="bank-grid">
                  {Array.from({ length: 4 }).map((_, bank) => (
                    <div key={bank} className="pattern-row">
                      {Array.from({ length: 8 }).map((_, index) => {
                        const patternIndex = bank * 8 + index;
                        const isSelected = currentPattern[section] === patternIndex;
                        return (
                          <Button
                            key={index}
                            variant={isSelected ? 'primary' : 'secondary'}
                            size="small"
                            onClick={() => handlePatternSelect(section, bank, index)}
                          >
                            {patternIndex + 1}
                          </Button>
                        );
                      })}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="song-mode">
          <div className="song-timeline">
            <div className="timeline-header">
              <div className="timeline-marker">Measure</div>
              {Array.from({ length: 16 }).map((_, i) => (
                <div key={i} className="timeline-marker">{i + 1}</div>
              ))}
            </div>
            <div className="song-tracks">
              {sections.map((section) => (
                <div key={section} className="song-track">
                  <div className="track-header">{section.toUpperCase()}</div>
                  <div className="track-events">
                    {song?.tracks.find((t: any) => t.section === section)?.events.map((event: any, idx: number) => (
                      <div
                        key={idx}
                        className="track-event"
                        style={{ left: `${event.time * 100}%` }}
                      >
                        {event.patternBank * 8 + event.patternIndex + 1}
                      </div>
                    ))}
                  </div>
                  <div className="track-controls">
                    {Array.from({ length: 32 }).map((_, patternIndex) => (
                      <Button
                        key={patternIndex}
                        size="small"
                        onClick={() => {}}
                      >
                        {patternIndex + 1}
                      </Button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="song-info">
        {song && (
          <div className="song-meta">
            <div>Tempo: {song.tempo} BPM</div>
            <div>Shuffle: {song.shuffle}%</div>
            <div>Mode: {song.mode}</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default React.memo(SongWindow);