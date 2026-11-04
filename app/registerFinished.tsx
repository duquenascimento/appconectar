import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Platform, ScrollView } from 'react-native';
import { View, Text, Button } from 'tamagui';
import Icons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { StoreButtons } from '@/src/components/stores/StoreButtons';
import { DeviceStore, detectDeviceStore } from '@/src/utils/mobileBrowser';

type RootStackParamList = {
  Home: undefined;
  Products: undefined;
  Confirm: undefined;
  Prices: undefined;
  RegisterFinished: undefined;
};

type HomeScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Home'>;
};

const INVITE_TEXT = 'Baixe o app Conéctar para fazer seus pedidos de onde estiver.';

function getBrowserDeviceStore(): DeviceStore | null {
  if (Platform.OS !== 'web' || typeof navigator === 'undefined') return null;
  return detectDeviceStore({
    userAgent: navigator.userAgent,
    maxTouchPoints: navigator.maxTouchPoints,
  });
}

export default function RegisterFinished({ navigation }: HomeScreenProps) {
  const deviceStore = getBrowserDeviceStore();

  const goToProducts = () => {
    router.push('products');
  };

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: '#F0F2F6' }}
      contentContainerStyle={{
        flexGrow: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 30,
      }}
    >
      <Icons size={90} color="#04BF7B" name="checkmark-circle" />
      <Text data-testid="conclusao-titulo" paddingBottom={25} fontSize={30}>
        Cadastro feito!
      </Text>

      {deviceStore ? (
        <View width="100%" maxWidth={400} alignItems="center" gap="$4">
          <Text data-testid="conclusao-convite" fontSize={16} color="$gray11" textAlign="center">
            {INVITE_TEXT}
          </Text>
          <StoreButtons deviceStore={deviceStore} />
          <Button
            data-testid="conclusao-continuar-web"
            onPress={goToProducts}
            height={48}
            chromeless
            backgroundColor="transparent"
          >
            <Text fontSize={16} color="#049A63">
              Continuar na web
            </Text>
          </Button>
        </View>
      ) : (
        <View padding={15} borderRadius={5} width="80%">
          <Button
            data-testid="conclusao-continuar"
            onPress={goToProducts}
            backgroundColor="#04BF7B"
            gap="$2"
            icon={<Icons size={20} color="white" name="checkmark" />}
          >
            <Text color="white">Continuar</Text>
          </Button>
        </View>
      )}
    </ScrollView>
  );
}
