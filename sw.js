// Service worker de GRA Locator — met l'appli en cache pour qu'elle
// fonctionne ensuite sans aucune connexion (usage en montagne).
//
// Stratégie : "cache d'abord" pour les fichiers de l'appli (HTML, JSON,
// icônes). Rien d'autre n'est jamais demandé au réseau par l'appli elle
// même (voir index.html) — ce service worker sert uniquement à ce que le
// PREMIER chargement (avec réseau) reste disponible ensuite hors-ligne.

const CACHE_NAME = "gra-locator-v4";
const CORE_ASSETS = [
  "./",
  "./index.html",
  "./manifest.json",
  "./icon-192.png",
  "./icon-512.png",
  "./icon-maskable-512.png",
  "./club-logo.png",
  "./leaflet.js",
  "./leaflet.css",
  "./images/marker-icon.png",
  "./images/marker-icon-2x.png",
  "./images/marker-shadow.png",
  "./images/layers.png",
  "./images/layers-2x.png",
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

  // La page HTML elle-même : "réseau d'abord". Ainsi, dès qu'il y a du
  // signal, la dernière version publiée sur GitHub Pages s'affiche
  // directement (et se remet en cache pour le hors-ligne). Seulement si le
  // réseau échoue (pas de signal), on retombe sur la version en cache.
  if (event.request.mode === "navigate") {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          if (response && response.ok) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          }
          return response;
        })
        .catch(() =>
          caches.match(event.request).then((cached) => cached || caches.match("./index.html"))
        )
    );
    return;
  }

  // Tous les autres fichiers (icônes, carte, données) : "cache d'abord"
  // pour rester rapide et fonctionner hors-ligne dès la première visite.
  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;
      return fetch(event.request)
        .then((response) => {
          if (response && response.ok) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          }
          return response;
        })
        .catch(() => undefined);
    })
  );
});
