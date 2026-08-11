import React, { useState } from 'react';
import { Pattern } from '../types/audio';
import { useAdvancedSequencer } from '../hooks/useAdvancedSequencer';
import { ShiftOptions, RandomizeOptions, AccentOptions } from '../types/sequencerTypes';
import './AdvancedSequencerControls.css';

interface AdvancedSequencerControlsProps {
  pattern: Pattern;
  onPatternChange: (pattern: Pattern) => void;
}

const AdvancedSequencerControls: React.FC<AdvancedSequencerControlsProps> = ({
  pattern,
  onPatternChange,
}) => {
  const [activeTab, setActiveTab] = useState<'shift' | 'random' | 'accent'>('shift');

  const advancedSequencer = useAdvancedSequencer({
    pattern,
    onPatternChange,
  });

  const handleShift = (direction: 'left' | 'right', amount: number) => {
    advancedSequencer.shiftPattern({
      direction,
      amount,
      wrap: true,
    });
  };

  const handleRandomize = () => {
    advancedSequencer.randomizePattern();
  };

  const handleApplyAccents = () => {
    advancedSequencer.applyAccents();
  };

  const handleShiftAmountChange = (amount: number) => {
    advancedSequencer.setShiftOptions({ amount });
    advancedSequencer.showShiftPreview(amount);
  };

  const handleShiftPreview = (amount: number) => {
    advancedSequencer.showShiftPreview(amount);
  };

  const handleShiftPreviewApply = () => {
    advancedSequencer.hideShiftPreview();
    advancedSequencer.shiftPattern();
  };

  const handleShiftPreviewCancel = () => {
    advancedSequencer.hideShiftPreview();
  };

  const handleRandomProbabilityChange = (probability: number) => {
    advancedSequencer.setRandomizeOptions({ probability });
  };

  const handleAccentLevelChange = (level: number) => {
    advancedSequencer.setAccentOptions({ accentLevel: level });
  };

  return (
    <div className="advanced-sequencer-controls">
      <div className="advanced-sequencer-header">
        <button
          className={`tab-button ${activeTab === 'shift' ? 'active' : ''}`}
          onClick={() => setActiveTab('shift')}
        >
          Shift
        </button>
        <button
          className={`tab-button ${activeTab === 'random' ? 'active' : ''}`}
          onClick={() => setActiveTab('random')}
        >
          Random
        </button>
        <button
          className={`tab-button ${activeTab === 'accent' ? 'active' : ''}`}
          onClick={() => setActiveTab('accent')}
        >
          Accent
        </button>
      </div>

      <div className="advanced-sequencer-panel">
        {activeTab === 'shift' && (
          <ShiftPanel
            pattern={pattern}
            shiftOptions={advancedSequencer.shiftOptions}
            isPreviewActive={advancedSequencer.isShiftPreviewActive}
            onShift={handleShift}
            onPreview={handleShiftPreview}
            onPreviewApply={handleShiftPreviewApply}
            onPreviewCancel={handleShiftPreviewCancel}
            onAmountChange={handleShiftAmountChange}
          />
        )}

        {activeTab === 'random' && (
          <RandomPanel
            randomizeOptions={advancedSequencer.randomizeOptions}
            onRandomize={handleRandomize}
            onProbabilityChange={handleRandomProbabilityChange}
          />
        )}

        {activeTab === 'accent' && (
          <AccentPanel
            accentOptions={advancedSequencer.accentOptions}
            onApplyAccents={handleApplyAccents}
            onLevelChange={handleAccentLevelChange}
          />
        )}
      </div>
    </div>
  );
};

interface ShiftPanelProps {
  pattern: Pattern;
  shiftOptions: ShiftOptions;
  isPreviewActive: boolean;
  onShift: (direction: 'left' | 'right', amount: number) => void;
  onPreview: (amount: number) => void;
  onPreviewApply: () => void;
  onPreviewCancel: () => void;
  onAmountChange: (amount: number) => void;
}

const ShiftPanel: React.FC<ShiftPanelProps> = ({
  pattern,
  shiftOptions,
  isPreviewActive,
  onShift,
  onPreview,
  onPreviewApply,
  onPreviewCancel,
  onAmountChange,
}) => {
  const maxShift = Math.min(15, pattern.length - 1);
  const shiftAmounts = Array.from({ length: maxShift }, (_, i) => i + 1);

  return (
    <div className="shift-panel">
      <div className="control-group">
        <label className="control-label">Shift Amount</label>
        <div className="slider-container">
          <input
            type="range"
            min="1"
            max={maxShift}
            value={shiftOptions.amount}
            onChange={(e) => onAmountChange(parseInt(e.target.value))}
            className="slider"
          />
          <span className="slider-value">{shiftOptions.amount}</span>
        </div>
      </div>

      <div className="shift-buttons">
        <button
          className="shift-button left"
          onClick={() => onShift('left', shiftOptions.amount)}
        >
          Shift Left
        </button>
        <button
          className="shift-button right"
          onClick={() => onShift('right', shiftOptions.amount)}
        >
          Shift Right
        </button>
      </div>

      <div className="preview-section">
        <label className="control-label">Preview</label>
        <div className="preview-buttons">
          {shiftAmounts.map((amount) => (
            <button
              key={amount}
              className="preview-button"
              onClick={() => onPreview(amount * (shiftOptions.direction === 'right' ? 1 : -1))}
            >
              {amount}
            </button>
          ))}
        </div>
        
        {isPreviewActive && (
          <div className="preview-actions">
            <button
              className="action-button apply"
              onClick={onPreviewApply}
            >
              Apply
            </button>
            <button
              className="action-button cancel"
              onClick={onPreviewCancel}
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

interface RandomPanelProps {
  randomizeOptions: RandomizeOptions;
  onRandomize: () => void;
  onProbabilityChange: (probability: number) => void;
}

const RandomPanel: React.FC<RandomPanelProps> = ({
  randomizeOptions,
  onRandomize,
  onProbabilityChange,
}) => {
  return (
    <div className="random-panel">
      <div className="control-group">
        <label className="control-label">Probability: {Math.round(randomizeOptions.probability * 100)}%</label>
        <div className="slider-container">
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={randomizeOptions.probability}
            onChange={(e) => onProbabilityChange(parseFloat(e.target.value))}
            className="slider"
          />
        </div>
      </div>

      <button
        className="randomize-button"
        onClick={onRandomize}
      >
        Randomize Pattern
      </button>
    </div>
  );
};

interface AccentPanelProps {
  accentOptions: AccentOptions;
  onApplyAccents: () => void;
  onLevelChange: (level: number) => void;
}

const AccentPanel: React.FC<AccentPanelProps> = ({
  accentOptions,
  onApplyAccents,
  onLevelChange,
}) => {
  return (
    <div className="accent-panel">
      <div className="control-group">
        <label className="control-label">Accent Level: {Math.round(accentOptions.accentLevel * 100)}%</label>
        <div className="slider-container">
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={accentOptions.accentLevel}
            onChange={(e) => onLevelChange(parseFloat(e.target.value))}
            className="slider"
          />
        </div>
      </div>

      <button
        className="accent-button"
        onClick={onApplyAccents}
      >
        Apply Accents
      </button>
    </div>
  );
};

export default AdvancedSequencerControls;