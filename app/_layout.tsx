
import  Sign  from './index'
import  Products from './products'
import { NavigationContainer } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import  Cart from './cart'
import Prices from './prices'
import { Confirm } from './confirm'
import  FinalConfirm from './/finalConfirm'
import  Register  from './register'
import  RegisterFinished from './registerFinished'
import  OrdersScreen  from './OrdersScreen'
import { OrderDetailsScreen } from './OrderDetailsScreen'
import { Combination } from '@/src/components/Combination/combination'
import PreferencesScreen from './PreferencesScreen'
import  QuotationDetailsScreen from './QuotationDetailsScreen'
import  OrderConfirmedScreen  from './OrderConfirmedScreen'
// import 'react-native-reanimated';
import 'react-native-gesture-handler'
import { CombinacaoProvider } from '@/src/contexts/combinacao.context'
import { SupplierProvider } from '@/src/contexts/fornecedores.context'
import { ProductProvider } from '@/src/contexts/produtos.context'
import { Stack } from "expo-router"
import { TamaguiProvider } from "tamagui"
import config from "../tamagui.config"
import { useFonts } from "expo-font"

export default function RootLayout() {
  const [loaded] = useFonts({
    Inter: require("@tamagui/font-inter/otf/Inter-Medium.otf"),
    InterBold: require("@tamagui/font-inter/otf/Inter-Bold.otf"),
  })

  if (!loaded) {
    return null
  }

  return (
    <TamaguiProvider config={config}>
      <ProductProvider>
        <CombinacaoProvider>
          <SupplierProvider>
            <Stack screenOptions={{ headerShown: false }}>
              <Stack.Screen name="index" />
              <Stack.Screen name="products" />
              <Stack.Screen name="cart" />
              <Stack.Screen name="prices" />
              <Stack.Screen name="confirm" />
              <Stack.Screen name="finalConfirm" />
              <Stack.Screen name="register" />
              <Stack.Screen name="registerFinished" />
              <Stack.Screen name="orders" />
              <Stack.Screen name="orderDetails" />
              <Stack.Screen name="combination" />
              <Stack.Screen name="preferences" />
              <Stack.Screen name="quotationDetails" />
              <Stack.Screen name="orderConfirmed" />
            </Stack>
          </SupplierProvider>
        </CombinacaoProvider>
      </ProductProvider>
    </TamaguiProvider>
  )
}
