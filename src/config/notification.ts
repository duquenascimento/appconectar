import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';

import { shouldSuppressMobileNotification } from '../services/notificationPresentationState';

if (Platform.OS === 'android' || Platform.OS === 'ios') {
  Notifications.setNotificationHandler({
    handleNotification: async (notification) => {
      const notificationChannelId = notification.request.content.data?.channelId;

      const shouldSuppress = shouldSuppressMobileNotification(notificationChannelId);

      if (shouldSuppress) {
        console.log('Notificação ignorada: usuário já está visualizando esse canal.');
      }

      return {
        shouldShowBanner: !shouldSuppress,
        shouldShowList: !shouldSuppress,
        shouldPlaySound: !shouldSuppress,
        shouldSetBadge: false,
      };
    },
  });
}
