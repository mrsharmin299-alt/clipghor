const CACHE = "clipghor-shell-v1";
const SHELL = ["./", "./index.html", "./config.js", "./pv.js", "./manifest.json"];
self.addEventListener("install", event => event.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL))));
self.addEventListener("activate", event => event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))));
self.addEventListener("fetch", event => { if (event.request.method === "GET" && new URL(event.request.url).origin === self.location.origin) event.respondWith(caches.match(event.request).then(r => r || fetch(event.request))); });
