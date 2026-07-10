import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

if (Platform.OS === 'android' || Platform.OS === 'ios') {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });
}
