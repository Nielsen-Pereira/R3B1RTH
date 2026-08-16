import React, { useEffect, useState } from 'react';
import { useUIStore } from '../../store/uiStore';

interface LEDProps {
  active?: boolean;
  color?: 'red' | 'green' | 'yellow' | 'blue';
  size?: 'small' | 'medium' | 'large';
  blink?: boolean;
  label?: string;
}

const LED: React.FC<LEDProps> = ({
  active = false,
  color = 'red',
  size = 'medium',
  blink = false,
  label,
}) => {
  const [isBlinking, setIsBlinking] = useState(false);
  const colors = useUIStore.getState().colors || {
    ledRed: '#ff0000',
    ledGreen: '#00ff00',
    ledYellow: '#ffff00',
    ledBlue: '#0066ff',
    ledOff: '#333333',
  };

  const getDimensions = () => {
    const sizes = {
      small: { size: 10, border: 1 },
      medium: { size: 14, border: 2 },
      large: { size: 18, border: 3 },
    };
    return sizes[size] || sizes.medium;
  };

  const { size: ledSize, border } = getDimensions();

  const colorMap = {
    red: colors.ledRed || '#ff0000',
    green: colors.ledGreen || '#00ff00',
    yellow: colors.ledYellow || '#ffff00',
    blue: colors.ledBlue || '#0066ff',
  };

  const displayActive = blink ? isBlinking : active;
  const displayColor = displayActive ? colorMap[color] : colors.ledOff || '#333333';

  useEffect(() => {
    if (blink && active) {
      const interval = setInterval(() => {
        setIsBlinking(prev => !prev);
      }, 500);
      return () => clearInterval(interval);
    } else {
      setIsBlinking(false);
    }
  }, [blink, active]);

  const ledStyle = {
    width: ledSize,
    height: ledSize,
    borderRadius: '50%',
    background: displayColor,
    border: border + 'px solid ' + (colors.ledOff || '#111111'),
    boxShadow: displayActive ? '0 0 ' + ledSize + 'px ' + displayColor : 'none',
    display: 'inline-block',
    margin: '2px',
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
      <div
        style={ledStyle}
        role="status"
        aria-label={label || (active ? 'Active' : 'Inactive')}
      />
      {label && (
        <span style={{
          color: useUIStore.getState().colors?.text || '#ffffff',
          fontSize: ledSize * 0.7 + 'px',
          fontFamily: 'inherit'
        }}>
          {label}
        </span>
      )}
    </div>
  );
};

export default React.memo(LED);
