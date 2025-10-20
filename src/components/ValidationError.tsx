import React from 'react';
import { AlertTriangle } from 'lucide-react';

interface ValidationErrorProps {
  message: string;
  isMobile: boolean;
}

export const ValidationError: React.FC<ValidationErrorProps> = ({
  message,
  isMobile,
}) => {
  return (
    <div
      style={{
        color: '#ffffff',
        fontSize: isMobile ? '13px' : '14px',
        marginBottom: isMobile ? '12px' : '16px',
        padding: isMobile ? '10px 14px' : '12px 16px',
        backgroundColor: 'rgb(139 57 19)',
        borderRadius: '6px',
        display: 'flex',
        alignItems: 'center',
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.3)',
        position: 'relative',
      }}
    >
      <AlertTriangle
        size={isMobile ? 18 : 20}
        style={{
          marginRight: isMobile ? '10px' : '12px',
          flexShrink: 0,
        }}
      />
      {message}
    </div>
  );
};
