import React from 'react';
import { useAudioStore } from '../../store/audioStore';
import Knob from '../ui/Knob';
import Button from '../ui/Button';
import LED from '../ui/LED';
import { SectionType } from '../../types/audio';

interface EffectsSectionProps {}

const EffectsSection: React.FC<EffectsSectionProps> = () => {
  const {
    pcfSettings,
    delaySettings,
    distortionSettings,
    compressorSettings,
    setPCFSetting,
    setDelaySetting,
    setDistortionSetting,
    setCompressorSetting,
  } = useAudioStore();

  const sections: SectionType[] = ['808', '909', '303_1', '303_2'];

  return (
    <div className="effects-section">
      <div className="effects-title">Effects</div>

      <div className="effect-panels">
        <div className="effect-panel">
          <div className="effect-header">
            <span>PCF</span>
            <LED active={pcfSettings.enabled} color="green" size="small" />
          </div>
          <div className="effect-controls">
            <Button
              variant={pcfSettings.enabled ? 'primary' : 'secondary'}
              size="small"
              onClick={() => setPCFSetting('enabled', !pcfSettings.enabled)}
            >
              Enable
            </Button>
            <Knob
              value={pcfSettings.pattern}
              min={0}
              max={31}
              onChange={(v) => setPCFSetting('pattern', Math.round(v))}
              label="Pattern"
              size="medium"
            />
          </div>
        </div>

        <div className="effect-panel">
          <div className="effect-header">
            <span>Delay</span>
            <LED active={delaySettings.enabled} color="green" size="small" />
          </div>
          <div className="effect-controls">
            <Button
              variant={delaySettings.enabled ? 'primary' : 'secondary'}
              size="small"
              onClick={() => setDelaySetting('enabled', !delaySettings.enabled)}
            >
              Enable
            </Button>
            <Knob
              value={delaySettings.step}
              min={1}
              max={16}
              onChange={(v) => setDelaySetting('step', Math.round(v))}
              label="Step"
              size="small"
            />
            <Knob
              value={delaySettings.feedback}
              min={0}
              max={100}
              onChange={(v) => setDelaySetting('feedback', v)}
              label="Feedback"
              size="small"
            />
            <Button
              variant={delaySettings.triplet ? 'primary' : 'secondary'}
              size="small"
              onClick={() => setDelaySetting('triplet', !delaySettings.triplet)}
            >
              Triplet
            </Button>
          </div>
        </div>

        <div className="effect-panel">
          <div className="effect-header">
            <span>Distortion</span>
            <LED active={distortionSettings.enabled} color="green" size="small" />
          </div>
          <div className="effect-controls">
            <Button
              variant={distortionSettings.enabled ? 'primary' : 'secondary'}
              size="small"
              onClick={() => setDistortionSetting('enabled', !distortionSettings.enabled)}
            >
              Enable
            </Button>
            <Knob
              value={distortionSettings.amount}
              min={0}
              max={100}
              onChange={(v) => setDistortionSetting('amount', v)}
              label="Amount"
              size="medium"
            />
          </div>
        </div>

        <div className="effect-panel compressor-panel">
          <div className="effect-header">
            <span>Compressor</span>
          </div>
          <div className="compressor-sections">
            {['808', '909', '303_1', '303_2', 'master'].map((target) => {
              const targetKey = target as SectionType | 'master';
              const comp = compressorSettings[targetKey];
              return (
                <div key={target} className="compressor-section">
                  <div className="compressor-label">{target === 'master' ? 'Master' : target.toUpperCase()}</div>
                  <LED active={comp.enabled} color="green" size="small" />
                  <Button
                    variant={comp.enabled ? 'primary' : 'secondary'}
                    size="small"
                    onClick={() => setCompressorSetting(targetKey, 'enabled', !comp.enabled)}
                  >
                    On
                  </Button>
                  <Knob
                    value={comp.threshold}
                    min={-48}
                    max={0}
                    onChange={(v) => setCompressorSetting(targetKey, 'threshold', v)}
                    label="Thr"
                    size="small"
                  />
                  <Knob
                    value={comp.ratio}
                    min={1}
                    max={20}
                    onChange={(v) => setCompressorSetting(targetKey, 'ratio', v)}
                    label="Ratio"
                    size="small"
                  />
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default React.memo(EffectsSection);