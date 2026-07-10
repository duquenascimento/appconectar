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

  const notificationData = event.notification.data || {};
  const payloadData = notificationData.data || notificationData;

  const channelId = payloadData.channelId;

  console.log('[SW] notificationclick disparou');
  console.log('[SW] notificationData:', notificationData);
  console.log('[SW] payloadData:', payloadData);
  console.log('[SW] channelId:', channelId);

  const urlToOpen = new URL('/', self.location.origin);

  if (channelId) {
    urlToOpen.searchParams.set('notificationChannelId', channelId);
  }

  event.waitUntil(
    self.clients
      .matchAll({
        type: 'window',
        includeUncontrolled: true,
      })
      .then(async function (clientList) {
        console.log('[SW] clients encontrados:', clientList.length);

        const message = {
          type: 'NOTIFICATION_CLICK',
          payload: {
            channelId,
          },
        };

        for (const client of clientList) {
          console.log('[SW] client encontrado:', client.url);

          if ('focus' in client) {
            await client.focus();

            if (channelId) {
              console.log('[SW] enviando postMessage:', message);
              client.postMessage(message);
            }

            return;
          }
        }

        if (self.clients.openWindow) {
          console.log('[SW] abrindo nova janela:', urlToOpen.toString());
          return self.clients.openWindow(urlToOpen.toString());
        }

        return null;
      }),
  );
});