// Versão do SW: 2025-08-23 - 1.18

// Service Worker customizado para push notification
self.addEventListener('push', function(event) {
  console.log('Push recebido!');
  event.waitUntil((async () => {
    let data = {};
    if (event.data) {
      try {
        data = event.data.json();
      } catch (e) {
        const text = await event.data.text();
        data = { title: 'Push recebido', body: text };
      }
    }
    const title = data.title || 'Nova notificação';
    const options = {
      body: data.body || '',
      icon: '/admin/icon-192.png',
      badge: '/admin/icon-192.png',
      data: data.url ? { url: data.url } : {}
    };
    self.registration.showNotification(title, options);
  })());
});

self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  const url = event.notification.data && event.notification.data.url;
  if (url) {
    event.waitUntil(clients.openWindow(url));
  }
});
