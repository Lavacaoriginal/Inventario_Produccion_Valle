// Service Worker mínimo — necesario para que Android ofrezca
// "Instalar app" en vez de solo "Agregar acceso directo".
const CACHE_NAME = 'la-vaca-inventario-v1';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))
      )
    )
  );
  self.clients.claim();
});

// Estrategia: network-first con fallback a caché (para que los datos de
// Supabase siempre se pidan frescos, pero el HTML/CSS/JS cargue offline
// si no hay conexión).
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        const copy = response.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, copy).catch(() => {});
        });
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});
