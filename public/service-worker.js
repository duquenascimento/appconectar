self.addEventListener('push', function (event) {
  let payload = {};

  if (event.data) {
    try {
      payload = event.data.json();
    } catch {
      payload = {
        title: 'Nova mensagem',
        body: event.data.text(),
      };
    }
  }

  const title = payload.title || 'Nova mensagem';

  const options = {
    body: payload.body || 'Você recebeu uma nova mensagem no chat.',
    icon: payload.icon || '/icon.png',
    badge: payload.badge || '/badge.png',
    tag: payload.tag || 'chat-message',
    renotify: true,
    data: {
      url: payload.url || '/',
      ...(payload.data || {}),
    },
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', function (event) {
  event.notification.close();

  const urlToOpen = event.notification.data?.url || '/';

  event.waitUntil(
    self.clients
      .matchAll({
        type: 'window',
        includeUncontrolled: true,
      })
      .then(function (clientList) {
        for (const client of clientList) {
          if ('focus' in client) {
            return client.focus();
          }
        }

        if (self.clients.openWindow) {
          return self.clients.openWindow(urlToOpen);
        }

        return null;
      }),
  );
});

self.addEventListener('notificationclick', function (event) {
  event.notification.close();

  const urlToOpen = event.notification.data?.url || '/';

  event.waitUntil(
    self.clients
      .matchAll({
        type: 'window',
        includeUncontrolled: true,
      })
      .then(function (clientList) {
        for (const client of clientList) {
          if ('focus' in client) {
            return client.focus();
          }
        }

        if (self.clients.openWindow) {
          return self.clients.openWindow(urlToOpen);
        }

        return null;
      }),
  );
});