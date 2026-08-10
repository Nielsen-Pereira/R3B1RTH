import React from 'react';
import { useAudioStore } from '../../store/audioStore';
import { TR909Instrument } from '../../types/audio';

interface TR909SectionProps { drumMachineIndex: number; }

const TR909Section: React.FC<TR909SectionProps> = ({ drumMachineIndex }) => {
  const { triggerKick, triggerSnare, triggerHiHat } = useAudioStore();
  const instruments: { name: string; key: TR909Instrument; action: () => void }[] = [
    { name: 'BD', key: 'BD', action: () => triggerKick(1, 1.0) },
    { name: 'SD', key: 'SD', action: () => triggerSnare(1, 1.0) },
    { name: 'LT', key: 'LT', action: () => {} },
    { name: 'MT', key: 'MT', action: () => {} },
    { name: 'HT', key: 'HT', action: () => triggerHiHat(1, 1.0) },
    { name: 'RS', key: 'RS', action: () => {} },
    { name: 'CP', key: 'CP', action: () => {} },
    { name: 'CH', key: 'CH', action: () => {} },
    { name: 'OH', key: 'OH', action: () => {} },
    { name: 'CC', key: 'CC', action: () => {} },
    { name: 'RC', key: 'RC', action: () => {} },
  ];

  return (
    <div className="tr909-section">
      <h3>TR-909 #{drumMachineIndex + 1}</h3>
      <div className="drum-pads">
        {instruments.map((instrument, index) => (
          <button key={index} onClick={instrument.action} title={instrument.name}>{instrument.name}</button>
        ))}
      </div>
    </div>
  );
};

export default TR909Section;