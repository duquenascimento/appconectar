function getNotificationPayload(event) {
  if (!event.data) {
    return {};
  }

  try {
    return event.data.json();
  } catch {
    return {
      title: 'Nova mensagem',
      body: event.data.text(),
    };
  }
}

async function getFocusedVisibleClient() {
  const clientList = await self.clients.matchAll({
    type: 'window',
    includeUncontrolled: true,
  });

  return (
    clientList.find(function (client) {
      return (
        client.focused === true &&
        client.visibilityState === 'visible'
      );
    }) || null
  );
}

async function getActiveChannelIdFromClient(client) {
  return new Promise(function (resolve) {
    const messageChannel = new MessageChannel();

    let finished = false;

    function finish(channelId) {
      if (finished) {
        return;
      }

      finished = true;
      clearTimeout(timeout);

      resolve(
        typeof channelId === 'string'
          ? channelId
          : null,
      );
    }

    /*
     * Caso a aplicação não responda, a notificação é exibida.
     * É mais seguro mostrar uma notificação extra do que
     * perder uma notificação importante.
     */
    const timeout = setTimeout(function () {
      finish(null);
    }, 500);

    messageChannel.port1.onmessage = function (event) {
      finish(event.data?.channelId);
    };

    client.postMessage(
      {
        type: 'GET_ACTIVE_CHANNEL',
      },
      [messageChannel.port2],
    );
  });
}

self.addEventListener('push', function (event) {
  event.waitUntil(
    (async function () {
      const payload = getNotificationPayload(event);

      const payloadData =
        payload.data &&
        typeof payload.data === 'object'
          ? payload.data
          : {};

      const notificationChannelId =
        payloadData.channelId ||
        payload.channelId ||
        null;

      const channelType =
        payloadData.channelType ||
        payload.channelType ||
        'restaurant';

      const focusedClient =
        await getFocusedVisibleClient();

      /*
       * Somente pergunta pelo canal ativo quando:
       *
       * - há uma aba focada;
       * - a notificação possui channelId.
       */
      if (focusedClient && notificationChannelId) {
        const activeChannelId =
          await getActiveChannelIdFromClient(
            focusedClient,
          );

        if (
          activeChannelId === notificationChannelId
        ) {
          console.log(
            '[SW] Notificação ignorada: canal já está aberto.',
          );

          return;
        }
      }

      const title =
        payload.title || 'Nova mensagem';

      const options = {
        body:
          payload.body ||
          'Você recebeu uma nova mensagem no chat.',

        icon: payload.icon || '/icon.png',
        badge: payload.badge || '/badge.png',

        tag:
          payload.tag ||
          (notificationChannelId
            ? `chat-message:${notificationChannelId}`
            : 'chat-message'),

        renotify: true,

        data: {
          ...payloadData,

          channelId: notificationChannelId,
          channelType,

          url:
            payloadData.url ||
            payload.url ||
            '/',
        },
      };

      await self.registration.showNotification(
        title,
        options,
      );
    })(),
  );
});

self.addEventListener(
  'notificationclick',
  function (event) {
    event.notification.close();

    const notificationData =
      event.notification.data || {};

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
          const existingClient =
            clientList.find(function (client) {
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
  },
);
