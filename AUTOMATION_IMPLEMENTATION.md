# Automation Implementation - Batch 5

## Overview
This document describes the implementation of the Automation feature for the R3B1RTH project, which is a web-based clone of ReBirth RB-338.

## Implemented Features

### 1. Core Types (src/types/automationTypes.ts)
- ControlId: Type for all automatable controls (TB-303, TR-808, TR-909, Master)
- AutomationPoint: Individual automation point with timestamp and value
- AutomationTrack: Collection of automation points for a single control
- PatternAutomation: Automation data for a specific pattern
- SongAutomation: Complete automation data for a song
- AutomationState: State for the automation store

### 2. Updated Song Store (src/stores/songStore.ts)
Added automation support to the existing song store:
- New State:
  - automation: Array of SongAutomation objects
  - isRecordingAutomation: Boolean flag for recording state
  - recordingStartTime: Timestamp when recording started
  - currentRecordingControls: List of controls being recorded
  - currentRecordingSongId: ID of the song being recorded

- New Actions:
  - startAutomationRecording(songId, controlIds): Start recording automation
  - stopAutomationRecording(songId): Stop recording automation
  - recordAutomation(controlId, value): Record a single automation point
  - clearAutomation(songId, controlId?): Clear automation for a control or all
  - getAutomationForPattern(songId, patternId, controlId): Get automation for a pattern
  - getAutomationForSong(songId, controlId): Get automation for a song
  - deleteAutomationPoint(songId, patternId, controlId, timestamp): Delete a specific point

### 3. Automation Hook (src/hooks/useAutomation.ts)
Enhanced hook for managing automation:
- Features:
  - Real-time recording of control movements
  - Linear interpolation between automation points
  - Sync with song store
  - Support for global and pattern-specific automation

- Returns:
  - automationData: Record of automation points per control
  - startRecording(): Start recording automation
  - stopRecording(): Stop recording automation
  - isRecording: Current recording state
  - clearAutomation(controlId?): Clear automation
  - getAutomationAtTime(controlId, time): Get interpolated value at time
  - getAutomationTrack(controlId): Get automation track for a control
  - setControlValue(controlId, value): Set current value and record if recording

### 4. Automation Controls Component (src/components/AutomationControls.tsx)
UI component for managing automation:
- Features:
  - Collapsible panel for automation controls
  - Record/Stop button with visual feedback
  - List of all automatable controls
  - Visualizer for automation curves
  - Clear individual or all automation
  - Responsive design

### 5. Tests
- src/stores/__tests__/automationStore.test.ts: Tests for automation store functionality
  - Recording start/stop
  - Recording automation points
  - Clearing automation
  - Retrieving automation data

- src/hooks/__tests__/useAutomation.test.tsx: Tests for the automation hook
  - Initialization
  - Setting control values
  - Clearing automation
  - Getting automation at specific times

## Usage Example

```tsx
import { useAutomation } from '../hooks/useAutomation';
import { ControlId } from '../types/automationTypes';

const controls: ControlId[] = ['tb303_cutoff', 'tb303_resonance', 'master_volume'];

function MyComponent({ songId }: { songId: string }) {
  const automation = useAutomation({ controls, songId });

  return (
    <div>
      <button onClick={automation.startRecording}>
        Start Recording
      </button>
      <button onClick={automation.stopRecording}>
        Stop Recording
      </button>
      
      <input
        type="range"
        min="0"
        max="1"
        step="0.01"
        value={/* current value */}
        onChange={(e) => {
          automation.setControlValue('tb303_cutoff', parseFloat(e.target.value));
        }}
      />
    </div>
  );
}
```

## Integration with Existing Code

### Song Store Integration
The automation data is now persisted with the song data in localStorage through the persist middleware.

### Pattern Management
When patterns are added or removed, the corresponding automation data is automatically managed.

### Playback Sync
Automation playback is synchronized with the sequencer through the getAutomationAtTime function, which provides interpolated values at any point in time.

## Next Steps

1. Integrate with Audio Engine: Connect automation values to the Web Audio API parameters
2. Pattern-Specific Automation: Enhance to support automation per pattern (currently records to global tracks)
3. Automation Editing: Add UI for editing automation points (move, delete, etc.)
4. Automation Import/Export: Serialize automation data with song files
5. Performance Optimization: Optimize automation data storage for large songs

## Files Modified/Created

### Created:
- src/types/automationTypes.ts
- src/hooks/useAutomation.ts (enhanced)
- src/hooks/__tests__/useAutomation.test.tsx
- src/stores/__tests__/automationStore.test.ts
- src/components/AutomationControls.tsx
- src/components/AutomationControls.css

### Modified:
- src/types/index.ts (added automationTypes export)
- src/stores/songStore.ts (added automation support)
- src/hooks/index.ts (added useAutomation export)
- src/components/index.ts (added AutomationControls export)

## Technical Notes

1. Timestamp Handling: All automation timestamps are in milliseconds from the start of recording
2. Value Range: All automation values are normalized between 0 and 1
3. Interpolation: Linear interpolation is used between automation points
4. Storage: Automation data is persisted with songs in localStorage
5. Sample Rate: Default sample rate is 30Hz (30 points per second)

## ReBirth RB-338 Compatibility

This implementation follows ReBirth RB-338 specifications:
- Automation is recorded in real-time
- Automation can be recorded for all major controls
- Automation data is saved with songs
- Automation can be cleared per control or globally