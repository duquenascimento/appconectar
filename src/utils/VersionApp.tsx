import { Platform } from 'react-native';
import { Text, View } from 'tamagui';
import { getStorageRestaurant } from './restaurantUtils';

export function VersionInfo() {
  return (
    <View position="absolute" bottom={2} right={10}>
      <Text fontSize={10} color="gray">
        v{process.env.EXPO_PUBLIC_VERSION}
      </Text>
    </View>
  );
}