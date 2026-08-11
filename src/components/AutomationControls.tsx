import React, { useState } from 'react';
import { useAutomation } from '../hooks/useAutomation';
import { ControlId } from '../types/automationTypes';
import './AutomationControls.css';

interface AutomationControlsProps {
  songId: string;
  controls: ControlId[];
}

const AutomationControls: React.FC<AutomationControlsProps> = ({ songId, controls }) => {
  const [selectedControl, setSelectedControl] = useState<ControlId | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  
  const automation = useAutomation({
    controls,
    songId,
    sampleRate: 30,
  });

  const handleRecordToggle = () => {
    if (automation.isRecording) {
      automation.stopRecording();
    } else {
      automation.startRecording();
    }
  };

  const handleClear = (controlId?: ControlId) => {
    automation.clearAutomation(controlId);
  };

  const handleControlSelect = (controlId: ControlId) => {
    setSelectedControl(prev => prev === controlId ? null : controlId);
  };

  const handleValueChange = (controlId: ControlId, value: number) => {
    automation.setControlValue(controlId, value);
  };

  return (
    <div className="automation-controls">
      <div className="automation-header" onClick={() => setIsExpanded(!isExpanded)}>
        <span className="automation-title">Automation</span>
        <button 
          className={`record-button ${automation.isRecording ? 'recording' : ''}`}
          onClick={(e) => {
            e.stopPropagation();
            handleRecordToggle();
          }}
        >
          {automation.isRecording ? 'Stop' : 'Record'}
        </button>
      </div>

      {isExpanded && (
        <div className="automation-panel">
          <div className="controls-list">
            {controls.map((controlId) => (
              <div 
                key={controlId}
                className={`control-item ${selectedControl === controlId ? 'selected' : ''}`}
                onClick={() => handleControlSelect(controlId)}
              >
                <span className="control-name">{formatControlName(controlId)}</span>
                {selectedControl === controlId && (
                  <div className="control-details">
                    <div className="automation-visualizer">
                      <AutomationVisualizer 
                        points={automation.automationData[controlId] || []} 
                        controlId={controlId}
                      />
                    </div>
                    <div className="control-actions">
                      <button 
                        className="clear-button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleClear(controlId);
                        }}
                      >
                        Clear
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="global-actions">
            <button 
              className="clear-all-button"
              onClick={() => handleClear()}
            >
              Clear All
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

interface AutomationVisualizerProps {
  points: { timestamp: number; value: number }[];
  controlId: ControlId;
}

const AutomationVisualizer: React.FC<AutomationVisualizerProps> = ({ points }) => {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);

  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw automation curve
    if (points.length > 0) {
      ctx.beginPath();
      ctx.strokeStyle = '#ff6b6b';
      ctx.lineWidth = 2;

      // Normalize points to canvas size
      const maxTime = Math.max(...points.map(p => p.timestamp), 1);
      const maxValue = Math.max(...points.map(p => p.value), 1);

      points.forEach((point, index) => {
        const x = (point.timestamp / maxTime) * canvas.width;
        const y = canvas.height - (point.value / maxValue) * canvas.height;

        if (index === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      });

      ctx.stroke();
    }
  }, [points]);

  return (
    <canvas 
      ref={canvasRef} 
      width={200} 
      height={60}
      className="automation-canvas"
    />
  );
};

// Helper function to format control names
function formatControlName(controlId: ControlId): string {
  const parts = controlId.split('_');
  return parts
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

export default AutomationControls;