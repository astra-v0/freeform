import React from 'react';
import { ThemeUtils } from '../utils/themeUtils.js';

interface NavigationButtonsProps {
  canGoBack: boolean;
  onBack: () => void;
  onNext: () => void;
  nextButtonText: string;
  nextButtonStyle: 'filled' | 'outlined' | 'ghost' | 'link' | 'none';
  nextButtonIcon?: string;
  theme: {
    backgroundColor: string;
    textColor: string;
    accentColor: string;
  };
  isMobile: boolean;
}

export const NavigationButtons: React.FC<NavigationButtonsProps> = ({
  canGoBack,
  onBack,
  onNext,
  nextButtonText,
  nextButtonStyle,
  nextButtonIcon,
  theme,
  isMobile,
}) => {
  const getButtonStyle = (): React.CSSProperties => {
    const baseStyle: React.CSSProperties = {
      border: 'none',
      padding: isMobile ? '14px 28px' : '12px 32px',
      fontSize: isMobile ? '15px' : '16px',
      fontWeight: '500',
      borderRadius: '8px',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      minHeight: '44px',
      minWidth: isMobile ? '80px' : 'auto',
      touchAction: 'manipulation',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '8px',
    };

    switch (nextButtonStyle) {
      case 'outlined':
        return {
          ...baseStyle,
          backgroundColor: 'transparent',
          color: theme.accentColor,
          border: `2px solid ${theme.accentColor}`,
        };
      case 'ghost':
        return {
          ...baseStyle,
          backgroundColor: 'transparent',
          color: theme.accentColor,
          border: 'none',
        };
      case 'link':
        return {
          ...baseStyle,
          backgroundColor: 'transparent',
          color: theme.accentColor,
          border: 'none',
          textDecoration: 'underline',
          padding: '8px 16px',
        };
      case 'none':
        return {
          ...baseStyle,
          display: 'none',
        };
      case 'filled':
      default:
        return {
          ...baseStyle,
          backgroundColor: theme.accentColor,
          color: '#1a1a1a',
        };
    }
  };

  const buttonStyle = getButtonStyle();

  const backButtonStyle: React.CSSProperties = {
    background: 'transparent',
    color: '#cccccc',
    border: `1px solid ${ThemeUtils.lightenColor(theme.backgroundColor, 50)}`,
    borderRadius: '8px',
    padding: isMobile ? '14px 28px' : '12px 32px',
    fontSize: isMobile ? '15px' : '16px',
    cursor: 'pointer',
    minHeight: '44px',
    minWidth: isMobile ? '80px' : 'auto',
    touchAction: 'manipulation',
  };

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        gap: isMobile ? '8px' : '12px',
      }}
    >
      {canGoBack ? (
        <button onClick={onBack} style={backButtonStyle}>
          Back
        </button>
      ) : (
        <div></div>
      )}

      {nextButtonStyle !== 'none' && (
        <button onClick={onNext} style={buttonStyle}>
          {nextButtonIcon && (
            <img 
              src={nextButtonIcon} 
              alt="" 
              style={{ 
                width: '16px', 
                height: '16px',
                objectFit: 'contain'
              }} 
            />
          )}
          {nextButtonText}
        </button>
      )}
    </div>
  );
};
