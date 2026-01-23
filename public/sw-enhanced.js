const CACHE_VERSION = 'rss-feed-reader-v2';
const STATIC_CACHE = `${CACHE_VERSION}-static`;
const DYNAMIC_CACHE = `${CACHE_VERSION}-dynamic`;
const API_CACHE = `${CACHE_VERSION}-api`;

// Cache strategies
const CACHE_STRATEGIES = {
  CACHE_FIRST: 'cache-first',
  NETWORK_FIRST: 'network-first',
  STALE_WHILE_REVALIDATE: 'stale-while-revalidate',
  NETWORK_ONLY: 'network-only',
  CACHE_ONLY: 'cache-only'
};

// Static assets to cache on install
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/vite.svg'
];

// API endpoints that should be cached
const API_ENDPOINTS = [
  '/feeds',
  '/fetch-store'
];

// Cache duration settings (in seconds)
const CACHE_DURATIONS = {
  STATIC: 7 * 24 * 60 * 60, // 7 days
  API: 5 * 60, // 5 minutes
  DYNAMIC: 24 * 60 * 60 // 24 hours
};

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing...');
  
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('Service Worker: Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        console.log('Service Worker: Static assets cached');
        return self.skipWaiting();
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activating...');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (!cacheName.startsWith(CACHE_VERSION)) {
              console.log('Service Worker: Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('Service Worker: Activated');
        return self.clients.claim();
      })
  );
});

// Determine cache strategy based on request
const getCacheStrategy = (request) => {
  const url = new URL(request.url);
  
  // Static assets - cache first
  if (request.destination === 'script' || 
      request.destination === 'style' || 
      request.destination === 'image' ||
      request.destination === 'font') {
    return CACHE_STRATEGIES.CACHE_FIRST;
  }
  
  // API requests - network first with fallback
  if (url.pathname.startsWith('/api/') || 
      API_ENDPOINTS.some(endpoint => url.pathname.includes(endpoint))) {
    return CACHE_STRATEGIES.NETWORK_FIRST;
  }
  
  // Navigation requests - stale while revalidate
  if (request.mode === 'navigate') {
    return CACHE_STRATEGIES.STALE_WHILE_REVALIDATE;
  }
  
  // Default - network first
  return CACHE_STRATEGIES.NETWORK_FIRST;
};

// Cache-first strategy
const cacheFirst = async (request, cacheName = DYNAMIC_CACHE) => {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  
  if (cached) {
    // Check if cache is still valid
    const dateHeader = cached.headers.get('date');
    if (dateHeader) {
      const cacheTime = new Date(dateHeader).getTime();
      const now = Date.now();
      const maxAge = cacheName === STATIC_CACHE ? CACHE_DURATIONS.STATIC : 
                   cacheName === API_CACHE ? CACHE_DURATIONS.API : 
                   CACHE_DURATIONS.DYNAMIC;
      
      if ((now - cacheTime) / 1000 < maxAge) {
        return cached;
      }
    }
  }
  
  try {
    const response = await fetch(request);
    if (response.ok) {
      const responseToCache = response.clone();
      const responseWithDate = new Response(responseToCache.body, {
        status: responseToCache.status,
        statusText: responseToCache.statusText,
        headers: {
          ...responseToCache.headers,
          'date': new Date().toUTCString(),
          'cache-control': `max-age=${cacheName === STATIC_CACHE ? CACHE_DURATIONS.STATIC : 
                           cacheName === API_CACHE ? CACHE_DURATIONS.API : 
                           CACHE_DURATIONS.DYNAMIC}`
        }
      });
      await cache.put(request, responseWithDate);
    }
    return response;
  } catch (error) {
    // Return cached version if network fails
    return cached || new Response('Offline', { status: 503 });
  }
};

// Network-first strategy
const networkFirst = async (request, cacheName = API_CACHE) => {
  const cache = await caches.open(cacheName);
  
  try {
    const response = await fetch(request);
    if (response.ok) {
      const responseToCache = response.clone();
      const responseWithDate = new Response(responseToCache.body, {
        status: responseToCache.status,
        statusText: responseToCache.statusText,
        headers: {
          ...responseToCache.headers,
          'date': new Date().toUTCString(),
          'cache-control': `max-age=${CACHE_DURATIONS.API}`
        }
      });
      await cache.put(request, responseWithDate);
    }
    return response;
  } catch (error) {
    const cached = await cache.match(request);
    if (cached) {
      return cached;
    }
    
    // Return appropriate offline response
    if (request.url.includes('/api/')) {
      return new Response(
        JSON.stringify({ 
          error: 'Offline - No network connection available',
          offline: true,
          timestamp: Date.now()
        }),
        {
          status: 503,
          statusText: 'Service Unavailable',
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }
    
    return new Response('Offline', { status: 503 });
  }
};

// Stale-while-revalidate strategy
const staleWhileRevalidate = async (request, cacheName = DYNAMIC_CACHE) => {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  
  // Always try to update the cache
  const fetchPromise = fetch(request).then(async (response) => {
    if (response.ok) {
      const responseToCache = response.clone();
      const responseWithDate = new Response(responseToCache.body, {
        status: responseToCache.status,
        statusText: responseToCache.statusText,
        headers: {
          ...responseToCache.headers,
          'date': new Date().toUTCString()
        }
      });
      await cache.put(request, responseWithDate);
    }
    return response;
  });
  
  // Return cached version immediately, or wait for network
  return cached || fetchPromise;
};

// Main fetch event handler
self.addEventListener('fetch', (event) => {
  const strategy = getCacheStrategy(event.request);
  
  switch (strategy) {
    case CACHE_STRATEGIES.CACHE_FIRST:
      event.respondWith(cacheFirst(event.request, STATIC_CACHE));
      break;
      
    case CACHE_STRATEGIES.NETWORK_FIRST:
      event.respondWith(networkFirst(event.request, API_CACHE));
      break;
      
    case CACHE_STRATEGIES.STALE_WHILE_REVALIDATE:
      event.respondWith(staleWhileRevalidate(event.request, DYNAMIC_CACHE));
      break;
      
    case CACHE_STRATEGIES.NETWORK_ONLY:
      event.respondWith(fetch(event.request));
      break;
      
    case CACHE_STRATEGIES.CACHE_ONLY:
      event.respondWith(caches.match(event.request));
      break;
      
    default:
      event.respondWith(networkFirst(event.request));
  }
});

// Enhanced background sync
self.addEventListener('sync', (event) => {
  console.log('Service Worker: Background sync triggered', event.tag);
  
  if (event.tag === 'background-sync-feeds') {
    event.waitUntil(syncFeeds());
  } else if (event.tag === 'background-sync-bookmarks') {
    event.waitUntil(syncBookmarks());
  } else if (event.tag === 'background-sync-prefs') {
    event.waitUntil(syncPreferences());
  }
});

// Sync feeds when online
async function syncFeeds() {
  try {
    // Get cached feed URLs
    const cache = await caches.open(API_CACHE);
    const feedsResponse = await cache.match('/feeds');
    
    if (feedsResponse) {
      const feeds = await feedsResponse.json();
      
      // Sync each feed
      for (const feed of feeds) {
        try {
          const response = await fetch(`/api/fetch-store?url=${encodeURIComponent(feed.url)}`);
          if (response.ok) {
            console.log(`Service Worker: Synced feed ${feed.name}`);
          }
        } catch (error) {
          console.error(`Service Worker: Failed to sync feed ${feed.name}`, error);
        }
      }
    }
    
    // Notify clients about sync completion
    const clients = await self.clients.matchAll();
    clients.forEach(client => {
      client.postMessage({
        type: 'SYNC_COMPLETE',
        payload: { timestamp: Date.now() }
      });
    });
    
  } catch (error) {
    console.error('Service Worker: Feed sync failed', error);
  }
}

// Sync bookmarks when online
async function syncBookmarks() {
  try {
    // Get bookmarks from IndexedDB or localStorage
    const bookmarks = await getBookmarksFromStorage();
    
    // Sync with server
    const response = await fetch('/api/bookmarks/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bookmarks })
    });
    
    if (response.ok) {
      console.log('Service Worker: Bookmarks synced successfully');
    }
    
  } catch (error) {
    console.error('Service Worker: Bookmark sync failed', error);
  }
}

// Sync preferences when online
async function syncPreferences() {
  try {
    const preferences = await getPreferencesFromStorage();
    
    const response = await fetch('/api/preferences/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ preferences })
    });
    
    if (response.ok) {
      console.log('Service Worker: Preferences synced successfully');
    }
    
  } catch (error) {
    console.error('Service Worker: Preference sync failed', error);
  }
}

// Helper functions for storage
async function getBookmarksFromStorage() {
  // This would integrate with IndexedDB or localStorage
  return [];
}

async function getPreferencesFromStorage() {
  // This would integrate with IndexedDB or localStorage
  return {};
}

// Enhanced push notifications
self.addEventListener('push', (event) => {
  console.log('Service Worker: Push notification received');
  
  let notificationData = {
    title: 'RSS Feed Reader',
    body: 'New RSS feed updates available',
    icon: '/vite.svg',
    badge: '/vite.svg',
    tag: 'rss-updates',
    renotify: true,
    requireInteraction: false,
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'refresh',
        title: 'Refresh Feeds',
        icon: '/vite.svg'
      },
      {
        action: 'dismiss',
        title: 'Dismiss',
        icon: '/vite.svg'
      }
    ]
  };
  
  if (event.data) {
    try {
      const data = event.data.json();
      notificationData = { ...notificationData, ...data };
    } catch (error) {
      notificationData.body = event.data.text();
    }
  }
  
  event.waitUntil(
    self.registration.showNotification(notificationData.title, notificationData)
  );
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  console.log('Service Worker: Notification click received');
  
  event.notification.close();
  
  if (event.action === 'refresh') {
    // Trigger background sync
    self.registration.sync.register('background-sync-feeds');
  }
  
  // Focus or open the app
  event.waitUntil(
    clients.matchAll().then((clientList) => {
      for (const client of clientList) {
        if (client.url === '/' && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow('/');
      }
    })
  );
});

// Periodic background sync (if supported)
if ('periodicSync' in self.registration) {
  self.addEventListener('periodicsync', (event) => {
    if (event.tag === 'periodic-feed-sync') {
      event.waitUntil(syncFeeds());
    }
  });
}

// Message handling from clients
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'CACHE_URLS') {
    event.waitUntil(
      caches.open(DYNAMIC_CACHE)
        .then((cache) => cache.addAll(event.data.urls))
    );
  }
});
