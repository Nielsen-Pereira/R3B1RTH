import React, { useRef, useState, useEffect, useCallback } from 'react';
import { useUIStore } from '../../store/uiStore';

interface FaderProps {
  value: number;
  min?: number;
  max?: number;
  step?: number;
  orientation?: 'vertical' | 'horizontal';
  size?: 'small' | 'medium' | 'large';
  label?: string;
  onChange?: (value: number) => void;
  onChangeEnd?: () => void;
  disabled?: boolean;
}

const Fader: React.FC<FaderProps> = ({
  value,
  min = 0,
  max = 100,
  step = 1,
  orientation = 'vertical',
  size = 'medium',
  label,
  onChange,
  onChangeEnd,
  disabled = false,
}) => {
  const { setFocusedControl, setTooltip, clearTooltip } = useUIStore();
  const faderRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartValue, setDragStartValue] = useState<number | null>(null);
  const [shiftKey, setShiftKey] = useState(false);
  
  const colors = useUIStore.getState().colors || {
    faderBackground: '#2a2a4a',
    faderForeground: '#ffffff',
    buttonBackground: '#0f3460',
    buttonActive: '#e94560',
  };
  
  const getDimensions = () => {
    const sizes: Record<string, any> = {
      small: { width: 20, height: 100, handleSize: 16 },
      medium: { width: 25, height: 120, handleSize: 20 },
      large: { width: 30, height: 140, handleSize: 24 },
    };
    const dims = sizes[size] || sizes.medium;
    return orientation === 'horizontal' ? { width: dims.height, height: dims.width, handleSize: dims.handleSize } : dims;
  };
  
  const { width, height, handleSize } = getDimensions();
  const calculatePosition = (val: number) => {
    const normalized = (val - min) / (max - min);
    return orientation === 'horizontal' ? normalized * width : (1 - normalized) * height;
  };
  const position = calculatePosition(value);
  
  const startDrag = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    if (disabled) return;
    e.preventDefault();
    setIsDragging(true);
    setDragStartValue(value);
    setFocusedControl(`fader-${label || Math.random().toString(36).substr(2, 9)}`);
    document.addEventListener('mousemove', handleDrag);
    document.addEventListener('mouseup', endDrag);
    document.addEventListener('touchmove', handleDrag);
    document.addEventListener('touchend', endDrag);
    if (label) {
      const rect = faderRef.current?.getBoundingClientRect();
      if (rect) setTooltip(`${label}: ${Math.round(value)}%`, {
        x: orientation === 'horizontal' ? rect.left + position : rect.left + rect.width / 2,
        y: orientation === 'horizontal' ? rect.top - 30 : rect.top + height + 10,
      });
    }
  }, [disabled, label, value, position, orientation, height, setFocusedControl, setTooltip]);
  
  const handleDrag = useCallback((e: MouseEvent | TouchEvent) => {
    if (!isDragging || dragStartValue === null) return;
    e.preventDefault();
    const rect = faderRef.current?.getBoundingClientRect();
    if (!rect) return;
    let clientPos: number;
    if ('touches' in e) clientPos = orientation === 'horizontal' ? e.touches[0].clientX : e.touches[0].clientY;
    else clientPos = orientation === 'horizontal' ? e.clientX : e.clientY;
    const relativePos = orientation === 'horizontal'
      ? (clientPos - rect.left) / rect.width
      : 1 - (clientPos - rect.top) / rect.height;
    const clampedRelativePos = Math.max(0, Math.min(1, relativePos));
    const effectiveStep = shiftKey ? step / 10 : step;
    const newValue = min + clampedRelativePos * (max - min);
    const snappedValue = Math.round(newValue / effectiveStep) * effectiveStep;
    const clampedValue = Math.max(min, Math.min(max, snappedValue));
    onChange?.(clampedValue);
  }, [isDragging, dragStartValue, step, shiftKey, min, max, orientation, onChange]);
  
  const endDrag = useCallback((e: MouseEvent | TouchEvent) => {
    if (!isDragging) return;
    e.preventDefault();
    setIsDragging(false);
    setDragStartValue(null);
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
  
  const baseStyle: React.CSSProperties = {
    width: `${width}px`,
    height: `${height}px`,
    position: 'relative',
    cursor: disabled ? 'not-allowed' : orientation === 'horizontal' ? 'ew-resize' : 'ns-resize',
    userSelect: 'none',
    WebkitUserSelect: 'none',
    touchAction: 'none',
  };
  
  const trackStyle: React.CSSProperties = {
    position: 'absolute',
    left: 0,
    top: 0,
    width: '100%',
    height: '100%',
    background: colors.faderBackground || '#2a2a4a',
    borderRadius: orientation === 'horizontal' ? `${width / 2}px` : `${handleSize / 2}px`,
    border: `1px solid ${colors.faderBackground === '#2a2a4a' ? '#333333' : '#222222'}`,
  };
  
  const fillStyle: React.CSSProperties = {
    position: 'absolute',
    left: 0,
    top: 0,
    width: orientation === 'horizontal' ? `${position}px` : '100%',
    height: orientation === 'horizontal' ? '100%' : `${height - position}px`,
    background: `linear-gradient(to ${orientation === 'horizontal' ? 'right' : 'bottom'}, ${colors.faderForeground || '#ffffff'}, ${colors.buttonActive || '#e94560'})`,
    borderRadius: orientation === 'horizontal' ? `${width / 2}px` : `${handleSize / 2}px`,
    opacity: 0.7,
  };
  
  const handleStyle: React.CSSProperties = {
    position: 'absolute',
    left: orientation === 'horizontal' ? `${position - handleSize / 2}px` : `${width / 2 - handleSize / 2}px`,
    top: orientation === 'horizontal' ? `${height / 2 - handleSize / 2}px` : `${position - handleSize / 2}px`,
    width: `${handleSize}px`,
    height: `${handleSize}px`,
    background: isDragging ? colors.buttonActive || '#e94560' : colors.buttonBackground || '#0f3460',
    borderRadius: '50%',
    border: `1px solid ${colors.knobForeground || '#ffffff'}`,
    cursor: disabled ? 'not-allowed' : 'grab',
    boxShadow: isDragging ? '0 0 10px rgba(233, 69, 96, 0.7)' : '0 0 3px rgba(0, 0, 0, 0.5)',
    zIndex: 2,
  };
  
  return (
    <div
      ref={faderRef}
      style={baseStyle}
      onMouseDown={startDrag}
      onTouchStart={startDrag}
      onWheel={handleWheel}
      onKeyDown={handleKeyDown}
      onKeyUp={handleKeyUp}
      tabIndex={disabled ? -1 : 0}
      role="slider"
      aria-orientation={orientation}
      aria-valuemin={min}
      aria-valuemax={max}
      aria-valuenow={value}
      aria-label={label || 'Fader'}
      aria-disabled={disabled}
    >
      <div style={trackStyle} />
      <div style={fillStyle} />
      <div style={handleStyle} />
      {label && (
        <div style={{
          position: 'absolute',
          left: orientation === 'horizontal' ? '50%' : `${width + 5}px`,
          top: orientation === 'horizontal' ? `${height + 5}px` : '50%',
          transform: orientation === 'horizontal' ? 'translateX(-50%)' : 'translateY(-50%)',
          fontSize: `${Math.min(width, height) / 3}px`,
          color: colors.faderForeground || '#ffffff',
          fontFamily: 'inherit',
          whiteSpace: 'nowrap',
        }}>
          {Math.round(value)}%
        </div>
      )}
    </div>
  );
};

export default React.memo(Fader);