const CACHE_NAME = 'pocketday-v2';
const STATIC_ASSETS = [
    '/',
    '/index.html',
    '/styles/main.css',
    '/scripts/app.js',
    '/scripts/dashboard.js',
    '/scripts/expenses.js',
    '/scripts/stats.js',
    '/utils/date-utils.js',
    '/utils/calculations.js',
    '/utils/storage.js',
    '/manifest.json'
];

// Install Event
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS))
    );
});

// Activate Event (Cleanup)
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((keys) => {
            return Promise.all(keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key)));
        })
    );
});

// Fetch Event (Stale-While-Revalidate)
self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request).then((cachedResponse) => {
            const fetchPromise = fetch(event.request).then((networkResponse) => {
                caches.open(CACHE_NAME).then((cache) => cache.put(event.request, networkResponse.clone()));
                return networkResponse;
            });
            return cachedResponse || fetchPromise;
        })
    );
});
