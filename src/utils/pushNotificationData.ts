import {
  ChannelType,
  OrderNotificationData,
  OrderNotificationType,
  PushNotificationData,
} from '../types/pushTypes';

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

function parseChannelType(value: unknown): ChannelType | null {
  return value === 'restaurant' || value === 'supplier' ? value : null;
}

function parseOrderNotificationType(value: unknown): OrderNotificationType | null {
  return value === 'order_confirmed' || value === 'order_rejected' ? value : null;
}

export function isOrderNotification(data: PushNotificationData): data is OrderNotificationData {
  return parseOrderNotificationType(data.type) !== null;
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

  const orderNotificationType = parseOrderNotificationType(data.type);

  if (orderNotificationType) {
    if (!isNonEmptyString(data.orderId)) {
      return null;
    }

    return {
      type: orderNotificationType,
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
