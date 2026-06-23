const CACHE_NAME = 'desk-mat-v1';
const CORE_ASSETS = [
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(CORE_ASSETS)).catch(() => {})
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Network-first cho mọi request bên ngoài (MQTT/YouTube/CDN không nên cache),
// chỉ cache-first cho các file gốc của app.
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  const isCoreAsset = CORE_ASSETS.some((a) => url.pathname.endsWith(a.replace('./', '/')));

  if (isCoreAsset) {
    event.respondWith(
      caches.match(event.request).then((cached) => cached || fetch(event.request))
    );
  }
  // Mọi request khác (MQTT websocket, YouTube iframe, fonts, CDN script...) để mạng tự xử lý bình thường.
});
