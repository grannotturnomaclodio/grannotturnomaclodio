/* Gran Notturno Maclodio: rende il sito installabile e consultabile anche con poca rete */
const CACHE = "gnm-v20";
const CORE = ["./", "index.html", "logo.png", "favicon.png", "icon-192.png", "icon-512.png", "manifest.webmanifest", "tabellone-2026.jpg", "promo-poster.jpg"];
self.addEventListener("install", e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(CORE)).then(() => self.skipWaiting())); });
self.addEventListener("activate", e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener("fetch", e => {
  const req = e.request;
  if (req.method !== "GET" || new URL(req.url).origin !== location.origin) return;
  if (/\.(mp4|mp3)$/.test(new URL(req.url).pathname)) return; // audio e video sempre dalla rete
  // pagina: prima la rete (contenuti aggiornati), poi la copia salvata
  if (req.mode === "navigate") { e.respondWith(fetch(req).then(r => { caches.open(CACHE).then(c => c.put(req, r.clone())); return r; }).catch(() => caches.match(req).then(r => r || caches.match("index.html")))); return; }
  e.respondWith(caches.match(req).then(hit => hit || fetch(req).then(r => { if (r.ok) caches.open(CACHE).then(c => c.put(req, r.clone())); return r; })));
});
