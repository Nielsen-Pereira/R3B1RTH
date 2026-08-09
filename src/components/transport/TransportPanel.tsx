import React from 'react';
import { useSequencerStore } from '../../store/sequencerStore';
import { useAudioStore } from '../../store/audioStore';
import Button from '../ui/Button';
import Knob from '../ui/Knob';
import LED from '../ui/LED';
import Meter from '../ui/Meter';

interface TransportPanelProps {}

const TransportPanel: React.FC<TransportPanelProps> = () => {
  const {
    isPlaying,
    isRecording,
    tempo,
    shuffle,
    currentStep,
    currentMeasure,
    mode,
    play,
    stop,
    togglePlay,
    toggleRecord,
    setTempo,
    setShuffle,
    setMode,
  } = useSequencerStore();

  const { masterSettings, setMasterSetting } = useAudioStore();

  const bpm = tempo;
  const shufflePercent = shuffle;

  const handlePlay = () => {
    if (isPlaying) {
      stop();
    } else {
      play();
    }
  };

  const handleRecord = () => {
    toggleRecord();
  };

  const handleModeToggle = () => {
    setMode(mode === 'pattern' ? 'song' : 'pattern');
  };

  return (
    <div className="transport-panel">
      <div className="transport-controls">
        <div className="play-controls">
          <Button
            variant={isPlaying ? 'primary' : 'secondary'}
            size="large"
            onClick={handlePlay}
          >
            {isPlaying ? 'Stop' : 'Play'}
          </Button>
          <Button
            variant={isRecording ? 'danger' : 'secondary'}
            size="large"
            onClick={handleRecord}
          >
            Rec
          </Button>
        </div>

        <div className="transport-indicators">
          <LED active={isPlaying} color="green" size="medium" label="Play" />
          <LED active={isRecording} color="red" size="medium" label="Rec" />
          <LED active={mode === 'song'} color="blue" size="medium" label="Song" />
        </div>

        <div className="mode-toggle">
          <Button
            variant={mode === 'pattern' ? 'primary' : 'secondary'}
            size="small"
            onClick={handleModeToggle}
          >
            {mode === 'pattern' ? 'Pattern' : 'Song'}
          </Button>
        </div>
      </div>

      <div className="tempo-controls">
        <Knob
          value={bpm}
          min={40}
          max={300}
          onChange={(v) => setTempo(Math.round(v))}
          label="BPM"
          size="large"
        />
        <div className="bpm-display">{Math.round(bpm)}</div>
      </div>

      <div className="shuffle-control">
        <Knob
          value={shufflePercent}
          min={0}
          max={100}
          onChange={(v) => setShuffle(v)}
          label="Shuffle"
          size="medium"
        />
      </div>

      <div className="position-display">
        <div className="step-indicator">
          Step: {currentStep + 1}
        </div>
        <div className="measure-indicator">
          Measure: {currentMeasure + 1}
        </div>
      </div>

      <div className="master-controls">
        <div className="master-volume">
          <Knob
            value={masterSettings.volume}
            min={0}
            max={100}
            onChange={(v) => setMasterSetting('volume', v)}
            label="Master"
            size="medium"
          />
        </div>
        <Meter value={masterSettings.volume / 100} min={0} max={1} orientation="horizontal" label="Master" />
      </div>
    </div>
  );
};

export default React.memo(TransportPanel);