import React from 'react';
import { useAudioStore } from '../../store/audioStore';
import Fader from '../ui/Fader';
import Knob from '../ui/Knob';
import Button from '../ui/Button';
import LED from '../ui/LED';
import Meter from '../ui/Meter';
import { SectionType } from '../../types/audio';

interface MixerSectionProps {}

const MixerSection: React.FC<MixerSectionProps> = () => {
  const { sectionParams, setSectionParam, masterSettings } = useAudioStore();
  const sections: SectionType[] = ['808', '909', '303_1', '303_2'];

  const handleMute = (section: SectionType) => {
    setSectionParam(section, 'mute', !sectionParams[section].mute);
  };

  const handleSolo = (section: SectionType) => {
    const newSoloState = !sectionParams[section].solo;
    setSectionParam(section, 'solo', newSoloState);
    
    if (newSoloState) {
      sections.filter(s => s !== section).forEach(s => {
        setSectionParam(s, 'mute', true);
      });
    }
  };

  return (
    <div className="mixer-section">
      <div className="mixer-title">Mixer</div>

      <div className="mixer-channels">
        {sections.map((section) => {
          const params = sectionParams[section];
          const sectionName = section === '808' ? 'TR-808' : 
                            section === '909' ? 'TR-909' : 
                            `TB-303 ${section === '303_1' ? '1' : '2'}`;

          return (
            <div key={section} className="mixer-channel">
              <div className="channel-header">
                <span className="channel-name">{sectionName}</span>
                <div className="channel-indicators">
                  <LED active={!params.mute} color="green" size="small" label="On" />
                  <LED active={params.solo} color="yellow" size="small" label="Solo" />
                </div>
              </div>

              <div className="channel-controls">
                <Fader
                  value={params.level}
                  min={0}
                  max={100}
                  onChange={(v) => setSectionParam(section, 'level', v)}
                  label="Level"
                  orientation="vertical"
                />
                <Fader
                  value={params.pan}
                  min={-50}
                  max={50}
                  onChange={(v) => setSectionParam(section, 'pan', v)}
                  label="Pan"
                  orientation="vertical"
                />
                <Fader
                  value={params.delaySend}
                  min={0}
                  max={100}
                  onChange={(v) => setSectionParam(section, 'delaySend', v)}
                  label="Delay"
                  orientation="vertical"
                />
              </div>

              <div className="channel-buttons">
                <Button
                  variant={params.mute ? 'secondary' : 'primary'}
                  size="small"
                  onClick={() => handleMute(section)}
                >
                  Mute
                </Button>
                <Button
                  variant={params.solo ? 'primary' : 'secondary'}
                  size="small"
                  onClick={() => handleSolo(section)}
                >
                  Solo
                </Button>
              </div>

              <Meter value={params.level / 100} min={0} max={1} orientation="horizontal" />
            </div>
          );
        })}
      </div>

      <div className="mixer-master">
        <div className="master-label">Master</div>
        <Fader
          value={masterSettings.volume}
          min={0}
          max={100}
          onChange={(v) => {}}
          label="Master"
          orientation="vertical"
        />
        <Meter value={masterSettings.volume / 100} min={0} max={1} orientation="horizontal" />
      </div>
    </div>
  );
};

export default React.memo(MixerSection);