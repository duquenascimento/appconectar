import { isProtectedRoute, useAuthGuard } from '@/src/components/hooks/useAuth';
import { AuthProvider } from '@/src/contexts/auth.context';
import { CombinacaoProvider } from '@/src/contexts/combinacao.context';
import { CombinationSuppliersProvider } from '@/src/contexts/combination-suppliers.context';
import { CombinationProvider } from '@/src/contexts/combination.context';
import { DeliveryDateProvider } from '@/src/contexts/deliveryDate.context';
import { FavoritesProvider } from '@/src/contexts/favoritos.context';
import { SupplierProvider } from '@/src/contexts/fornecedores.context';
import { ProductProvider } from '@/src/contexts/produtos.context';
import { RestaurantProvider } from '@/src/contexts/restaurant.context';
import { checkLocalVersionAndClearData } from '@/src/services/versionService';
import { useFonts } from 'expo-font';
import { router, Stack, usePathname, useSegments } from 'expo-router';
import { useEffect } from 'react';
import { ActivityIndicator, BackHandler, Platform, View } from 'react-native';
import 'react-native-gesture-handler';
import { TamaguiProvider } from 'tamagui';
import config from '../tamagui.config';

// Import react-datepicker CSS for web platform
if (Platform.OS === 'web') {
  require('react-datepicker/dist/react-datepicker.css');
}

export default function RootLayout() {
  const [loaded] = useFonts({
    Inter: require('@tamagui/font-inter/otf/Inter-Medium.otf'),
    InterBold: require('@tamagui/font-inter/otf/Inter-Bold.otf'),
  });

  const { isAuthenticated } = useAuthGuard();
  const segments = useSegments();
  const pathname = usePathname();

  useEffect(() => {
    const backAction = () => {
      return false;
    };
    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);

    return () => backHandler.remove();
  }, []);

  useEffect(() => {
    const initApp = async () => {
      const versionCheckResult = await checkLocalVersionAndClearData();

      if (versionCheckResult.cleared && pathname !== '/') {
        router.replace('/');
        return;
      }
    };
    initApp();
  }, [pathname]);

  const isScreenLoading =
    !loaded ||
    isAuthenticated === null ||
    (isAuthenticated === false && isProtectedRoute(segments));

  return (
    <TamaguiProvider config={config}>
      <AuthProvider>
        <DeliveryDateProvider>
          <RestaurantProvider>
            <FavoritesProvider>
              <ProductProvider>
                <CombinacaoProvider>
                  <CombinationSuppliersProvider>
                    <SupplierProvider>
                      <CombinationProvider>
                        {isScreenLoading ? (
                          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                            <ActivityIndicator size="large" color="#04BF7B" />
                          </View>
                        ) : (
                          <Stack
                            screenOptions={{
                              headerShown: false,
                              animation: 'slide_from_right',
                              gestureEnabled: true,
                            }}
                          />
                        )}
                      </CombinationProvider>
                    </SupplierProvider>
                  </CombinationSuppliersProvider>
                </CombinacaoProvider>
              </ProductProvider>
            </FavoritesProvider>
          </RestaurantProvider>
        </DeliveryDateProvider>
      </AuthProvider>
    </TamaguiProvider>
  );
}
