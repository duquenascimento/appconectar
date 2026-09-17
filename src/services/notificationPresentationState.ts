let isAppActive = false;
let isAppFocused = true;
let activeChannelId: string | null = null;

export function setNotificationAppActive(value: boolean) {
  isAppActive = value;
}

export function setNotificationAppFocused(value: boolean) {
  isAppFocused = value;
}

export function setActiveNotificationChannelId(channelId: string | null) {
  activeChannelId = channelId;
}

export function shouldSuppressMobileNotification(
  notificationChannelId: unknown,
  notificationType: unknown,
) {
  if (typeof notificationChannelId !== 'string') {
    return false;
  }

  if (notificationType !== 'chat_message') {
    return false;
  }

  return isAppActive && isAppFocused && activeChannelId === notificationChannelId;
}
