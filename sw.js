const CACHE_NAME = "flora-aura-v10";
const APP_SHELL = [
    "./",
    "./index.html",
    "./manifest.json",
    "./pages/offline.html",
    "./pages/sobre.html",
    "./assets/css/styles.css",
    "./assets/js/app.js",
    "./assets/js/catalog.js",
    "./assets/js/auth.js",
    "./assets/js/db.js",
    "./assets/images/plants/photos.json",
    "./assets/js/modules/api.js",
    "./assets/js/modules/UI.js",
    "./assets/images/logo.svg",
    "./assets/images/flora-aura-logo.png",
    "./assets/images/icons/icon-192x192.png",
    "./assets/images/icons/icon-512x512.png",
    "./assets/images/icons/icon.svg"
];

self.addEventListener("install", (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => cache.addAll(APP_SHELL))
            .then(() => self.skipWaiting())
    );
});

self.addEventListener("activate", (event) => {
    event.waitUntil(
        caches.keys()
            .then((cacheNames) => Promise.all(
                cacheNames
                    .filter((cacheName) => cacheName.startsWith("flora-aura-")
                        && cacheName !== CACHE_NAME)
                    .map((cacheName) => caches.delete(cacheName))
            ))
            .then(() => self.clients.claim())
    );
});

self.addEventListener("fetch", (event) => {
    const request = event.request;

    if (request.method !== "GET") {
        return;
    }

    const requestUrl = new URL(request.url);
    if (requestUrl.origin !== self.location.origin) {
        return;
    }

    if (request.mode === "navigate") {
        event.respondWith((async () => {
            try {
                const response = await fetch(request);
                if (response.ok) {
                    const cache = await caches.open(CACHE_NAME);
                    await cache.put(request, response.clone());
                }
                return response;
            } catch {
                const cachedPage = await caches.match(request);
                return cachedPage || caches.match("./pages/offline.html");
            }
        })());
        return;
    }

    event.respondWith((async () => {
        const cachedResponse = await caches.match(request);
        if (cachedResponse) {
            return cachedResponse;
        }

        const response = await fetch(request);
        if (response.ok) {
            const cache = await caches.open(CACHE_NAME);
            await cache.put(request, response.clone());
        }
        return response;
    })());
});