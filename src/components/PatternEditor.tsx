/**
 * Pattern Editor Component - Batch 1 Development
 * R3B-90 to R3B-93: Song Mode Implementation
 */

import React, { useState, useCallback } from 'react';
import type { Pattern, PatternStep, InstrumentType } from '../types';
import { createEmptyPattern, toggleStep, toggleAccent, toggleSlide, setStepValue } from '../utils/patternUtils';

interface PatternEditorProps {
  instrument: InstrumentType;
  pattern: Pattern;
  onPatternChange: (pattern: Pattern) => void;
}

export const PatternEditor: React.FC<PatternEditorProps> = ({
  instrument,
  pattern,
  onPatternChange,
}) => {
  const [hoveredStep, setHoveredStep] = useState<number | null>(null);

  const handleStepClick = useCallback((stepId: number) => {
    const newPattern = toggleStep(pattern, stepId);
    onPatternChange(newPattern);
  }, [pattern, onPatternChange]);

  const handleRightClick = useCallback((stepId: number, e: React.MouseEvent) => {
    e.preventDefault();
    const newPattern = toggleAccent(pattern, stepId);
    onPatternChange(newPattern);
  }, [pattern, onPatternChange]);

  const handleSlideToggle = useCallback((stepId: number) => {
    const newPattern = toggleSlide(pattern, stepId);
    onPatternChange(newPattern);
  }, [pattern, onPatternChange]);

  const handleWheel = useCallback((stepId: number, e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    const newValue = Math.max(0, Math.min(1, pattern.steps[stepId].value + delta));
    const newPattern = setStepValue(pattern, stepId, newValue);
    onPatternChange(newPattern);
  }, [pattern, onPatternChange]);

  const renderStep = (step: PatternStep) => {
    const isActive = step.active;
    const isAccent = step.accent;
    const isSlide = step.slide;
    const isHovered = hoveredStep === step.id;

    let className = 'pattern-step';
    if (isActive) className += ' active';
    if (isAccent) className += ' accent';
    if (isSlide) className += ' slide';
    if (isHovered) className += ' hovered';

    return (
      <div
        key={step.id}
        className={className}
        onClick={() => handleStepClick(step.id)}
        onContextMenu={(e) => handleRightClick(step.id, e)}
        onMouseEnter={() => setHoveredStep(step.id)}
        onMouseLeave={() => setHoveredStep(null)}
        onWheel={(e) => handleWheel(step.id, e)}
      >
        <span className="step-number">{step.id + 1}</span>
        {isActive && <span className="step-indicator" />}
        {isAccent && <span className="accent-indicator">A</span>}
        {isSlide && <span className="slide-indicator">S</span>}
      </div>
    );
  };

  const handleLengthChange = useCallback((newLength: number) => {
    const newPattern = createEmptyPattern(pattern.instrument, newLength);
    const stepsToCopy = Math.min(newLength, pattern.length);
    for (let i = 0; i < stepsToCopy; i++) {
      newPattern.steps[i] = { ...pattern.steps[i], id: i };
    }
    onPatternChange(newPattern);
  }, [pattern, onPatternChange]);

  const handleSwingChange = useCallback((swing: number) => {
    onPatternChange({ ...pattern, swing });
  }, [pattern, onPatternChange]);

  const handleShuffleChange = useCallback((shuffle: number) => {
    onPatternChange({ ...pattern, shuffle });
  }, [pattern, onPatternChange]);

  const handleClear = useCallback(() => {
    const newPattern = createEmptyPattern(pattern.instrument, pattern.length);
    onPatternChange(newPattern);
  }, [pattern, onPatternChange]);

  const handleFill = useCallback(() => {
    const newPattern = {
      ...pattern,
      steps: pattern.steps.map(step => ({ ...step, active: true })),
    };
    onPatternChange(newPattern);
  }, [pattern, onPatternChange]);

  return (
    <div className="pattern-editor">
      <div className="editor-header">
        <h3>{instrument.toUpperCase()} Pattern Editor</h3>
        <div className="pattern-name">
          <input
            type="text"
            value={pattern.name}
            onChange={(e) => onPatternChange({ ...pattern, name: e.target.value })}
          />
        </div>
      </div>

      <div className="pattern-grid">
        {pattern.steps.map(renderStep)}
      </div>

      <div className="pattern-controls">
        <div className="control-group">
          <label>Length: {pattern.length}</label>
          <input
            type="range"
            min="1"
            max="32"
            value={pattern.length}
            onChange={(e) => handleLengthChange(parseInt(e.target.value))}
          />
        </div>

        <div className="control-group">
          <label>Swing: {pattern.swing}%</label>
          <input
            type="range"
            min="-100"
            max="100"
            value={pattern.swing}
            onChange={(e) => handleSwingChange(parseInt(e.target.value))}
          />
        </div>

        <div className="control-group">
          <label>Shuffle: {pattern.shuffle}%</label>
          <input
            type="range"
            min="0"
            max="100"
            value={pattern.shuffle}
            onChange={(e) => handleShuffleChange(parseInt(e.target.value))}
          />
        </div>

        <div className="action-buttons">
          <button onClick={handleClear}>Clear</button>
          <button onClick={handleFill}>Fill</button>
        </div>
      </div>
    </div>
  );
};

export default PatternEditor;
