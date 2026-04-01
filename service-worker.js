const CACHE_NAME = 'mtakuja-app-v1';
const FILES_TO_CACHE = [
  'index.html',
  'attendance.html',
  'attendance-records.html',
  'grades.html',
  'grades-records.html',
  'notices.html',
  'parent-attendance.html',
  'parent-dashboard.html',
  'parent-grades.html',
  'students.html',
  'teacher-dashboard.html',
  'script.js',
  'style.css',
  'mtakuja.png'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(FILES_TO_CACHE))
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => response || fetch(event.request))
  );
});
