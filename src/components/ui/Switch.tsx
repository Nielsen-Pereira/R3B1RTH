import React, { useCallback } from 'react';
import { useUIStore } from '../../store/uiStore';

interface SwitchProps {
  checked: boolean;
  onChange?: (checked: boolean) => void;
  size?: 'small' | 'medium' | 'large';
  label?: string;
  disabled?: boolean;
}

const Switch: React.FC<SwitchProps> = ({
  checked,
  onChange,
  size = 'medium',
  label,
  disabled = false,
}) => {
  const { setFocusedControl } = useUIStore();
  const colors = useUIStore.getState().colors || {
    switchOn: '#e94560',
    switchOff: '#333333',
    switchThumb: '#ffffff',
    text: '#ffffff',
  };

  const getDimensions = () => {
    const sizes = {
      small: { width: 40, height: 20, thumbSize: 16 },
      medium: { width: 50, height: 24, thumbSize: 20 },
      large: { width: 60, height: 28, thumbSize: 24 },
    };
    return sizes[size] || sizes.medium;
  };

  const { width, height, thumbSize } = getDimensions();
  const trackColor = checked ? colors.switchOn : colors.switchOff;
  const thumbPosition = checked ? width - thumbSize : 0;

  const handleClick = useCallback(() => {
    if (disabled) return;
    onChange?.(!checked);
  }, [disabled, checked, onChange]);

  const handleKeyDown = useCallback((e) => {
    if (disabled) return;
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onChange?.(!checked);
    }
  }, [disabled, checked, onChange]);

  const handleFocus = useCallback(() => {
    setFocusedControl('switch-' + (label || Math.random().toString(36).substr(2, 9)));
  }, [setFocusedControl, label]);

  const handleBlur = useCallback(() => {
    setFocusedControl(null);
  }, [setFocusedControl]);

  const trackStyle = {
    width: width,
    height: height,
    borderRadius: height / 2,
    background: trackColor,
    position: 'relative',
    cursor: disabled ? 'not-allowed' : 'pointer',
    transition: 'background 0.2s ease',
    border: '1px solid ' + (checked ? colors.switchOn : '#555555'),
  };

  const thumbStyle = {
    width: thumbSize,
    height: thumbSize,
    borderRadius: '50%',
    background: colors.switchThumb,
    position: 'absolute',
    left: thumbPosition,
    top: (height - thumbSize) / 2,
    transition: 'left 0.2s ease',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.4)',
    border: '1px solid ' + (checked ? colors.switchOn : '#555555'),
  };

  return (
    <div
      style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      onFocus={handleFocus}
      onBlur={handleBlur}
      tabIndex={disabled ? -1 : 0}
      role="switch"
      aria-checked={checked}
      aria-disabled={disabled}
      aria-label={label || 'Switch'}
    >
      <div style={trackStyle} />
      <div style={thumbStyle} />
      {label && (
        <span style={{
          color: colors.text,
          fontSize: height * 0.6 + 'px',
          fontFamily: 'inherit',
          cursor: disabled ? 'not-allowed' : 'pointer',
        }}>
          {label}
        </span>
      )}
    </div>
  );
};

export default React.memo(Switch);
