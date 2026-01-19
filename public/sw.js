const CACHE_NAME = 'rss-feed-reader-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  '/src/main.jsx',
  '/src/App.tsx',
  '/src/App.css',
  '/src/styles/variables.css',
  '/src/styles/components.css',
  '/src/styles/utilities.css',
  '/src/styles/responsive.css'
];

// Install event - cache resources
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

// Fetch event - serve from cache when offline
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Cache hit - return response
        if (response) {
          return response;
        }

        // Clone the request
        const fetchRequest = event.request.clone();

        return fetch(fetchRequest).then(
          (response) => {
            // Check if valid response
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // Clone the response
            const responseToCache = response.clone();

            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, responseToCache);
              });

            return response;
          }
        ).catch(() => {
          // If fetch fails, try to serve from cache for GET requests
          if (event.request.method === 'GET') {
            return caches.match(event.request);
          }
          
          // For API requests, return a custom offline response
          if (event.request.url.includes('/api/')) {
            return new Response(
              JSON.stringify({ 
                error: 'Offline - No network connection available',
                offline: true 
              }),
              {
                status: 503,
                statusText: 'Service Unavailable',
                headers: { 'Content-Type': 'application/json' }
              }
            );
          }
        });
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Background sync for when connection is restored
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    event.waitUntil(
      // Sync any pending actions
      console.log('Background sync triggered')
    );
  }
});

// Push notifications
self.addEventListener('push', (event) => {
  const options = {
    body: event.data ? event.data.text() : 'New RSS feed updates available',
    icon: '/vite.svg',
    badge: '/vite.svg',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: 'Explore updates',
        icon: '/vite.svg'
      },
      {
        action: 'close',
        title: 'Close notification',
        icon: '/vite.svg'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification('RSS Feed Reader', options)
  );
});
