// Service worker de GRA Locator — met l'appli en cache pour qu'elle
// fonctionne ensuite sans aucune connexion (usage en montagne).
//
// Stratégie : "cache d'abord" pour les fichiers de l'appli (HTML, JSON,
// icônes). Rien d'autre n'est jamais demandé au réseau par l'appli elle
// même (voir index.html) — ce service worker sert uniquement à ce que le
// PREMIER chargement (avec réseau) reste disponible ensuite hors-ligne.

const CACHE_NAME = "gra-locator-v18";
// ⚠️ Doit rester strictement identique à la constante CACHE_NAME déclarée
// dans index.html (bloc "Préchargement d'une zone hors-ligne") : sinon les
// tuiles que ce fichier écrit dans le cache seraient supprimées au prochain
// "activate" (voir plus bas), qui purge tout ce qui ne porte pas ce nom.
const CORE_ASSETS = [
  "./",
  "./index.html",
  "./manifest.json",
  "./icon-192.png",
  "./icon-512.png",
  "./icon-maskable-512.png",
  "./apple-touch-icon.png",
  "./club-logo.png",
  "./leaflet.js",
  "./leaflet.css",
  "./tailwind.js",
  "./fonts/inter-latin-400-normal.woff2",
  "./fonts/inter-latin-600-normal.woff2",
  "./fonts/inter-latin-700-normal.woff2",
  "./fonts/inter-latin-800-normal.woff2",
  "./fonts/jetbrains-mono-latin-400-normal.woff2",
  "./fonts/jetbrains-mono-latin-500-normal.woff2",
  "./fonts/jetbrains-mono-latin-700-normal.woff2",
  "./images/marker-icon.png",
  "./images/marker-icon-2x.png",
  "./images/marker-shadow.png",
  "./images/layers.png",
];
// Rappel : cache.addAll() ci-dessous échoue EN BLOC si un seul de ces
// fichiers répond 404 (aucun n'est alors mis en cache, pas seulement celui
// en faute) — avant d'ajouter une entrée ici, vérifier qu'elle existe bien
// à ce chemin exact une fois déposée sur GitHub Pages.

// Cache séparée pour les tuiles de fond de carte (OSM / IGN) — délibérément
// PAS versionnée comme CACHE_NAME : une zone déjà vue ou préchargée
// (bouton "Précharger cette zone" de l'onglet Position) doit rester
// disponible hors-ligne même après une future mise à jour de l'appli, qui
// recrée sinon CACHE_NAME de zéro à chaque changement de version.
const TILES_CACHE_NAME = "gra-locator-tiles";
const TILE_HOSTS = ["tile.openstreetmap.org", "data.geopf.fr"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(CORE_ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.filter((k) => k !== CACHE_NAME && k !== TILES_CACHE_NAME).map((k) => caches.delete(k))
      )
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
          // Les tuiles OSM/IGN sont chargées par Leaflet en mode CORS
          // (crossOrigin activé côté index.html, les deux serveurs renvoient
          // "Access-Control-Allow-Origin: *") : la réponse a donc un vrai
          // code de statut, et response.ok fonctionne normalement. On
          // tolère quand même response.type === "opaque" par défense en
          // profondeur — une réponse "opaque" (requête cross-origin en
          // mode no-cors) a toujours response.ok === false et status 0
          // même en cas de succès réel ; ne se baser que sur response.ok
          // aurait silencieusement empêché toute mise en cache de tuiles
          // si un jour crossOrigin n'était plus honoré par un navigateur.
          if (response && (response.ok || response.type === "opaque")) {
            const clone = response.clone();
            let targetCache = CACHE_NAME;
            try {
              if (TILE_HOSTS.includes(new URL(event.request.url).host)) targetCache = TILES_CACHE_NAME;
            } catch (err) {}
            caches.open(targetCache).then((cache) => cache.put(event.request, clone));
          }
          return response;
        })
        .catch(() => undefined);
    })
  );
});
