/* Guarda la app en el equipo para que abra sin conexión.
   Si cambias algún archivo de la app, sube también el número de versión (C). */
const C = "informes-v1";
const LIB = "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.99.3/dist/umd/supabase.js";
const A = ["./", "index.html", "manifest.webmanifest", "icon-192.png", "icon-512.png", LIB];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(C).then(c => c.addAll(A)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys()
      .then(k => Promise.all(k.filter(x => x !== C).map(x => caches.delete(x))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", e => {
  const u = new URL(e.request.url);
  const propio = u.origin === self.location.origin;
  if (e.request.method !== "GET" || (!propio && u.href !== LIB)) return; // Supabase y demás: directo a la red
  e.respondWith(
    caches.match(e.request, { ignoreSearch: true }).then(hit => {
      const red = fetch(e.request)
        .then(r => { if (r.ok) caches.open(C).then(c => c.put(e.request, r.clone())); return r; })
        .catch(() => hit);
      return hit || red;
    })
  );
});
