import React from 'react';
import { useAudioStore } from '../../store/audioStore';
import { useSequencerStore } from '../../store/sequencerStore';
import { useUIStore } from '../../store/uiStore';
import Knob from '../ui/Knob';
import Fader from '../ui/Fader';
import Button from '../ui/Button';
import LED from '../ui/LED';
import StepButton from '../ui/StepButton';
import { SectionType, TR909Instrument } from '../../types/audio';

interface TR909SectionProps {
  section: SectionType;
}

const TR909Section: React.FC<TR909SectionProps> = ({ section }) => {
  const { tr909Params, setTR909Param, sectionParams, setSectionParam } = useAudioStore();
  const { patterns, currentPattern, patternLength, setStep, isPlaying } = useSequencerStore();
  const { theme } = useUIStore();

  const instruments: TR909Instrument[] = ['BD', 'SD', 'LT', 'MT', 'HT', 'RS', 'CP', 'CH', 'OH', 'CC', 'RC'];
  const currentPatternIndex = currentPattern[section];
  const currentPatternData = patterns[section][currentPatternIndex];
  const length = patternLength[section];

  const sectionTitle = 'TR-909';
  const params = tr909Params;

  const handleStepClick = (stepIndex: number) => {
    if (isPlaying) return;
    const currentStep = currentPatternData.steps[stepIndex];
    const instrument = currentStep.instrument === null ? 'BD' : null;
    setStep(section, stepIndex, { instrument, accent: false, flam: false });
  };

  const handleStepRightClick = (stepIndex: number, e: React.MouseEvent) => {
    e.preventDefault();
    if (isPlaying) return;
    const currentStep = currentPatternData.steps[stepIndex];
    setStep(section, stepIndex, { accent: !currentStep.accent });
  };

  return (
    <div className={`drum-machine-section ${section}`}>
      <div className="section-header">
        <span className="section-title">{sectionTitle}</span>
        <LED active={sectionParams[section].mute ? false : true} color="green" size="small" />
      </div>

      <div className="section-controls">
        <div className="instrument-controls">
          {instruments.map((instrument) => (
            <div key={instrument} className="instrument-control">
              <Button
                variant={params[instrument]?.level > 0 ? 'primary' : 'secondary'}
                size="small"
                active={params[instrument]?.level > 50}
                onClick={() => setTR909Param(instrument, 'level', params[instrument]?.level > 0 ? 0 : 100)}
              >
                {instrument}
              </Button>
              {'tune' in params[instrument] && (
                <Knob
                  value={params[instrument].tune}
                  min={0}
                  max={100}
                  onChange={(v) => setTR909Param(instrument, 'tune', v)}
                  size="small"
                  label="T"
                />
              )}
              {'decay' in params[instrument] && (
                <Knob
                  value={params[instrument].decay}
                  min={0}
                  max={100}
                  onChange={(v) => setTR909Param(instrument, 'decay', v)}
                  size="small"
                  label="D"
                />
              )}
              {'attack' in params[instrument] && (
                <Knob
                  value={params[instrument].attack}
                  min={0}
                  max={100}
                  onChange={(v) => setTR909Param(instrument, 'attack', v)}
                  size="small"
                  label="A"
                />
              )}
              {instrument === 'SD' && 'tone' in params[instrument] && (
                <Knob
                  value={params[instrument].tone}
                  min={0}
                  max={100}
                  onChange={(v) => setTR909Param(instrument, 'tone', v)}
                  size="small"
                  label="Tone"
                />
              )}
              {instrument === 'SD' && 'snap' in params[instrument] && (
                <Knob
                  value={params[instrument].snap}
                  min={0}
                  max={100}
                  onChange={(v) => setTR909Param(instrument, 'snap', v)}
                  size="small"
                  label="Snap"
                />
              )}
            </div>
          ))}
          <div className="flam-control">
            <Knob
              value={params.flam}
              min={0}
              max={100}
              onChange={(v) => setTR909Param('flam', v)}
              label="Flam"
              size="small"
            />
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
          {Array.from({ length }).map((_, stepIndex) => (
            <StepButton
              key={stepIndex}
              active={!!currentPatternData.steps[stepIndex].instrument}
              accent={currentPatternData.steps[stepIndex].accent}
              onClick={() => handleStepClick(stepIndex)}
              onRightClick={(e) => handleStepRightClick(stepIndex, e)}
              size="small"
            />
          ))}
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

export default React.memo(TR909Section);