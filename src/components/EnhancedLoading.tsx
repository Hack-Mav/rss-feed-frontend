import React from 'react';

interface EnhancedLoadingProps {
  type?: 'spinner' | 'dots' | 'progress' | 'skeleton';
  text?: string;
  size?: 'small' | 'medium' | 'large';
  className?: string;
}

export const EnhancedLoading: React.FC<EnhancedLoadingProps> = ({
  type = 'spinner',
  text,
  size = 'medium',
  className = ''
}) => {
  const sizeClasses = {
    small: 'w-4 h-4',
    medium: 'w-8 h-8',
    large: 'w-12 h-12'
  };

  const textSizeClasses = {
    small: 'text-sm',
    medium: 'text-base',
    large: 'text-lg'
  };

  const renderLoadingContent = () => {
    switch (type) {
      case 'dots':
        return (
          <div className="loading-dots">
            <span></span>
            <span></span>
            <span></span>
          </div>
        );
      
      case 'progress':
        return (
          <div className="progress-bar">
            <div className="progress-bar-fill"></div>
          </div>
        );
      
      case 'skeleton':
        return (
          <div className="space-y-3">
            <div className="skeleton-text title"></div>
            <div className="skeleton-text subtitle"></div>
            <div className="skeleton-text paragraph"></div>
            <div className="skeleton-text paragraph"></div>
            <div className="skeleton-text paragraph" style={{ width: '80%' }}></div>
          </div>
        );
      
      case 'spinner':
      default:
        return (
          <div className={`loading-spinner ${sizeClasses[size]}`}></div>
        );
    }
  };

  return (
    <div className={`flex flex-col items-center justify-center space-y-4 ${className}`}>
      {renderLoadingContent()}
      {text && (
        <p className={`${textSizeClasses[size]} text-muted animate-pulse`}>
          {text}
        </p>
      )}
    </div>
  );
};

export default EnhancedLoading;
