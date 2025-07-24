// KORRIGIERTE VERSION

const CACHE_NAME = 'fage-rechentrainer-v8'; // Version erhöht!
const urlsToCache = [
  './',
  './index.html',
  './style.css',
  './sketch.js',
  'https://cdnjs.cloudflare.com/ajax/libs/p5.js/1.9.2/p5.js',
  'https://cdnjs.cloudflare.com/ajax/libs/p5.js/1.9.2/addons/p5.dom.js',
  './icon-192.png', // NEU HINZUGEFÜGT
  './icon-512.png'  // NEU HINZUGEFÜGT
];

// 1. Installation: Dateien im Cache speichern
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache and caching files');
        return cache.addAll(urlsToCache);
      })
  );
  self.skipWaiting();
});

// 2. Aktivierung: Alte Caches löschen
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  return self.clients.claim();
});

// 3. Fetch: Anfragen abfangen und aus dem Cache bedienen
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Wenn die Datei im Cache ist, diese zurückgeben.
        // Ansonsten aus dem Netzwerk laden.
        return response || fetch(event.request);
      }
    )
  );
});
