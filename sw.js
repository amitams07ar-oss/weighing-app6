const CACHE_NAME = 'weighing-calc-cache-v9';
// This list MUST perfectly match the files that are available on your server.
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icons/android-launcher-icon-48-48.png',
  '/icons/android-launcher-icon-72-72.png',
  '/icons/android-launcher-icon-96-96.png',
  '/icons/android-launcher-icon-144-144.png',
  '/icons/android-launcher-icon-192-192.png',
  '/icons/android-launcher-icon-512-512.png'
];

self.addEventListener('install', event => {
  // Force the waiting service worker to become the active service worker.
  self.skipWaiting();
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache and caching app shell');
        return cache.addAll(urlsToCache);
      })
      .catch(error => {
        console.error('Failed to cache app shell. Make sure all files in urlsToCache exist on the server.', error);
      })
  );
});

self.addEventListener('fetch', event => {
  // Use a network-first, falling back to cache strategy.
  event.respondWith(
    caches.open(CACHE_NAME).then(cache => {
      return fetch(event.request)
        .then(response => {
          // If we get a valid response, update the cache.
          if (response && response.status === 200) {
            cache.put(event.request.url, response.clone());
          }
          return response;
        })
        .catch(err => {
          // Network request failed, serve from cache.
          return cache.match(event.request);
        });
    })
  );
});

self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});