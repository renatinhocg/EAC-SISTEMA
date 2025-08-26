// Versão do SW: 2025-08-23 - 1.17

// Service Worker básico para PWA
self.addEventListener('install', event => {
  self.skipWaiting(); // força ativação imediata
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.map(key => {
          // Remove todos os caches antigos
          return caches.delete(key);
        })
      );
    }).then(() => {
      return self.clients.claim();
    })
  );
});

self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

self.addEventListener('fetch', event => {
  const url = event.request.url;
  // Ignora cache para rotas dinâmicas de API
  if (
    url.includes('/api/camisas') ||
    url.includes('/api/hamburguer') ||
    url.includes('/api/pagamentos') ||
    url.includes('/api/presencas')
  ) {
    event.respondWith(fetch(event.request));
    return;
  }
  // Cache normal para demais requisições
  event.respondWith(
    caches.open('eac-pwa-cache').then(cache => {
      return cache.match(event.request).then(response => {
        return response || fetch(event.request).then(networkResponse => {
          if (event.request.method === 'GET' && networkResponse.ok) {
            cache.put(event.request, networkResponse.clone());
          }
          return networkResponse;
        });
      });
    })
  );
});

// Push notification
self.addEventListener('push', function(event) {
  console.log('[SW] Evento push recebido:', event);
  let data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch (e) {
    // Se não for JSON, trata como texto simples
    data = { title: 'Push', body: event.data ? event.data.text() : '' };
  }
  console.log('[SW] Dados do push:', data);
  const title = data.title || 'Nova notificação';
  const options = {
    body: data.body || '',
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    data: data.url ? { url: data.url } : {}
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  const url = event.notification.data && event.notification.data.url;
  if (url) {
    event.waitUntil(clients.openWindow(url));
  }
});
