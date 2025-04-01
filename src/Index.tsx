import { useFonts } from "expo-font";
import { TamaguiProvider, YStack, Stack } from "tamagui";
import config from "../tamagui.config";
import { Sign } from "./components/Sign";
import { Products } from "./components/products";
import { Slot } from "expo-router";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import * as SecureStore from "expo-secure-store";
import { type NativeStackNavigationProp } from "@react-navigation/native-stack";

const Navigation = createNativeStackNavigator();

export default function App() {
  const [loaded] = useFonts({
    Inter: require("@tamagui/font-inter/otf/Inter-Medium.otf"),
    InterBold: require("@tamagui/font-inter/otf/Inter-Bold.otf"),
  });

  if (!loaded) {
    return null;
  }

  return (
    <NavigationContainer>
      <TamaguiProvider config={config}>
        <Navigation.Navigator
          initialRouteName="Sign"
          screenOptions={{ headerShown: false }}
        >
          <Navigation.Screen name="Sign" component={Sign} />
          <Navigation.Screen name="Products" component={Products} />
        </Navigation.Navigator>
      </TamaguiProvider>
    </NavigationContainer>
  );
}
