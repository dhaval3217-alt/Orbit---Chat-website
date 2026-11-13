// Orbit Service Worker — versioned for cache-busting on every deploy
// Bump this version string any time you want clients to receive fresh assets.
const CACHE_VERSION = 'orbit-v2.0.4';
const CACHE_NAME = CACHE_VERSION;
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/orbit-logo.svg',
  '/manifest.webmanifest'
];

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  // Activate immediately — don't wait for old tabs to close
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => {
            console.log('[SW] Deleting old cache:', name);
            return caches.delete(name);
          })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  // Never intercept API calls, Socket.io, or non-GET requests
  if (
    event.request.url.includes('/api/') ||
    event.request.url.includes('/socket.io/') ||
    event.request.method !== 'GET'
  ) {
    return;
  }

  // Network-first for navigation so users always get the latest HTML
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(() => caches.match('/index.html'))
    );
    return;
  }

  // Cache-first for static assets (JS/CSS bundles are content-hashed)
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) return cachedResponse;
      return fetch(event.request).then((networkResponse) => {
        // Cache a clone for next time
        if (networkResponse.ok) {
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, networkResponse.clone());
          });
        }
        return networkResponse;
      }).catch(() => caches.match('/index.html'));
    })
  );
});
