const CACHE_NAME = 'niyay-v2';
const STATIC_ASSETS = [
  './',
  './index.html',
  './style.css',
  './app.js',
  './router.js',
  './manifest.json',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS))
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

self.addEventListener('fetch', (event) => {
  // ข้าม non-GET และ cross-origin
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);
  if (url.origin !== location.origin) return;

  event.respondWith((async () => {
    const cached = await caches.match(event.request);
    // [FIX-SW-1] ไฟล์โค้ด/หน้าเว็บต้อง network-first ไม่งั้นผู้ใช้จะค้างอยู่กับเวอร์ชันเก่า
    const isCode = event.request.mode === 'navigate' || /\.(?:js|css|html)$/.test(url.pathname);
    if (!isCode && cached) return cached;

    try {
      const response = await fetch(event.request);
      if (response && response.status === 200) {
        const cache = await caches.open(CACHE_NAME);
        cache.put(event.request, response.clone());
      }
      return response;
    } catch (e) {
      // ออฟไลน์ → ใช้ของที่แคชไว้ (ถ้ามี)
      return cached || Response.error();
    }
  })());
});
