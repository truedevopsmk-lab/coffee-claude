---
---

// Versioned per build, so every deploy drops the previous cache and
// installed home-screen apps never get stuck on stale CSS/JS.
const CACHE_NAME = 'coffee-journal-{{ site.time | date: "%Y%m%d%H%M%S" }}';

const PRECACHE_URLS = [
  '/coffee-claude/',
  '/coffee-claude/brews/',
  '/coffee-claude/beans/',
  '/coffee-claude/methods/',
  '/coffee-claude/brews-and-frames/',
  '/coffee-claude/tools/brew-calculator/',
  '/coffee-claude/add-brew/',
  '/coffee-claude/upload-photo/',
  '/coffee-claude/journal-settings/',
  '/coffee-claude/assets/coffee.css',
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

function networkFirst(request, fallbackUrl) {
  return fetch(request)
    .then(response => {
      if (response.ok) {
        const copy = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(request, copy));
      }
      return response;
    })
    .catch(() =>
      caches.match(request, { ignoreSearch: true })
        .then(cached => cached || (fallbackUrl ? caches.match(fallbackUrl) : Response.error()))
    );
}

// Fetch — network-first for pages, CSS and JS (cache is the offline fallback).
// Everything else (images, GitHub API, CDNs) goes straight to the network.
self.addEventListener('fetch', event => {
  const request = event.request;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  if (request.mode === 'navigate') {
    event.respondWith(networkFirst(request, '/coffee-claude/offline.html'));
  } else if (/\.(css|js)$/.test(url.pathname)) {
    event.respondWith(networkFirst(request));
  }
});
