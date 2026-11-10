import { Platform } from 'react-native';
import * as Application from 'expo-application';

const isWebPlatform = Platform.OS === 'web';

export default async function getDeviceId() {
  if (isWebPlatform) {
    return null;
  }

  if (Platform.OS === 'android') {
    return Application.getAndroidId();
  }

  if (Platform.OS === 'ios') {
    return Application.getIosIdForVendorAsync();
  }

  return null;
}
