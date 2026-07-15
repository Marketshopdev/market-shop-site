const CACHE_NAME = 'market-shop-v2'; // ⚠️ toujours changer ce numéro à chaque mise à jour importante
const ASSETS = [
  '/',
  '/index.html',
  '/about.html',
  '/contact.html',
  '/css/style.css',
  '/css/components.css',
  '/js/main.js'
];

// Installation : mise en cache initiale + activation immédiate
self.addEventListener('install', (event) => {
  self.skipWaiting(); // force le nouveau Service Worker à s'activer sans attendre
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS)));
});

// Activation : nettoyage des anciens caches + prise de contrôle immédiate
self.addEventListener('activate', (event) => {
  event.waitUntil(
    Promise.all([
      caches.keys().then((keys) => Promise.all(keys.map(k => k !== CACHE_NAME && caches.delete(k)))),
      self.clients.claim() // prend le contrôle des pages déjà ouvertes, sans attendre un rechargement
    ])
  );
});

// Fetch : réseau en priorité pour les pages HTML (jamais de contenu périmé), cache en secours seulement si hors-ligne
self.addEventListener('fetch', (event) => {
  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request))
  );
});
