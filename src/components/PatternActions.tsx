import React from 'react';
import { usePatternStore, getCurrentPattern, hasClipboardContent } from '../stores/patternStore';
import type { InstrumentType } from '../types';

export const PatternActions: React.FC = () => {
  const store = usePatternStore();
  const state = store();
  const currentPattern = getCurrentPattern(state);
  const hasClipboard = hasClipboardContent(state);
  const instruments: InstrumentType[] = ['tb303', 'tr808', 'tr909'];

  const handleCopy = () => {
    if (currentPattern) store.getState().copyPattern(currentPattern.id);
  };

  const handlePaste = (instrument?: InstrumentType) => {
    store.getState().pastePattern(instrument);
  };

  const handleClone = () => {
    if (currentPattern) store.getState().clonePattern(currentPattern.id);
  };

  const handleClear = () => {
    if (currentPattern && window.confirm(`Clear pattern "${currentPattern.name}"?`)) {
      store.getState().clearPattern(currentPattern.id);
    }
  };

  const handlePasteToInstrument = (instrument: InstrumentType) => {
    store.getState().pastePattern(instrument);
  };

  if (!currentPattern) {
    return <div className="pattern-actions"><p>Select a pattern to enable actions</p></div>;
  }

  return (
    <div className="pattern-actions">
      <h4>Pattern Actions</h4>
      <div className="action-buttons">
        <button onClick={handleCopy} disabled={!currentPattern} title="Copy pattern to clipboard">Copy</button>
        <button onClick={() => handlePaste()} disabled={!hasClipboard} title="Paste pattern">Paste</button>
        <button onClick={handleClone} disabled={!currentPattern} title="Clone pattern">Clone</button>
        <button onClick={handleClear} disabled={!currentPattern} className="danger" title="Clear pattern">Clear</button>
      </div>
      {hasClipboard && (
        <div className="paste-options">
          <label>Paste to instrument:</label>
          <div className="instrument-buttons">
            {instruments.map(inst => (
              <button key={inst} onClick={() => handlePasteToInstrument(inst)} title={`Paste to ${inst.toUpperCase()}`}>
                {inst.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
      )}
      <div className="pattern-info">
        <p>Current: {currentPattern.name} ({currentPattern.instrument})</p>
        <p>Steps: {currentPattern.length}</p>
      </div>
    </div>
  );
};

export default PatternActions;