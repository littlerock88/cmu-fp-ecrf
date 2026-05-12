// CMU FP eCRF — Service Worker
// อัปเดต CACHE_VERSION ทุกครั้งที่แก้ไขไฟล์
const CACHE_VERSION = 'cmu-fp-v1';
const ASSETS = [
  './',
  './index.html',
  './manifest.json'
];

// ── INSTALL: cache ไฟล์ทั้งหมด ──
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_VERSION)
      .then(cache => cache.addAll(ASSETS))
      .then(() => self.skipWaiting())
  );
});

// ── ACTIVATE: ลบ cache เก่า ──
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(k => k !== CACHE_VERSION)
            .map(k => caches.delete(k))
      )
    ).then(() => self.clients.claim())
  );
});

// ── FETCH: Network first, fallback to cache ──
self.addEventListener('fetch', event => {
  // ไม่ cache request ไปยัง Apps Script (POST ข้อมูล)
  if (event.request.url.includes('script.google.com')) {
    return; // ให้ผ่านไปยัง network ตรงๆ
  }

  event.respondWith(
    fetch(event.request)
      .then(response => {
        // อัปเดต cache ด้วย response ใหม่
        const clone = response.clone();
        caches.open(CACHE_VERSION)
          .then(cache => cache.put(event.request, clone));
        return response;
      })
      .catch(() =>
        // ถ้าไม่มีอินเทอร์เน็ต — ดึงจาก cache
        caches.match(event.request)
      )
  );
});
