import { useState, useEffect, useCallback } from 'react';

export interface ServiceWorkerState {
  isSupported: boolean;
  isInstalled: boolean;
  isActivated: boolean;
  isOnline: boolean;
  registration: ServiceWorkerRegistration | null;
  lastSyncTime: number | null;
}

export const useServiceWorker = () => {
  const [state, setState] = useState<ServiceWorkerState>({
    isSupported: false,
    isInstalled: false,
    isActivated: false,
    isOnline: navigator.onLine,
    registration: null,
    lastSyncTime: null
  });

  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [offlineContent, setOfflineContent] = useState<any[]>([]);

  // Check service worker support
  useEffect(() => {
    const isSupported = 'serviceWorker' in navigator;
    setState(prev => ({ ...prev, isSupported }));
  }, []);

  // Register service worker
  useEffect(() => {
    if (!state.isSupported) return;

    const registerSW = async () => {
      try {
        const registration = await navigator.serviceWorker.register('/sw-enhanced.js');
        
        setState(prev => ({
          ...prev,
          registration,
          isInstalled: true
        }));

        // Check for updates
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                setUpdateAvailable(true);
              }
            });
          }
        });

        // Listen for controlling changes
        navigator.serviceWorker.addEventListener('controllerchange', () => {
          window.location.reload();
        });

        // Listen for messages from service worker
        navigator.serviceWorker.addEventListener('message', (event) => {
          if (event.data.type === 'SYNC_COMPLETE') {
            setState(prev => ({
              ...prev,
              lastSyncTime: event.data.payload.timestamp
            }));
          }
        });

        console.log('Service Worker: Registered successfully');
      } catch (error) {
        console.error('Service Worker: Registration failed', error);
      }
    };

    registerSW();
  }, [state.isSupported]);

  // Monitor online/offline status
  useEffect(() => {
    const handleOnline = () => setState(prev => ({ ...prev, isOnline: true }));
    const handleOffline = () => setState(prev => ({ ...prev, isOnline: false }));

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Trigger background sync
  const triggerSync = useCallback(async (tag: string = 'background-sync-feeds') => {
    if (!state.registration || !state.isOnline) return false;

    try {
      // Type assertion for background sync API
      const registration = state.registration as any;
      if ('sync' in registration) {
        await registration.sync.register(tag);
        console.log(`Service Worker: Background sync registered for ${tag}`);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Service Worker: Background sync registration failed', error);
      return false;
    }
  }, [state.registration, state.isOnline]);

  // Subscribe to push notifications
  const subscribeToPush = useCallback(async () => {
    if (!state.registration) return null;

    try {
      const subscription = await state.registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array('YOUR_VAPID_PUBLIC_KEY')
      });

      // Send subscription to server
      await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(subscription)
      });

      console.log('Service Worker: Push subscription successful');
      return subscription;
    } catch (error) {
      console.error('Service Worker: Push subscription failed', error);
      return null;
    }
  }, [state.registration]);

  // Unsubscribe from push notifications
  const unsubscribeFromPush = useCallback(async () => {
    if (!state.registration) return false;

    try {
      const subscription = await state.registration.pushManager.getSubscription();
      if (subscription) {
        await subscription.unsubscribe();
        await fetch('/api/push/unsubscribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(subscription)
        });
        console.log('Service Worker: Push unsubscribed successfully');
        return true;
      }
      return false;
    } catch (error) {
      console.error('Service Worker: Push unsubscribe failed', error);
      return false;
    }
  }, [state.registration]);

  // Get cached content
  const getCachedContent = useCallback(async (url: string) => {
    if (!state.isSupported) return null;

    try {
      const cache = await caches.open('rss-feed-reader-v2-dynamic');
      const response = await cache.match(url);
      return response ? await response.json() : null;
    } catch (error) {
      console.error('Service Worker: Failed to get cached content', error);
      return null;
    }
  }, [state.isSupported]);

  // Cache content manually
  const cacheContent = useCallback(async (url: string, data: any) => {
    if (!state.isSupported) return false;

    try {
      const cache = await caches.open('rss-feed-reader-v2-dynamic');
      const response = new Response(JSON.stringify(data), {
        headers: { 'Content-Type': 'application/json' }
      });
      await cache.put(url, response);
      return true;
    } catch (error) {
      console.error('Service Worker: Failed to cache content', error);
      return false;
    }
  }, [state.isSupported]);

  // Clear cache
  const clearCache = useCallback(async () => {
    if (!state.isSupported) return false;

    try {
      const cacheNames = await caches.keys();
      await Promise.all(
        cacheNames.map(cacheName => caches.delete(cacheName))
      );
      console.log('Service Worker: Cache cleared successfully');
      return true;
    } catch (error) {
      console.error('Service Worker: Cache clear failed', error);
      return false;
    }
  }, [state.isSupported]);

  // Apply service worker update
  const applyUpdate = useCallback(() => {
    if (state.registration && state.registration.waiting) {
      state.registration.waiting.postMessage({ type: 'SKIP_WAITING' });
    }
  }, [state.registration]);

  // Get offline content
  const getOfflineContent = useCallback(async () => {
    const content = await getCachedContent('/feeds');
    if (content) {
      setOfflineContent(content);
    }
  }, [getCachedContent]);

  // Load offline content on mount
  useEffect(() => {
    getOfflineContent();
  }, [getOfflineContent]);

  return {
    ...state,
    updateAvailable,
    offlineContent,
    triggerSync,
    subscribeToPush,
    unsubscribeFromPush,
    getCachedContent,
    cacheContent,
    clearCache,
    applyUpdate,
    getOfflineContent
  };
};

// Helper function to convert VAPID key
function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}
