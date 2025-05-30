const CACHE_NAME = 'tradingview-cache-v1';
const LIBRARY_URL = '/static/charting_library/charting_library.standalone.js';
const BUNDLE_URL = '/static/datafeeds/udf/dist/bundle.js';

self.addEventListener('install', (event) => {
  event.waitUntil(
    Promise.all([
      caches.open(CACHE_NAME).then((cache) => {
        return cache.addAll([
          LIBRARY_URL,
          BUNDLE_URL,
          '/static/charting_library/bundles/940.8a3b1935586627f4857c.css'
        ]);
      }),
      // Pre-initialize TradingView config
      self.clients.matchAll().then((clients) => {
        clients.forEach((client) => {
          client.postMessage({
            type: 'TRADINGVIEW_PRELOAD_CONFIG',
            config: {
              supported_resolutions: ["1S","15S","30S","1","5","15","30","60","240","D"],
              supports_marks: true,
              supports_time: true,
              supports_timescale_marks: true
            }
          });
        });
      })
    ])
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(clients.claim());
});

self.addEventListener('fetch', (event) => {
  if (event.request.url.includes('charting_library')) {
    event.respondWith(
      caches.match(event.request).then((response) => {
        return response || fetch(event.request);
      })
    );
  }
});

// Handle client messages
self.addEventListener('message', (event) => {
  if (event.data.type === 'WARM_UP_TRADINGVIEW') {
    // Warm up the cache
    caches.open(CACHE_NAME).then((cache) => {
      cache.match(LIBRARY_URL).then((response) => {
        if (response) {
          response.text().then(() => {
            // Library is now in memory
            event.source.postMessage({
              type: 'TRADINGVIEW_WARMED_UP'
            });
          });
        }
      });
    });
  }
});