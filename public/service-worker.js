const DEBUG = false;

function debugLog(...args) {
  if (DEBUG) {
    console.log('[SW]', ...args);
  }
}

function getNotificationPayload(event) {
  if (!event.data) {
    return {};
  }

  try {
    const rawPayload = event.data.text();

    if (!rawPayload) {
      return {};
    }

    try {
      return JSON.parse(rawPayload);
    } catch {
      return {
        title: 'Nova mensagem',
        body: rawPayload,
      };
    }
  } catch (error) {
    console.error('[SW] Erro ao ler payload da push:', error);
    return {};
  }
}

async function getFocusedVisibleClient() {
  try {
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
  } catch (error) {
    console.error('[SW] Erro ao procurar aba focada:', error);
    return null;
  }
}

async function getActiveChannelIdFromClient(client) {
  return new Promise(function (resolve) {
    const messageChannel = new MessageChannel();

    let finished = false;
    let timeoutId = null;

    function finish(channelId) {
      if (finished) {
        return;
      }

      finished = true;

      if (timeoutId) {
        clearTimeout(timeoutId);
      }

      messageChannel.port1.close();

      resolve(
        typeof channelId === 'string'
          ? channelId
          : null,
      );
    }

    /*
     * Se o React não responder dentro do prazo,
     * a notificação será exibida normalmente.
     */
    timeoutId = setTimeout(function () {
      debugLog('Timeout ao consultar canal ativo.');
      finish(null);
    }, 750);

    messageChannel.port1.onmessage = function (event) {
      finish(event.data?.channelId);
    };

    messageChannel.port1.onmessageerror = function () {
      debugLog('Resposta inválida ao consultar canal ativo.');
      finish(null);
    };

    try {
      client.postMessage(
        {
          type: 'GET_ACTIVE_CHANNEL',
        },
        [messageChannel.port2],
      );
    } catch (error) {
      console.error(
        '[SW] Erro ao consultar canal ativo:',
        error,
      );

      finish(null);
    }
  });
}

async function shouldSuppressNotification(
  notificationChannelId,
) {
  if (!notificationChannelId) {
    return false;
  }

  try {
    const focusedClient =
      await getFocusedVisibleClient();

    if (!focusedClient) {
      return false;
    }

    const activeChannelId =
      await getActiveChannelIdFromClient(
        focusedClient,
      );

    debugLog('Verificação da notificação:', {
      notificationChannelId,
      activeChannelId,
      focusedClientUrl: focusedClient.url,
    });

    return (
      activeChannelId === notificationChannelId
    );
  } catch (error) {
    /*
     * Falha aberta:
     * se não for possível verificar o canal ativo,
     * a notificação deve ser exibida.
     */
    console.error(
      '[SW] Erro ao decidir supressão da notificação:',
      error,
    );

    return false;
  }
}

self.addEventListener('install', function (event) {
  /*
   * Ativa imediatamente a nova versão do worker,
   * sem aguardar o fechamento das abas antigas.
   */
  event.waitUntil(self.skipWaiting());
});

self.addEventListener('activate', function (event) {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('push', function (event) {
  event.waitUntil(
    (async function () {
      const payload =
        getNotificationPayload(event);

      const payloadData =
        payload.data &&
        typeof payload.data === 'object'
          ? payload.data
          : {};

      const notificationChannelId =
        typeof payloadData.channelId === 'string'
          ? payloadData.channelId
          : typeof payload.channelId === 'string'
            ? payload.channelId
            : null;

      const channelType =
        payloadData.channelType === 'supplier' ||
        payload.channelType === 'supplier'
          ? 'supplier'
          : 'restaurant';

      const notificationType =
        typeof payloadData.type === 'string'
          ? payloadData.type
          : 'notification';

      const shouldSuppress =
        await shouldSuppressNotification(
          notificationChannelId,
        );

      if (shouldSuppress) {
        debugLog(
          'Notificação ignorada porque o canal já está aberto.',
          {
            channelId: notificationChannelId,
            channelType,
          },
        );

        return;
      }

      const title =
        typeof payload.title === 'string'
          ? payload.title
          : 'Nova notificação';

      const options = {
        body:
          typeof payload.body === 'string'
            ? payload.body
            : 'Você recebeu uma nova notificação.',

        icon:
          typeof payload.icon === 'string'
            ? payload.icon
            : '/icon.png',

        badge:
          typeof payload.badge === 'string'
            ? payload.badge
            : '/badge.png',

        tag:
          typeof payload.tag === 'string'
            ? payload.tag
            : notificationChannelId
              ? `${notificationType}:${notificationChannelId}`
              : notificationType,

        renotify: true,

        data: {
          ...payloadData,

          channelId: notificationChannelId,
          channelType,

          url:
            typeof payloadData.url === 'string'
              ? payloadData.url
              : typeof payload.url === 'string'
                ? payload.url
                : '/',
        },
      };

      debugLog('Exibindo notificação:', {
        title,
        options,
      });

      try {
        await self.registration.showNotification(
          title,
          options,
        );
      } catch (error) {
        console.error(
          '[SW] Erro ao exibir notificação:',
          error,
        );
      }
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

    const notificationType =
      typeof notificationData.type === 'string'
        ? notificationData.type
        : 'chat_message';

    const orderId =
      typeof notificationData.orderId === 'string'
        ? notificationData.orderId
        : null;

    const messageId =
      typeof notificationData.messageId === 'string'
        ? notificationData.messageId
        : null;

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

      urlToOpen.searchParams.set(
        'notificationType',
        notificationType,
      );

      if (orderId) {
        urlToOpen.searchParams.set(
          'notificationOrderId',
          orderId,
        );
      }

      if (messageId) {
        urlToOpen.searchParams.set(
          'notificationMessageId',
          messageId,
        );
      }
    }

    event.waitUntil(
      (async function () {
        try {
          const clientList =
            await self.clients.matchAll({
              type: 'window',
              includeUncontrolled: true,
            });

          /*
           * Prioriza uma aba focada e visível.
           * Caso não exista, utiliza qualquer aba da aplicação.
           */
          const existingClient =
            clientList.find(function (client) {
              return (
                client.focused === true &&
                client.visibilityState === 'visible'
              );
            }) ||
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
                type: notificationType,
                orderId,
                messageId,
              },
            });

            return;
          }

          if (self.clients.openWindow) {
            await self.clients.openWindow(
              urlToOpen.toString(),
            );
          }
        } catch (error) {
          console.error(
            '[SW] Erro ao processar clique na notificação:',
            error,
          );
        }
      })(),
    );
  },
);
