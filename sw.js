const CACHE_NAME = 'fage-rechentrainer-v1';
const urlsToCache = [
  '/',
  './index.html', // <-- Sicherer mit ./
  './style.css',    // <-- Sicherer mit ./
  './sketch.js',    // <-- Sicherer mit ./
  'https://cdnjs.cloudflare.com/ajax/libs/p5.js/1.9.2/p5.js',
  'https://cdnjs.cloudflare.com/ajax/libs/p5.js/1.9.2/addons/p5.dom.js'
];

// Bei der Installation der App die Dateien im Cache speichern
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

// Bei jeder Anfrage prüfen, ob die Datei im Cache ist
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Wenn die Datei im Cache ist, diese zurückgeben
        if (response) {
          return response;
        }
        // Ansonsten die Datei aus dem Netzwerk laden
        return fetch(event.request);
      }
    )
  );
});
