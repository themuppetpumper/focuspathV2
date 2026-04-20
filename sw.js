// FocusPath Offline Service Worker
// Caches all app files on install for full offline use

const CACHE_NAME = 'focuspath-v5';

const PRECACHE_URLS = [
  'index.html',
  'home.html',
  'help.html',
  'test.html',
  'flashcards.html',
  'stats.html',
  'test-builder.html',
  'test-runner.html',
  'card-builder.html',
  'card-runner.html',
  'pomodoro.html',
  'goals.html',
  'journal.html',
  'planner.html',
  'habits.html',
  'notes.html',
  'compare.html',
  'themes.js',
  'achievements.js',
  'quotes.js',
  'icons.js',
  'card-builder.js',
  'card-runner.js',
  'test-builder.js',
  'test-runner.js',
  'tools-drawer.js',
  'manifest.json',
  'vendor/tailwind.js',
  'vendor/chart.umd.min.js',
  'vendor/fonts/lexend.css',
  'vendor/fonts/lexend-latin.woff2',
  'vendor/fonts/lexend-latin-ext.woff2',
  'vendor/fonts/lexend-vietnamese.woff2',
  'vendor/fonts/gaegu.css',
  'vendor/fonts/gaegu-regular.woff2',
  'vendor/fonts/gaegu-bold.woff2',
  // Buddy assets
  'buddy-test/metadata.json',
  'buddy-test/rotations/south.png',
  'buddy-test/rotations/north.png',
  'buddy-test/rotations/east.png',
  'buddy-test/rotations/west.png',
  'buddy-test/rotations/north-east.png',
  'buddy-test/rotations/north-west.png',
  'buddy-test/rotations/south-east.png',
  'buddy-test/rotations/south-west.png',
  'buddy-test/animations/walking-8-frames/south/frame_000.png',
  'buddy-test/animations/walking-8-frames/south/frame_001.png',
  'buddy-test/animations/walking-8-frames/south/frame_002.png',
  'buddy-test/animations/walking-8-frames/south/frame_003.png',
  'buddy-test/animations/walking-8-frames/south/frame_004.png',
  'buddy-test/animations/walking-8-frames/south/frame_005.png',
  'buddy-test/animations/walking-8-frames/south/frame_006.png',
  'buddy-test/animations/walking-8-frames/south/frame_007.png',
  'buddy-test/animations/walking-8-frames/north/frame_000.png',
  'buddy-test/animations/walking-8-frames/north/frame_001.png',
  'buddy-test/animations/walking-8-frames/north/frame_002.png',
  'buddy-test/animations/walking-8-frames/north/frame_003.png',
  'buddy-test/animations/walking-8-frames/north/frame_004.png',
  'buddy-test/animations/walking-8-frames/north/frame_005.png',
  'buddy-test/animations/walking-8-frames/north/frame_006.png',
  'buddy-test/animations/walking-8-frames/north/frame_007.png',
  'buddy-test/animations/walking-8-frames/east/frame_000.png',
  'buddy-test/animations/walking-8-frames/east/frame_001.png',
  'buddy-test/animations/walking-8-frames/east/frame_002.png',
  'buddy-test/animations/walking-8-frames/east/frame_003.png',
  'buddy-test/animations/walking-8-frames/east/frame_004.png',
  'buddy-test/animations/walking-8-frames/east/frame_005.png',
  'buddy-test/animations/walking-8-frames/east/frame_006.png',
  'buddy-test/animations/walking-8-frames/east/frame_007.png',
  'buddy-test/animations/walking-8-frames/west/frame_000.png',
  'buddy-test/animations/walking-8-frames/west/frame_001.png',
  'buddy-test/animations/walking-8-frames/west/frame_002.png',
  'buddy-test/animations/walking-8-frames/west/frame_003.png',
  'buddy-test/animations/walking-8-frames/west/frame_004.png',
  'buddy-test/animations/walking-8-frames/west/frame_005.png',
  'buddy-test/animations/walking-8-frames/west/frame_006.png',
  'buddy-test/animations/walking-8-frames/west/frame_007.png',
  'buddy-test/animations/walking-8-frames/north-east/frame_000.png',
  'buddy-test/animations/walking-8-frames/north-east/frame_001.png',
  'buddy-test/animations/walking-8-frames/north-east/frame_002.png',
  'buddy-test/animations/walking-8-frames/north-east/frame_003.png',
  'buddy-test/animations/walking-8-frames/north-east/frame_004.png',
  'buddy-test/animations/walking-8-frames/north-east/frame_005.png',
  'buddy-test/animations/walking-8-frames/north-east/frame_006.png',
  'buddy-test/animations/walking-8-frames/north-east/frame_007.png',
  'buddy-test/animations/walking-8-frames/north-west/frame_000.png',
  'buddy-test/animations/walking-8-frames/north-west/frame_001.png',
  'buddy-test/animations/walking-8-frames/north-west/frame_002.png',
  'buddy-test/animations/walking-8-frames/north-west/frame_003.png',
  'buddy-test/animations/walking-8-frames/north-west/frame_004.png',
  'buddy-test/animations/walking-8-frames/north-west/frame_005.png',
  'buddy-test/animations/walking-8-frames/north-west/frame_006.png',
  'buddy-test/animations/walking-8-frames/north-west/frame_007.png',
  'buddy-test/animations/walking-8-frames/south-east/frame_000.png',
  'buddy-test/animations/walking-8-frames/south-east/frame_001.png',
  'buddy-test/animations/walking-8-frames/south-east/frame_002.png',
  'buddy-test/animations/walking-8-frames/south-east/frame_003.png',
  'buddy-test/animations/walking-8-frames/south-east/frame_004.png',
  'buddy-test/animations/walking-8-frames/south-east/frame_005.png',
  'buddy-test/animations/walking-8-frames/south-east/frame_006.png',
  'buddy-test/animations/walking-8-frames/south-east/frame_007.png',
  'buddy-test/animations/walking-8-frames/south-west/frame_000.png',
  'buddy-test/animations/walking-8-frames/south-west/frame_001.png',
  'buddy-test/animations/walking-8-frames/south-west/frame_002.png',
  'buddy-test/animations/walking-8-frames/south-west/frame_003.png',
  'buddy-test/animations/walking-8-frames/south-west/frame_004.png',
  'buddy-test/animations/walking-8-frames/south-west/frame_005.png',
  'buddy-test/animations/walking-8-frames/south-west/frame_006.png',
  'buddy-test/animations/walking-8-frames/south-west/frame_007.png',
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(PRECACHE_URLS);
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  // Cache-first for all requests
  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) return cached;
      return fetch(event.request).then(response => {
        if (!response || response.status !== 200 || response.type === 'opaque') {
          return response;
        }
        const responseClone = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(event.request, responseClone));
        return response;
      }).catch(() => {
        if (event.request.mode === 'navigate') {
          return caches.match('home.html');
        }
      });
    })
  );
});

self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});