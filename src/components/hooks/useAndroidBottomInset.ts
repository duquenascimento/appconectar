import { Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// O SafeAreaView do react-native só aplica a área segura no iOS. Em aparelhos Android que desenham
// o app atrás da barra de navegação do sistema, esse recuo precisa ser aplicado à mão; nos demais
// ele vale 0.
export const useAndroidBottomInset = (): number => {
  const { bottom } = useSafeAreaInsets();
  return Platform.OS === 'android' ? bottom : 0;
};
