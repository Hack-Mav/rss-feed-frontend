import { memo } from 'react';
import { useOffline } from '../hooks/useOffline';

const OfflineStatus = memo(() => {
    const { isOnline, isOffline, serviceWorkerReady } = useOffline();

    if (isOnline && serviceWorkerReady) {
        return null;
    }

    return (
        <div 
            className="offline-status"
            style={{
                position: 'fixed',
                bottom: '1rem',
                left: '1rem',
                right: '1rem',
                backgroundColor: isOffline ? 'var(--color-warning)' : 'var(--color-info)',
                color: 'var(--text-white)',
                padding: 'var(--spacing-sm) var(--spacing-md)',
                borderRadius: 'var(--radius-md)',
                boxShadow: 'var(--shadow-lg)',
                zIndex: 'var(--z-fixed)',
                textAlign: 'center',
                fontSize: 'var(--font-size-sm)',
                transition: 'var(--transition-base)',
                maxWidth: '400px',
                margin: '0 auto'
            }}
            role="status"
            aria-live="polite"
        >
            {isOffline ? (
                <div>
                    <strong>📡 Offline Mode</strong>
                    <div style={{ fontSize: 'var(--font-size-xs)', marginTop: 'var(--spacing-xs)' }}>
                        You're currently offline. Some features may be limited.
                    </div>
                </div>
            ) : (
                <div>
                    <strong>🔄 Setting up offline support...</strong>
                    <div style={{ fontSize: 'var(--font-size-xs)', marginTop: 'var(--spacing-xs)' }}>
                        Service worker is being configured.
                    </div>
                </div>
            )}
        </div>
    );
});

OfflineStatus.displayName = 'OfflineStatus';

export default OfflineStatus;
