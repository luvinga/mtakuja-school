const CACHE_NAME = 'mtakuja-app-v7';

// Only cache static assets — never HTML files
// HTML files always load fresh so updates are instant
const STATIC_ASSETS = [
  'script.js',
  'style.css',
  'mtakuja.png',
  'firebase.js',
  'firebase-app-compat.js',
  'firebase-firestore-compat.js',
  'translations.js',
  'firebase-storage-compat.js'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);

  // Always fetch HTML fresh from network
  if (url.pathname.endsWith('.html') || url.pathname === '/') {
    event.respondWith(fetch(event.request));
    return;
  }

  // For static assets use cache-first
  event.respondWith(
    caches.match(event.request).then(response => response || fetch(event.request))
  );
});
