// Service worker de GRA Locator — met l'appli en cache pour qu'elle
// fonctionne ensuite sans aucune connexion (usage en montagne).
//
// Stratégie : "cache d'abord" pour les fichiers de l'appli (HTML, JSON,
// icônes). Rien d'autre n'est jamais demandé au réseau par l'appli elle
// même (voir index.html) — ce service worker sert uniquement à ce que le
// PREMIER chargement (avec réseau) reste disponible ensuite hors-ligne.

const CACHE_NAME = "gra-locator-v1";
const CORE_ASSETS = [
  "./",
  "./index.html",
  "./manifest.json",
  "./icon-192.png",
  "./icon-512.png",
  "./icon-maskable-512.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(CORE_ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;
      return fetch(event.request)
        .then((response) => {
          // Met aussi en cache toute réponse valide obtenue en ligne,
          // pour couvrir d'éventuels fichiers ajoutés plus tard.
          if (response && response.ok) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          }
          return response;
        })
        .catch(() => {
          // Hors-ligne et pas en cache : pour une navigation, retombe sur
          // la page principale déjà mise en cache plutôt que d'échouer.
          if (event.request.mode === "navigate") {
            return caches.match("./index.html");
          }
          return undefined;
        });
    })
  );
});
