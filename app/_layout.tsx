import { useFonts } from 'expo-font'
import { TamaguiProvider } from 'tamagui'
import config from '../tamagui.config'
import { Sign } from './index'
import { Products } from './screens/products'
import { NavigationContainer } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { Cart } from './screens/cart'
import { Prices } from './screens/prices'
import { Confirm } from './screens/confirm'
import { FinalConfirm } from './screens/finalConfirm'
import { Register } from './screens/register'
import { RegisterFinished } from './screens/registerFinished'
import { OrdersScreen } from './screens/OrdersScreen'
import { OrderDetailsScreen } from './screens/OrderDetailsScreen'
import { Combination } from '@/src/components/Combination/combination'
import PreferencesScreen from './screens/PreferencesScreen'
import { QuotationDetailsScreen } from './screens/QuotationDetailsScreen'
import { OrderConfirmedScreen } from './screens/OrderConfirmedScreen'
// import 'react-native-reanimated';
import 'react-native-gesture-handler'
import { CombinacaoProvider } from '@/src/contexts/combinacao.context'
import { ProductProvider } from '@/src/contexts/produtos.context'

const Navigation = createNativeStackNavigator()

export default function App() {
  const [loaded] = useFonts({
    Inter: require('@tamagui/font-inter/otf/Inter-Medium.otf'),
    InterBold: require('@tamagui/font-inter/otf/Inter-Bold.otf')
  })

  if (!loaded) {
    return null
  }

  return (
    <NavigationContainer independent={true}>
      <TamaguiProvider config={config}>
        <ProductProvider>
          <CombinacaoProvider>
            <Navigation.Navigator screenOptions={{ headerShown: false }} initialRouteName="Home">
              <Navigation.Screen name="Sign" component={Sign} />
              <Navigation.Screen name="Products" component={Products} />
              <Navigation.Screen name="Cart" component={Cart} />
              <Navigation.Screen name="Prices" component={Prices} />
              <Navigation.Screen name="Confirm" component={Confirm} />
              <Navigation.Screen name="FinalConfirm" component={FinalConfirm} />
              <Navigation.Screen name="Register" component={Register} />
              <Navigation.Screen name="RegisterFinished" component={RegisterFinished} />
              <Navigation.Screen name="Orders" component={OrdersScreen} />
              <Navigation.Screen name="OrderDetails" component={OrderDetailsScreen} />
              <Navigation.Screen name="Combination" component={Combination} />
              <Navigation.Screen name="Preferences" component={PreferencesScreen} />
              <Navigation.Screen name="QuotationDetails" component={QuotationDetailsScreen} />
              <Navigation.Screen name="OrderConfirmed" component={OrderConfirmedScreen} />
            </Navigation.Navigator>
          </CombinacaoProvider>
        </ProductProvider>
      </TamaguiProvider>
    </NavigationContainer>
  )
}
