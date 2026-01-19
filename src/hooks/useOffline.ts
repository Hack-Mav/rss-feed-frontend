import { useState, useEffect, useCallback } from 'react';

export const useOffline = () => {
    const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
    const [serviceWorkerReady, setServiceWorkerReady] = useState<boolean>(false);

    useEffect(() => {
        const handleOnline = () => setIsOnline(true);
        const handleOffline = () => setIsOnline(false);

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    useEffect(() => {
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.ready
                .then((registration) => {
                    console.log('Service Worker is ready:', registration);
                    setServiceWorkerReady(true);
                })
                .catch((error) => {
                    console.error('Service Worker registration failed:', error);
                });

            // Register service worker
            navigator.serviceWorker.register('/sw.js')
                .then((registration) => {
                    console.log('Service Worker registered:', registration);
                })
                .catch((error) => {
                    console.error('Service Worker registration failed:', error);
                });
        }
    }, []);

    const requestNotificationPermission = useCallback(async (): Promise<boolean> => {
        if ('Notification' in window && 'serviceWorker' in navigator) {
            try {
                const permission = await Notification.requestPermission();
                return permission === 'granted';
            } catch (error) {
                console.error('Notification permission request failed:', error);
                return false;
            }
        }
        return false;
    }, []);

    const showNotification = useCallback(async (title: string, options: NotificationOptions = {}): Promise<boolean> => {
        if ('serviceWorker' in navigator && 'Notification' in window) {
            try {
                const registration = await navigator.serviceWorker.ready;
                await registration.showNotification(title, {
                    icon: '/vite.svg',
                    badge: '/vite.svg',
                    ...options
                });
                return true;
            } catch (error) {
                console.error('Failed to show notification:', error);
                return false;
            }
        }
        return false;
    }, []);

    const syncWhenOnline = useCallback(async (): Promise<boolean> => {
        if ('serviceWorker' in navigator && 'sync' in ServiceWorkerRegistration.prototype) {
            try {
                const registration = await navigator.serviceWorker.ready;
                await (registration as any).sync.register('background-sync');
                return true;
            } catch (error) {
                console.error('Background sync registration failed:', error);
                return false;
            }
        }
        return false;
    }, []);

    return {
        isOnline,
        isOffline: !isOnline,
        serviceWorkerReady,
        requestNotificationPermission,
        showNotification,
        syncWhenOnline
    };
};
