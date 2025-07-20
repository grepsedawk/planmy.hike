const CACHE_NAME = "planmyhike-v5"

const urlsToCache = [
  "./",
  "./index.html",
  "./index.css",
  "./manifest.json",
  "./js/index.js",
  "./js/Router.js",
  "./js/Page.js",
  "./js/Renderer.js",
  "./js/Food.js",
  "./js/Section.js",
  "./js/dexie.min.js",
  "./js/html5-qrcode.min.js",
  "./pages/home/index.html",
  "./pages/home/index.js",
  "./pages/sections/SectionsPage.js",
  "./pages/sections/AddSection.js",
  "./pages/sections/Section/index.html",
  "./pages/food/index.html",
  "./pages/food/FoodPage.js",
  "./pages/food/BarcodeScannerRenderer.js",
  "./pages/food/ConfigureSection.js",
  "./pages/food/NewFood.js",
  "./pages/food/ShowFood.js",
  "./pages/food/ShowTotals.js",
  "./pages/404/index.html",
  "./pages/404/NotFoundPage.js",
  "./icons/icon-192x192.png",
  "./icons/icon-512x512.png",
].map((url) => new URL(url, self.location).href)

// Install event - cache app shell
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => {
        console.log("Opened cache")
        return cache.addAll(urlsToCache)
      })
      .catch((error) => {
        console.error("Cache install failed:", error)
      }),
  )
})

// Fetch event - serve from cache, fallback to network
self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches
      .match(event.request)
      .then((response) => {
        // Return cached version or fetch from network
        return response || fetch(event.request)
      })
      .catch(() => {
        // If both cache and network fail, return offline page for navigations
        if (event.request.mode === "navigate") {
          return caches.match(new URL("./index.html", self.location).href)
        }
      }),
  )
})

// Activate event - clean up old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log("Deleting old cache:", cacheName)
            return caches.delete(cacheName)
          }
        }),
      )
    }),
  )
})
