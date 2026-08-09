import React, { useState } from 'react';
import { useAudioStore } from '../../store/audioStore';
import { useSequencerStore } from '../../store/sequencerStore';
import { useUIStore } from '../../store/uiStore';
import Knob from '../ui/Knob';
import Fader from '../ui/Fader';
import Button from '../ui/Button';
import LED from '../ui/LED';
import StepButton from '../ui/StepButton';
import { SectionType, Note } from '../../types/audio';

interface TB303SectionProps {
  section: SectionType;
}

const TB303Section: React.FC<TB303SectionProps> = ({ section }) => {
  const { tb303_1Params, tb303_2Params, setTB303_1Param, setTB303_2Param, sectionParams, setSectionParam } = useAudioStore();
  const { patterns, currentPattern, patternLength, setStep, isPlaying } = useSequencerStore();
  const { theme } = useUIStore();

  const [selectedStep, setSelectedStep] = useState<number | null>(null);

  const isTB303_1 = section === '303_1';
  const params = isTB303_1 ? tb303_1Params : tb303_2Params;
  const setParam = isTB303_1 ? setTB303_1Param : setTB303_2Param;

  const currentPatternIndex = currentPattern[section];
  const currentPatternData = patterns[section][currentPatternIndex];
  const length = patternLength[section];

  const sectionTitle = `TB-303 ${isTB303_1 ? '1' : '2'}`;

  const notes: Note[] = [
    'C1', 'C#1', 'D1', 'D#1', 'E1', 'F1', 'F#1', 'G1', 'G#1', 'A1', 'A#1', 'B1',
    'C2', 'C#2', 'D2', 'D#2', 'E2', 'F2', 'F#2', 'G2', 'G#2', 'A2', 'A#2', 'B2',
    'C3', 'C#3', 'D3', 'D#3', 'E3', 'F3', 'F#3', 'G3', 'G#3', 'A3', 'A#3', 'B3',
    'C4', 'C#4', 'D4', 'D#4', 'E4', 'F4',
  ];

  const handleStepClick = (stepIndex: number) => {
    if (isPlaying) return;
    setSelectedStep(stepIndex);
  };

  const handleStepRightClick = (stepIndex: number, e: React.MouseEvent) => {
    e.preventDefault();
    if (isPlaying) return;
    const currentStep = currentPatternData.steps[stepIndex];
    setStep(section, stepIndex, { accent: !currentStep.accent });
  };

  const getStepDisplay = (stepIndex: number) => {
    const step = currentPatternData.steps[stepIndex];
    if (!step.note) return null;
    return step.note;
  };

  return (
    <div className={`synth-section ${section}`}>
      <div className="section-header">
        <span className="section-title">{sectionTitle}</span>
        <LED active={sectionParams[section].mute ? false : true} color="green" size="small" />
      </div>

      <div className="section-controls">
        <div className="synth-controls">
          <div className="waveform-control">
            <Button
              variant={params.waveform === 'sawtooth' ? 'primary' : 'secondary'}
              size="small"
              onClick={() => setParam('waveform', params.waveform === 'sawtooth' ? 'square' : 'sawtooth')}
            >
              {params.waveform.toUpperCase()}
            </Button>
          </div>

          <div className="param-row">
            <div className="param-group">
              <Knob
                value={params.tune}
                min={-24}
                max={24}
                onChange={(v) => setParam('tune', v)}
                label="Tune"
                size="small"
              />
              <Knob
                value={params.cutoff}
                min={0}
                max={100}
                onChange={(v) => setParam('cutoff', v)}
                label="Cutoff"
                size="medium"
              />
              <Knob
                value={params.resonance}
                min={0}
                max={100}
                onChange={(v) => setParam('resonance', v)}
                label="Resonance"
                size="small"
              />
            </div>

            <div className="param-group">
              <Knob
                value={params.envMod}
                min={0}
                max={100}
                onChange={(v) => setParam('envMod', v)}
                label="Env Mod"
                size="medium"
              />
              <Knob
                value={params.decay}
                min={0}
                max={100}
                onChange={(v) => setParam('decay', v)}
                label="Decay"
                size="small"
              />
              <Knob
                value={params.accent}
                min={0}
                max={100}
                onChange={(v) => setParam('accent', v)}
                label="Accent"
                size="small"
              />
            </div>
          </div>

          <div className="vintage-control">
            <Button
              variant={params.vintage ? 'primary' : 'secondary'}
              size="small"
              onClick={() => setParam('vintage', !params.vintage)}
            >
              Vintage
            </Button>
          </div>
        </div>

        <div className="section-mixer">
          <Fader
            value={sectionParams[section].level}
            min={0}
            max={100}
            onChange={(v) => setSectionParam(section, 'level', v)}
            label="Level"
            orientation="vertical"
          />
          <Fader
            value={sectionParams[section].pan}
            min={-50}
            max={50}
            onChange={(v) => setSectionParam(section, 'pan', v)}
            label="Pan"
            orientation="vertical"
          />
        </div>
      </div>

      <div className="section-sequencer">
        <div className="step-buttons">
          {Array.from({ length }).map((_, stepIndex) => {
            const step = currentPatternData.steps[stepIndex];
            const hasNote = !!step.note;
            const noteDisplay = getStepDisplay(stepIndex);
            
            return (
              <div key={stepIndex} className="tb303-step">
                <StepButton
                  active={hasNote}
                  accent={step.accent}
                  onClick={() => handleStepClick(stepIndex)}
                  onRightClick={(e) => handleStepRightClick(stepIndex, e)}
                  size="small"
                >
                  {noteDisplay ? noteDisplay.replace(/(\w)(\d)/, '$1$2') : ''}
                </StepButton>
              </div>
            );
          })}
        </div>
        <div className="sequencer-controls">
          <Button size="small" onClick={() => {}}>Clear</Button>
          <Button size="small" onClick={() => {}}>Copy</Button>
          <Button size="small" onClick={() => {}}>Paste</Button>
        </div>
      </div>
    </div>
  );
};

export default React.memo(TB303Section);