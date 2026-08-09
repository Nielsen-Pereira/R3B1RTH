import React, { useRef, useState, useEffect, useCallback } from 'react';
import { useUIStore } from '../../store/uiStore';

interface KnobProps {
  value: number;
  min?: number;
  max?: number;
  step?: number;
  size?: 'small' | 'medium' | 'large';
  label?: string;
  onChange?: (value: number) => void;
  onChangeEnd?: () => void;
  disabled?: boolean;
}

const Knob: React.FC<KnobProps> = ({
  value,
  min = 0,
  max = 100,
  step = 1,
  size = 'medium',
  label,
  onChange,
  onChangeEnd,
  disabled = false,
}) => {
  const { setFocusedControl, setTooltip, clearTooltip } = useUIStore();
  const knobRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartAngle, setDragStartAngle] = useState<number | null>(null);
  const [shiftKey, setShiftKey] = useState(false);

  const colors = useUIStore.getState().colors || {
    knobBackground: '#1a1a2e',
    knobForeground: '#e94560',
    text: '#ffffff',
  };

  const getDimensions = () => {
    const sizes: Record<string, { size: number; trackWidth: number }> = {
      small: { size: 40, trackWidth: 4 },
      medium: { size: 50, trackWidth: 5 },
      large: { size: 60, trackWidth: 6 },
    };
    return sizes[size] || sizes.medium;
  };

  const { size: knobSize, trackWidth } = getDimensions();
  const radius = knobSize / 2;
  const center = radius;

  const calculateAngle = (val: number) => {
    const normalized = (val - min) / (max - min);
    return normalized * 270 - 135;
  };

  const angle = calculateAngle(value);
  const angleRad = angle * (Math.PI / 180);
  const indicatorX = center + Math.cos(angleRad) * (radius - trackWidth - 10);
  const indicatorY = center + Math.sin(angleRad) * (radius - trackWidth - 10);

  const startDrag = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    if (disabled) return;
    e.preventDefault();
    setIsDragging(true);
    setFocusedControl(`knob-${label || Math.random().toString(36).substr(2, 9)}`);

    const rect = knobRef.current?.getBoundingClientRect();
    if (!rect) return;

    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    const centerX = rect.left + radius;
    const centerY = rect.top + radius;
    const startAngle = Math.atan2(clientY - centerY, clientX - centerX) * (180 / Math.PI);
    setDragStartAngle(startAngle);

    document.addEventListener('mousemove', handleDrag);
    document.addEventListener('mouseup', endDrag);
    document.addEventListener('touchmove', handleDrag);
    document.addEventListener('touchend', endDrag);

    if (label) {
      setTooltip(`${label}: ${Math.round(value)}%`, {
        x: rect.left + radius,
        y: rect.top - 30,
      });
    }
  }, [disabled, label, value, radius, setFocusedControl, setTooltip]);

  const handleDrag = useCallback((e: MouseEvent | TouchEvent) => {
    if (!isDragging || dragStartAngle === null) return;
    e.preventDefault();

    const rect = knobRef.current?.getBoundingClientRect();
    if (!rect) return;

    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    const centerX = rect.left + radius;
    const centerY = rect.top + radius;
    const currentAngle = Math.atan2(clientY - centerY, clientX - centerX) * (180 / Math.PI);

    let angleDiff = currentAngle - dragStartAngle;
    if (angleDiff > 180) angleDiff -= 360;
    if (angleDiff < -180) angleDiff += 360;

    const angleRange = 270;
    const angleStart = -135;
    const normalized = (angleDiff / angleRange) + ((dragStartAngle - angleStart) / angleRange);
    const clampedNormalized = Math.max(0, Math.min(1, normalized));

    const effectiveStep = shiftKey ? step / 10 : step;
    const newValue = min + clampedNormalized * (max - min);
    const snappedValue = Math.round(newValue / effectiveStep) * effectiveStep;
    const clampedValue = Math.max(min, Math.min(max, snappedValue));

    onChange?.(clampedValue);
  }, [isDragging, dragStartAngle, step, shiftKey, min, max, radius, onChange]);

  const endDrag = useCallback((e: MouseEvent | TouchEvent) => {
    if (!isDragging) return;
    e.preventDefault();
    setIsDragging(false);
    setDragStartAngle(null);
    setFocusedControl(null);
    clearTooltip();
    document.removeEventListener('mousemove', handleDrag);
    document.removeEventListener('mouseup', endDrag);
    document.removeEventListener('touchmove', handleDrag);
    document.removeEventListener('touchend', endDrag);
    onChangeEnd?.();
  }, [isDragging, setFocusedControl, clearTooltip, handleDrag, endDrag, onChangeEnd]);

  const handleWheel = useCallback((e: React.WheelEvent) => {
    if (disabled) return;
    e.preventDefault();
    const delta = e.deltaY > 0 ? -1 : 1;
    const effectiveStep = shiftKey ? step / 10 : step;
    const newValue = Math.max(min, Math.min(max, value + delta * effectiveStep));
    onChange?.(newValue);
  }, [disabled, value, min, max, step, shiftKey, onChange]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Shift') setShiftKey(true);
  }, []);

  const handleKeyUp = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Shift') setShiftKey(false);
  }, []);

  useEffect(() => {
    return () => {
      document.removeEventListener('mousemove', handleDrag);
      document.removeEventListener('mouseup', endDrag);
      document.removeEventListener('touchmove', handleDrag);
      document.removeEventListener('touchend', endDrag);
      clearTooltip();
    };
  }, [handleDrag, endDrag, clearTooltip]);

  const trackStyle: React.CSSProperties = {
    position: 'absolute',
    left: center,
    top: center,
    width: radius,
    height: radius,
    borderRadius: '50%',
    background: `conic-gradient(from ${angle + 135}deg at 50% 50%, ${colors.knobForeground} 0deg, ${colors.knobForeground} ${(value / (max - min)) * 270}deg, transparent ${(value / (max - min)) * 270}deg)`,
  };

  const knobStyle: React.CSSProperties = {
    position: 'absolute',
    left: 0,
    top: 0,
    width: knobSize,
    height: knobSize,
    borderRadius: '50%',
    background: colors.knobBackground,
    border: `2px solid ${colors.knobForeground}`,
    cursor: disabled ? 'not-allowed' : 'grab',
    boxShadow: isDragging ? '0 0 15px rgba(233, 69, 96, 0.8)' : '0 0 5px rgba(0, 0, 0, 0.5)',
    userSelect: 'none',
    WebkitUserSelect: 'none',
  };

  const indicatorStyle: React.CSSProperties = {
    position: 'absolute',
    left: indicatorX,
    top: indicatorY,
    width: 2,
    height: radius - trackWidth - 5,
    background: colors.knobForeground,
    transformOrigin: 'center bottom',
    transform: `rotate(${angle}deg)`,
  };

  const valueDisplayStyle: React.CSSProperties = {
    position: 'absolute',
    left: 0,
    top: center - 10,
    width: knobSize,
    height: 20,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: `${Math.floor(knobSize / 4)}px`,
    fontWeight: 'bold',
    color: colors.text,
    fontFamily: 'inherit',
    textShadow: '0 0 3px rgba(0, 0, 0, 0.8)',
  };

  return (
    <div
      ref={knobRef}
      style={{ position: 'relative', width: knobSize, height: knobSize }}
      onMouseDown={startDrag}
      onTouchStart={startDrag}
      onWheel={handleWheel}
      onKeyDown={handleKeyDown}
      onKeyUp={handleKeyUp}
      tabIndex={disabled ? -1 : 0}
      role="slider"
      aria-valuemin={min}
      aria-valuemax={max}
      aria-valuenow={value}
      aria-label={label || 'Knob'}
      aria-disabled={disabled}
    >
      <div style={trackStyle} />
      <div style={knobStyle} />
      <div style={indicatorStyle} />
      <div style={valueDisplayStyle}>{Math.round(value)}</div>
      {label && (
        <div style={{
          position: 'absolute',
          left: 0,
          top: knobSize + 5,
          width: knobSize,
          textAlign: 'center',
          fontSize: `${Math.floor(knobSize / 6)}px`,
          color: colors.text,
          fontFamily: 'inherit',
        }}>
          {label}
        </div>
      )}
    </div>
  );
};

export default React.memo(Knob);