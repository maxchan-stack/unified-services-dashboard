const CACHE_NAME = 'omnihub-shell-v65';
const STATIC_ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './island.html',
  './css/index.css',
  './css/sidebar.css',
  './css/header.css',
  './css/workspace.css',
  './css/smoothjazz.css',
  './css/bulletin.css',
  './css/fund.css',
  './css/grades.css',
  './css/island.css',
  './css/productivity.css',
  './css/settings.css',
  './js/app.js',
  './js/constants.js',
  './js/router.js',
  './js/store.js',
  './js/ui/sidebar.js',
  './js/ui/header.js',
  './js/ui/workspace.js',
  './js/modules/smoothjazz.js',
  './js/modules/bulletin.js',
  './js/modules/fund.js',
  './js/modules/grades.js',
  './js/modules/island.js',
  './js/modules/cleaning.js',
  './js/modules/cross-integration.js',
  './js/modules/productivity.js',
  './js/utils/settings.js',
  './js/utils/helpers.js',
  './js/utils/cloudSync.js'
];

// Install Event - Cache App Shell immediately
self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[ServiceWorker] Pre-caching App Shell v64');
      return cache.addAll(STATIC_ASSETS);
    })
  );
});

// Activate Event - Purge all old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log('[ServiceWorker] Deleting old cache:', cache);
            return caches.delete(cache);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch Event - Network First for local assets to ensure instant code updates
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Pass through external API calls directly
  if (
    url.origin !== self.location.origin ||
    url.pathname.includes('googleapis.com') ||
    url.pathname.includes('cdnstream1.com') ||
    url.pathname.includes('jsonbin.io') ||
    url.pathname.includes('script.google.com')
  ) {
    return;
  }

  // Network First Strategy for Local Assets
  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, responseToCache));
        }
        return networkResponse;
      })
      .catch(() => caches.match(event.request)) // Fallback to cache if offline
  );
});
