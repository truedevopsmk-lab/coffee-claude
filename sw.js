---
---

const CACHE_NAME = 'coffee-journal-v1';

const PRECACHE_URLS = [
  '/coffee-claude/',
  '/coffee-claude/brews/',
  '/coffee-claude/beans/',
  '/coffee-claude/methods/',
  '/coffee-claude/methods/aeropress/',
  '/coffee-claude/methods/v60/',
  '/coffee-claude/methods/chemex/',
  '/coffee-claude/methods/french-press/',
  '/coffee-claude/methods/espresso/',
  '/coffee-claude/methods/cold-brew/',
  '/coffee-claude/methods/moka-pot/',
  '/coffee-claude/methods/b75/',
  '/coffee-claude/tools/brew-calculator/',
  '/coffee-claude/offline.html'
];

// Install — pre-cache all core pages
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting())
  );
});

// Activate — clean up old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(key => key !== CACHE_NAME)
            .map(key => caches.delete(key))
      )
    ).then(() => self.clients.claim())
  );
});

// Fetch — cache-first for navigation, network-first for assets
self.addEventListener('fetch', event => {
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          // Cache the fresh page
          const copy = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, copy));
          return response;
        })
        .catch(() =>
          caches.match(event.request)
            .then(cached => cached || caches.match('/coffee-claude/offline.html'))
        )
    );
  } else {
    event.respondWith(
      caches.match(event.request)
        .then(cached => cached || fetch(event.request))
    );
  }
});
