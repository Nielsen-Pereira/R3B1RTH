import React, { useRef, useState, useEffect, useCallback } from 'react';
import { useUIStore } from '../../store/uiStore';

interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'small' | 'medium' | 'large';
  active?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  onDoubleClick?: () => void;
  onLongPress?: () => void;
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'medium',
  active = false,
  disabled = false,
  onClick,
  onDoubleClick,
  onLongPress,
  children,
  className = '',
  style = {},
}) => {
  const { setFocusedControl } = useUIStore();
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [isPressed, setIsPressed] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [longPressTimeout, setLongPressTimeout] = useState<NodeJS.Timeout | null>(null);
  
  const colors = useUIStore.getState().colors || {
    primary: '#0f3460',
    secondary: '#e94560',
    text: '#ffffff',
  };
  
  const getDimensions = () => {
    switch (size) {
      case 'small': return { padding: '4px 8px', fontSize: 10, minWidth: 40 };
      case 'medium': return { padding: '6px 12px', fontSize: 12, minWidth: 50 };
      case 'large': return { padding: '8px 16px', fontSize: 14, minWidth: 60 };
      default: return { padding: '6px 12px', fontSize: 12, minWidth: 50 };
    }
  };
  
  const { padding, fontSize, minWidth } = getDimensions();
  
  const getButtonColors = () => {
    const variants: Record<string, any> = {
      primary: {
        background: active ? colors.secondary : colors.primary,
        color: colors.text,
        border: `1px solid ${colors.secondary}`,
        activeBackground: colors.secondary,
        hoverBackground: colors.secondary,
      },
      secondary: {
        background: active ? colors.secondary : '#1a1a2e',
        color: colors.text,
        border: `1px solid ${colors.primary}`,
        activeBackground: colors.secondary,
        hoverBackground: colors.primary,
      },
      danger: {
        background: active ? '#ff3333' : '#660000',
        color: colors.text,
        border: '1px solid #ff6666',
        activeBackground: '#ff3333',
        hoverBackground: '#990000',
      },
      ghost: {
        background: 'transparent',
        color: active ? colors.secondary : colors.text,
        border: `1px solid ${active ? colors.secondary : 'transparent'}`,
        activeBackground: 'rgba(233, 69, 96, 0.2)',
        hoverBackground: 'rgba(233, 69, 96, 0.1)',
      },
    };
    return variants[variant] || variants.primary;
  };
  
  const { background, color, border, activeBackground, hoverBackground } = getButtonColors();
  
  const handleClick = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    if (disabled) return;
    if (longPressTimeout) {
      clearTimeout(longPressTimeout);
      setLongPressTimeout(null);
    }
    onClick?.();
  }, [disabled, onClick, longPressTimeout]);
  
  const handleMouseDown = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    if (disabled) return;
    e.preventDefault();
    setIsPressed(true);
    setFocusedControl(`button-${String(children).substr(0, 9) || Math.random().toString(36).substr(2, 9)}`);
    const timeout = setTimeout(() => onLongPress?.(), 500);
    setLongPressTimeout(timeout);
  }, [disabled, children, setFocusedControl, onLongPress]);
  
  const handleMouseUp = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    if (disabled) return;
    if (longPressTimeout) {
      clearTimeout(longPressTimeout);
      setLongPressTimeout(null);
    }
    setIsPressed(false);
    setFocusedControl(null);
  }, [disabled, longPressTimeout, setFocusedControl]);
  
  const handleMouseEnter = useCallback(() => {
    if (!disabled) setIsHovered(true);
  }, [disabled]);
  
  const handleMouseLeave = useCallback(() => {
    setIsHovered(false);
  }, []);
  
  const handleTouchStart = useCallback((e: React.TouchEvent<HTMLButtonElement>) => {
    if (disabled) return;
    e.preventDefault();
    setIsPressed(true);
    const timeout = setTimeout(() => onLongPress?.(), 500);
    setLongPressTimeout(timeout);
  }, [disabled, onLongPress]);
  
  const handleTouchEnd = useCallback((e: React.TouchEvent<HTMLButtonElement>) => {
    if (disabled) return;
    if (longPressTimeout) {
      clearTimeout(longPressTimeout);
      setLongPressTimeout(null);
    }
    setIsPressed(false);
    onClick?.();
  }, [disabled, longPressTimeout, onClick]);
  
  useEffect(() => {
    return () => {
      if (longPressTimeout) clearTimeout(longPressTimeout);
    };
  }, [longPressTimeout]);
  
  const buttonStyle: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding,
    fontSize: `${fontSize}px`,
    minWidth,
    background: isPressed ? activeBackground : isHovered ? hoverBackground : background,
    color,
    border,
    borderRadius: variant === 'ghost' ? 0 : 4,
    cursor: disabled ? 'not-allowed' : 'pointer',
    fontFamily: 'inherit',
    fontWeight: 'bold',
    transition: 'all 0.1s ease',
    opacity: disabled ? 0.5 : 1,
    boxShadow: isPressed ? 'inset 0 0 5px rgba(0, 0, 0, 0.5)' : 'none',
    whiteSpace: 'nowrap',
    outline: 'none',
    userSelect: 'none',
    WebkitUserSelect: 'none',
    touchAction: 'manipulation',
    ...style,
  };
  
  return (
    <button
      ref={buttonRef}
      style={buttonStyle}
      className={className}
      onClick={handleClick}
      onDoubleClick={onDoubleClick}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      disabled={disabled}
      tabIndex={disabled ? -1 : 0}
      role="button"
      aria-pressed={active || isPressed}
      aria-disabled={disabled}
    >
      {children}
    </button>
  );
};

export default React.memo(Button);