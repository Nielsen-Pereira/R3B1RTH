import React from 'react';
import { useAudioStore } from '../../store/audioStore';
import { TR808Instrument } from '../../types/audio';

interface TR808SectionProps { drumMachineIndex: number; }

const TR808Section: React.FC<TR808SectionProps> = ({ drumMachineIndex }) => {
  const { triggerKick, triggerSnare, triggerHiHat } = useAudioStore();
  const instruments: { name: string; key: TR808Instrument; action: () => void }[] = [
    { name: 'BD', key: 'BD', action: () => triggerKick(0, 1.0) },
    { name: 'SD', key: 'SD', action: () => triggerSnare(0, 1.0) },
    { name: 'LT', key: 'LT', action: () => {} },
    { name: 'MT', key: 'MT', action: () => {} },
    { name: 'HT', key: 'HT', action: () => triggerHiHat(0, 1.0) },
    { name: 'RS', key: 'RS', action: () => {} },
    { name: 'CP', key: 'CP', action: () => {} },
    { name: 'CB', key: 'CB', action: () => {} },
    { name: 'CY', key: 'CY', action: () => {} },
    { name: 'OH', key: 'OH', action: () => {} },
    { name: 'CH', key: 'CH', action: () => {} },
  ];

  return (
    <div className="tr808-section">
      <h3>TR-808 #{drumMachineIndex + 1}</h3>
      <div className="drum-pads">
        {instruments.map((instrument, index) => (
          <button key={index} onClick={instrument.action} title={instrument.name}>{instrument.name}</button>
        ))}
      </div>
    </div>
  );
};

export default TR808Section;