// src/_layout.tsx
import { useFonts } from 'expo-font';
import { TamaguiProvider } from 'tamagui';
import config from '../tamagui.config';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Sign } from './index';
import Products from './screens/products';
import Cart from './screens/cart';
import Prices from './screens/prices';
import Confirm from './screens/confirm';
import FinalConfirm from './screens/finalConfirm';
import Register from './screens/register';
import RegisterFinished from './screens/registerFinished';
import OrdersScreen from './screens/OrdersScreen';
import OrderDetailsScreen from './screens/OrderDetailsScreen';
import 'react-native-gesture-handler';

type RootStackParamList = {
    Sign: undefined;
    Products: undefined;
    Cart: undefined;
    Prices: undefined;
    Confirm: undefined;
    FinalConfirm: undefined;
    Register: undefined;
    RegisterFinished: undefined;
    Orders: undefined;
    OrderDetails: { orderId: string };
};

const Navigation = createNativeStackNavigator<RootStackParamList>();

export default function App() {

    const [loaded] = useFonts({
        Inter: require('@tamagui/font-inter/otf/Inter-Medium.otf'),
        InterBold: require('@tamagui/font-inter/otf/Inter-Bold.otf'),
    });

    if (!loaded) {
        return null;
    }

    return (
        <TamaguiProvider config={config}>
            <Navigation.Navigator
                screenOptions={{ headerShown: false }}
                initialRouteName="Sign"
            >
                <Navigation.Screen name="Sign" component={Sign} />
                <Navigation.Screen name="Products" component={Products} />
                <Navigation.Screen name="Cart" component={Cart} />
                <Navigation.Screen name="Prices" component={Prices} />
                <Navigation.Screen name="Confirm" component={Confirm} />
                <Navigation.Screen name="FinalConfirm" component={FinalConfirm} />
                <Navigation.Screen name="Register" component={Register} />
                <Navigation.Screen name="RegisterFinished" component={RegisterFinished} />
                <Navigation.Screen name="Orders" component={OrdersScreen} />
                <Navigation.Screen
                    name="OrderDetails"
                    component={OrderDetailsScreen}
                    options={{ title: 'Detalhes do Pedido' }}
                />
            </Navigation.Navigator>
        </TamaguiProvider>
    );
}




