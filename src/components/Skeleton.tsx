import React from 'react';

interface SkeletonProps {
    variant?: 'text' | 'circular' | 'rectangular';
    width?: string;
    height?: string;
    lines?: number;
    className?: string;
    style?: React.CSSProperties;
}

const Skeleton = ({ 
    variant = 'text', 
    width, 
    height, 
    lines = 1, 
    className = '',
    style = {}
}: SkeletonProps) => {
    const baseStyle: React.CSSProperties = {
        background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
        backgroundSize: '200% 100%',
        animation: 'skeleton-loading 1.5s infinite',
        borderRadius: '4px',
        ...style
    };

    if (width) baseStyle.width = width;
    if (height) baseStyle.height = height;

    switch (variant) {
        case 'text':
            return (
                <div className={`skeleton-text ${className}`} style={baseStyle}>
                    {lines > 1 && (
                        <div>
                            {Array.from({ length: lines }, (_, i) => (
                                <div
                                    key={i}
                                    style={{
                                        height: '1em',
                                        marginBottom: i < lines - 1 ? '0.5em' : '0',
                                        width: i === lines - 1 ? '70%' : '100%'
                                    }}
                                />
                            ))}
                        </div>
                    )}
                </div>
            );
        
        case 'circular':
            return (
                <div 
                    className={`skeleton-circular ${className}`}
                    style={{
                        ...baseStyle,
                        borderRadius: '50%'
                    }}
                />
            );
        
        case 'rectangular':
            return (
                <div 
                    className={`skeleton-rectangular ${className}`}
                    style={baseStyle}
                />
            );
        
        default:
            return null;
    }
};

// Specialized skeleton components
export const FeedItemSkeleton = () => (
    <div style={{
        padding: 'var(--spacing-lg)',
        backgroundColor: 'var(--bg-tertiary)',
        borderRadius: 'var(--radius-md)',
        border: '1px solid var(--border-primary)',
        marginBottom: 'var(--spacing-lg)'
    }}>
        <Skeleton variant="text" height="1.5rem" style={{ marginBottom: 'var(--spacing-sm)' }} />
        <Skeleton variant="text" lines={3} style={{ marginBottom: 'var(--spacing-md)' }} />
        <Skeleton variant="rectangular" width="120px" height="32px" />
    </div>
);

export const FeedSelectorSkeleton = () => (
    <div style={{ textAlign: 'center', padding: 'var(--spacing-lg)' }}>
        <Skeleton variant="text" height="1.5rem" style={{ marginBottom: 'var(--spacing-md)' }} />
        <Skeleton variant="rectangular" height="40px" width="200px" />
    </div>
);

export const CustomFeedInputSkeleton = () => (
    <div style={{ textAlign: 'center', padding: 'var(--spacing-lg)' }}>
        <Skeleton variant="text" height="1.5rem" style={{ marginBottom: 'var(--spacing-md)' }} />
        <Skeleton variant="rectangular" height="40px" width="300px" />
    </div>
);

export const InlineSpinner = ({ size = 'small' }: { size?: 'small' | 'medium' | 'large' }) => {
    const sizeMap = {
        small: '16px',
        medium: '24px',
        large: '32px'
    };

    return (
        <div 
            className="loading-spinner"
            style={{
                width: sizeMap[size],
                height: sizeMap[size],
                border: '2px solid var(--border-primary)',
                borderTop: `2px solid var(--color-primary)`,
                borderRadius: '50%',
                display: 'inline-block',
                verticalAlign: 'middle'
            }}
        />
    );
};

export const LoadingSpinner = ({ text, size = 'medium' }: { 
    text?: string; 
    size?: 'small' | 'medium' | 'large' 
}) => (
    <div style={{ 
        textAlign: 'center', 
        padding: 'var(--spacing-xl)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 'var(--spacing-md)'
    }}>
        <InlineSpinner size={size} />
        {text && (
            <p style={{ 
                margin: 0, 
                color: 'var(--text-secondary)',
                fontSize: 'var(--font-size-sm)'
            }}>
                {text}
            </p>
        )}
    </div>
);

Skeleton.displayName = 'Skeleton';
FeedItemSkeleton.displayName = 'FeedItemSkeleton';
FeedSelectorSkeleton.displayName = 'FeedSelectorSkeleton';
CustomFeedInputSkeleton.displayName = 'CustomFeedInputSkeleton';
InlineSpinner.displayName = 'InlineSpinner';
LoadingSpinner.displayName = 'LoadingSpinner';

export default Skeleton;
