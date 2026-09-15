import { useEffect } from 'react';
import { Platform } from 'react-native';

import { PushNotificationData } from '../types/pushTypes';
import { parsePushNotificationData } from '../utils/pushNotificationData';

interface UseInitialNotificationUrlHandlerParams {
  onNotificationData: (data: PushNotificationData) => void | Promise<void>;
}

const NOTIFICATION_QUERY_PARAMS = [
  'notificationChannelId',
  'notificationChannelType',
  'notificationType',
  'notificationOrderId',
  'notificationMessageId',
];

export function useInitialNotificationUrlHandler({
  onNotificationData,
}: UseInitialNotificationUrlHandlerParams) {
  useEffect(() => {
    if (Platform.OS !== 'web') {
      return undefined;
    }

    if (typeof window === 'undefined') {
      return undefined;
    }

    const params = new URLSearchParams(window.location.search);
    const channelId = params.get('notificationChannelId');

    if (!channelId) {
      return undefined;
    }

    const notificationData = parsePushNotificationData({
      channelId,
      channelType: params.get('notificationChannelType'),
      type: params.get('notificationType'),
      orderId: params.get('notificationOrderId'),
      messageId: params.get('notificationMessageId'),
    });

    if (notificationData) {
      onNotificationData(notificationData);
    }

    NOTIFICATION_QUERY_PARAMS.forEach((param) => params.delete(param));

    const newSearch = params.toString();

    const newUrl = `${window.location.pathname}${newSearch ? `?${newSearch}` : ''}`;

    window.history.replaceState({}, '', newUrl);

    return undefined;
  }, [onNotificationData]);
}
