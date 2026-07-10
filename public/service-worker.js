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

  const payloadData =
    payload.data && typeof payload.data === 'object'
      ? payload.data
      : {};

  const channelId =
    payloadData.channelId ||
    payload.channelId ||
    null;

  const channelType =
    payloadData.channelType ||
    payload.channelType ||
    'restaurant';

  const title = payload.title || 'Nova mensagem';

  const options = {
    body:
      payload.body ||
      'Você recebeu uma nova mensagem no chat.',

    icon: payload.icon || '/icon.png',
    badge: payload.badge || '/badge.png',

    tag:
      payload.tag ||
      (channelId
        ? `chat-message:${channelId}`
        : 'chat-message'),

    renotify: true,

    data: {
      ...payloadData,

      channelId,
      channelType,

      url: payloadData.url || payload.url || '/',
    },
  };

  event.waitUntil(
    self.registration.showNotification(title, options),
  );
});

self.addEventListener('notificationclick', function (event) {
  event.notification.close();

  const notificationData = event.notification.data || {};

  const channelId =
    typeof notificationData.channelId === 'string'
      ? notificationData.channelId
      : null;

  const channelType =
    notificationData.channelType === 'supplier'
      ? 'supplier'
      : 'restaurant';

  const targetPath =
    typeof notificationData.url === 'string'
      ? notificationData.url
      : '/';

  const urlToOpen = new URL(
    targetPath,
    self.location.origin,
  );

  if (channelId) {
    urlToOpen.searchParams.set(
      'notificationChannelId',
      channelId,
    );

    urlToOpen.searchParams.set(
      'notificationChannelType',
      channelType,
    );
  }

  event.waitUntil(
    self.clients
      .matchAll({
        type: 'window',
        includeUncontrolled: true,
      })
      .then(async function (clientList) {
        const existingClient = clientList.find(function (client) {
          try {
            return (
              new URL(client.url).origin ===
              self.location.origin
            );
          } catch {
            return false;
          }
        });

        if (existingClient) {
          await existingClient.focus();

          existingClient.postMessage({
            type: 'NOTIFICATION_CLICK',
            payload: {
              channelId,
              channelType,
            },
          });

          return;
        }

        if (self.clients.openWindow) {
          return self.clients.openWindow(
            urlToOpen.toString(),
          );
        }

        return null;
      }),
  );
});
