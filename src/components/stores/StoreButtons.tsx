import Icons from '@expo/vector-icons/Ionicons';
import { Button, Text, YStack } from 'tamagui';
import type { DeviceStore } from '@/src/utils/mobileBrowser';
import { openStore } from './storeLinks';

const STORES: Record<DeviceStore, { label: string; icon: keyof typeof Icons.glyphMap }> = {
  ios: { label: 'Baixar na App Store', icon: 'logo-apple' },
  android: { label: 'Baixar no Google Play', icon: 'logo-google-playstore' },
};

interface StoreButtonsProps {
  deviceStore: DeviceStore;
}

function StoreButton({ store, primary }: { store: DeviceStore; primary: boolean }) {
  const { label, icon } = STORES[store];
  const textColor = primary ? 'white' : '#049A63';
  const backgroundColor = primary ? '#04BF7B' : 'white';

  return (
    <Button
      data-testid={`loja-botao-${store}`}
      onPress={() => openStore(store)}
      height={48}
      width="100%"
      gap="$2"
      backgroundColor={backgroundColor}
      borderWidth={primary ? 0 : 1}
      borderColor="#049A63"
      borderRadius={9}
      hoverStyle={{ opacity: 0.9, backgroundColor }}
      icon={<Icons name={icon} size={22} color={textColor} />}
    >
      <Text fontSize={16} fontWeight="500" color={textColor}>
        {label}
      </Text>
    </Button>
  );
}

export function StoreButtons({ deviceStore }: StoreButtonsProps) {
  const otherStore: DeviceStore = deviceStore === 'ios' ? 'android' : 'ios';

  return (
    <YStack width="100%" gap="$3">
      <StoreButton store={deviceStore} primary />
      <StoreButton store={otherStore} primary={false} />
    </YStack>
  );
}
