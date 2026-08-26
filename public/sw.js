// رفيق الإمام — Service Worker v2
// Offline-First PWA with app shell caching, API fallback, and audio cache

const CACHE_VERSION = 'emam-v2';
const STATIC_CACHE = `${CACHE_VERSION}-static`;
const DYNAMIC_CACHE = `${CACHE_VERSION}-dynamic`;
const FONT_CACHE = `${CACHE_VERSION}-fonts`;
const AUDIO_CACHE = `${CACHE_VERSION}-audio`;

const APP_SHELL = [
  '/',
  '/quran',
  '/adhkar',
  '/hadith',
  '/learn',
  '/quick',
  '/more',
  '/prepare',
  '/learn/dua',
  '/learn/quiz',
  '/learn/tasbih',
  '/learn/ruqyah',
  '/learn/situational',
  '/learn/prophets',
  '/learn/prayer-guide',
  '/learn/khutbah',
  '/learn/sources',
  '/learn/adhkar',
  '/icon-192.svg',
  '/icon-512.svg',
  '/icon-512-maskable.svg',
  '/favicon.svg',
  '/manifest.json',
];

const FONT_URLS = [
  'https://fonts.googleapis.com/css2?family=Amiri:ital,wght@0,400;0,700;1,400&family=Inter:wght@300;400;500;600;700&family=Noto+Naskh+Arabic:wght@400;500;600;700&display=swap',
];

// Install: cache app shell
self.addEventListener('install', (event) => {
  event.waitUntil(
    Promise.all([
      caches.open(STATIC_CACHE).then((cache) => cache.addAll(APP_SHELL)),
      caches.open(FONT_CACHE).then((cache) =>
        Promise.allSettled(FONT_URLS.map((url) => fetch(url).then((r) => cache.put(url, r))))
      ),
    ]).then(() => self.skipWaiting())
  );
});

// Activate: clean old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((k) => !k.startsWith(CACHE_VERSION) && !k.startsWith('rafiq-imam'))
          .map((k) => caches.delete(k))
      )
    ).then(() => self.clients.claim())
  );
});

// Fetch: offline-first strategies
self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);

  // 1. Audio files → cache-first (check audio cache)
  if (isAudioUrl(url)) {
    event.respondWith(cacheFirstWithFallback(request, AUDIO_CACHE));
    return;
  }

  // 2. Google Fonts → stale-while-revalidate
  if (url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com') {
    event.respondWith(staleWhileRevalidate(request, FONT_CACHE));
    return;
  }

  // 3. Quran API → network-first with cache fallback
  if (url.hostname === 'api.quran.com' || url.pathname.includes('/api/')) {
    event.respondWith(networkFirstWithFallback(request, DYNAMIC_CACHE));
    return;
  }

  // 4. CDN audio (quran.foundation, quranicaudio.com) → cache-first
  if (isCdnAudioUrl(url)) {
    event.respondWith(cacheFirstWithFallback(request, AUDIO_CACHE));
    return;
  }

  // 5. Static assets & app shell → cache-first
  event.respondWith(cacheFirstWithNetwork(request, STATIC_CACHE));
});

// --- Strategies ---

async function cacheFirstWithNetwork(request, cacheName) {
  const cached = await caches.match(request);
  if (cached) return cached;

  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    return new Response('Offline', { status: 503 });
  }
}

async function networkFirstWithFallback(request, cacheName) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    const cached = await caches.match(request);
    if (cached) return cached;
    return new Response(JSON.stringify({ error: 'offline' }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

async function cacheFirstWithFallback(request, cacheName) {
  const cached = await caches.match(request);
  if (cached) return cached;

  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    return new Response(null, { status: 503 });
  }
}

async function staleWhileRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);

  const fetchPromise = fetch(request)
    .then((response) => {
      if (response.ok) cache.put(request, response.clone());
      return response;
    })
    .catch(() => cached);

  return cached || fetchPromise;
}

// --- URL classification ---

function isAudioUrl(url) {
  const host = url.hostname;
  return (
    host === 'verses.quran.foundation' ||
    host === 'mirrors.quranicaudio.com' ||
    url.pathname.endsWith('.mp3')
  );
}

function isCdnAudioUrl(url) {
  return url.hostname.includes('quranicaudio') || url.hostname.includes('quran.foundation');
}

// Listen for messages from the app
self.addEventListener('message', (event) => {
  if (event.data === 'skipWaiting') {
    self.skipWaiting();
  }
});
