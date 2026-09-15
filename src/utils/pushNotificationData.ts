import { ChannelType, PushNotificationData } from '../types/pushTypes';

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

function parseChannelType(value: unknown): ChannelType | null {
  return value === 'restaurant' || value === 'supplier' ? value : null;
}

export function parsePushNotificationData(
  data: Record<string, unknown> | null | undefined,
): PushNotificationData | null {
  if (!data) {
    return null;
  }

  const channelType = parseChannelType(data.channelType);
  const channelId = isNonEmptyString(data.channelId) ? data.channelId : null;

  if (!channelType || !channelId) {
    return null;
  }

  const channelKey = isNonEmptyString(data.channelKey)
    ? data.channelKey
    : `${channelType}:${channelId}`;

  if (data.type === 'order_confirmed') {
    if (!isNonEmptyString(data.orderId)) {
      return null;
    }

    return {
      type: 'order_confirmed',
      channelType,
      channelId,
      channelKey,
      orderId: data.orderId,
    };
  }

  if (data.type === 'chat_message') {
    return {
      type: 'chat_message',
      channelType,
      channelId,
      channelKey,
      messageId: isNonEmptyString(data.messageId) ? data.messageId : undefined,
    };
  }

  return null;
}
