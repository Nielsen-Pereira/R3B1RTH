/**
 * Automation Controls - R3B-5
 * UI component for automation recording and editing
 */

import React, { useState, useCallback } from 'react';
import { useAutomation } from '../hooks/useAutomation';
import type { AutomationLane, AutomationPoint, AutomationCurve } from '../types/automationTypes';

interface AutomationControlsProps {
  deviceId: string;
  deviceType: 'tb303' | 'tr808' | 'tr909';
  className?: string;
}

export const AutomationControls: React.FC<AutomationControlsProps> = ({
  deviceId,
  deviceType,
  className = '',
}) => {
  const {
    lanes,
    isRecording,
    currentRecordingLane,
    addLane,
    removeLane,
    toggleLane,
    addPoint,
    removePoint,
    startRecording,
    stopRecording,
    getLaneByParameter,
    getAvailableParameters,
    getLaneForDevice,
  } = useAutomation();

  const [selectedParameter, setSelectedParameter] = useState<string>('');
  const [showLaneMenu, setShowLaneMenu] = useState(false);
  const [editingLaneId, setEditingLaneId] = useState<string | null>(null);
  const [editingPointId, setEditingPointId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<number>(0);
  const [editTime, setEditTime] = useState<number>(0);
  const [editCurve, setEditCurve] = useState<AutomationCurve>('linear');

  const availableParameters = getAvailableParameters(deviceType);
  const deviceLanes = getLaneForDevice(deviceId);

  const handleAddLane = useCallback(() => {
    if (!selectedParameter) return;
    const existingLane = getLaneByParameter(selectedParameter, deviceId);
    if (existingLane) {
      toggleLane(existingLane.id);
    } else {
      addLane(selectedParameter, deviceId);
    }
    setSelectedParameter('');
    setShowLaneMenu(false);
  }, [selectedParameter, deviceId, getLaneByParameter, addLane, toggleLane]);

  const handleStartRecording = useCallback((laneId: string) => {
    startRecording(laneId);
  }, [startRecording]);

  const handleStopRecording = useCallback(() => {
    stopRecording();
  }, [stopRecording]);

  const handleRemoveLane = useCallback((laneId: string) => {
    removeLane(laneId);
  }, [removeLane]);

  const handleEditPoint = useCallback((laneId: string, point: AutomationPoint) => {
    setEditingLaneId(laneId);
    setEditingPointId(point.id);
    setEditValue(point.value);
    setEditTime(point.time);
    setEditCurve(point.curve);
  }, []);

  const handleSavePoint = useCallback(() => {
    if (editingLaneId && editingPointId) {
      setEditingLaneId(null);
      setEditingPointId(null);
    }
  }, [editingLaneId, editingPointId]);

  const handleCancelEdit = useCallback(() => {
    setEditingLaneId(null);
    setEditingPointId(null);
  }, []);

  const handleAddPointManually = useCallback((laneId: string) => {
    addPoint(laneId, editTime, editValue, editCurve);
    setEditTime(0);
    setEditValue(0);
    setEditCurve('linear');
  }, [editTime, editValue, editCurve, addPoint]);

  const curves: AutomationCurve[] = ['linear', 'step', 'smooth', 'exponential'];

  return (
    <div className={"automation-controls " + className}>
      <div className="automation-header">
        <h3>Automation</h3>
        <button className="add-lane-button" onClick={() => setShowLaneMenu(!showLaneMenu)}>
          + Add Lane
        </button>
        
        {showLaneMenu && (
          <div className="lane-menu">
            <select value={selectedParameter} onChange={(e) => setSelectedParameter(e.target.value)} className="parameter-select">
              <option value="">Select Parameter...</option>
              {availableParameters.map((param) => (
                <option key={param} value={param}>{param}</option>
              ))}
            </select>
            <button className="confirm-button" onClick={handleAddLane} disabled={!selectedParameter}>
              Add
            </button>
          </div>
        )}
      </div>

      <div className="automation-lanes">
        {deviceLanes.length === 0 ? (
          <div className="no-lanes">No automation lanes. Add a lane to start recording.</div>
        ) : (
          deviceLanes.map((lane) => (
            <div key={lane.id} className={"automation-lane " + (lane.enabled ? 'enabled' : 'disabled')}>
              <div className="lane-header">
                <span className="lane-parameter">{lane.parameter}</span>
                <div className="lane-actions">
                  <button className="record-button" onClick={() => {
                    if (isRecording && currentRecordingLane === lane.id) handleStopRecording();
                    else handleStartRecording(lane.id);
                  }}>
                    {isRecording && currentRecordingLane === lane.id ? 'Stop' : 'Record'}
                  </button>
                  <button className="toggle-button" onClick={() => toggleLane(lane.id)}>
                    {lane.enabled ? 'Disable' : 'Enable'}
                  </button>
                  <button className="remove-button" onClick={() => handleRemoveLane(lane.id)}>X</button>
                </div>
              </div>
              
              <div className="lane-points">
                {lane.points.length === 0 ? (
                  <div className="no-points">No points. Record or add manually.</div>
                ) : (
                  <div className="points-list">
                    {lane.points.map((point) => (
                      <div key={point.id} className="automation-point" onClick={() => handleEditPoint(lane.id, point)}>
                        <span className="point-time">{point.time.toFixed(2)}</span>
                        <span className="point-value">{point.value.toFixed(2)}</span>
                        <span className="point-curve">{point.curve}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {editingLaneId === lane.id && (
                <div className="point-editor">
                  <div className="editor-controls">
                    <div className="editor-field">
                      <label>Time:</label>
                      <input type="number" value={editTime} onChange={(e) => setEditTime(parseFloat(e.target.value) || 0)} step="0.01" />
                    </div>
                    <div className="editor-field">
                      <label>Value:</label>
                      <input type="number" value={editValue} onChange={(e) => setEditValue(parseFloat(e.target.value) || 0)} step="0.01" min="0" max="1" />
                    </div>
                    <div className="editor-field">
                      <label>Curve:</label>
                      <select value={editCurve} onChange={(e) => setEditCurve(e.target.value as AutomationCurve)}>
                        {curves.map((curve) => (<option key={curve} value={curve}>{curve}</option>))}
                      </select>
                    </div>
                    <div className="editor-buttons">
                      <button onClick={handleSavePoint}>Save</button>
                      <button onClick={handleCancelEdit}>Cancel</button>
                      <button onClick={() => handleAddPointManually(lane.id)}>Add</button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {isRecording && (
        <div className="recording-indicator">
          Recording automation for: {currentRecordingLane && lanes.find(l => l.id === currentRecordingLane)?.parameter}
        </div>
      )}
    </div>
  );
};

export default AutomationControls;
