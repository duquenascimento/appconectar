import { useFonts } from 'expo-font';
import { TamaguiProvider, YStack, Stack } from 'tamagui';
import config from './tamagui.config';
import { Sign } from './src/components/sign';

export default function App() {
  const [loaded] = useFonts({
    Inter: require("@tamagui/font-inter/otf/Inter-Medium.otf"),
    InterBold: require("@tamagui/font-inter/otf/Inter-Bold.otf"),
  });

  if (!loaded) {
    return null;
  }

  return (
    <TamaguiProvider config={config}>
      <Stack bg={"$background"} f={1} justifyContent='center' alignItems='center'>
        <YStack height='100%'>
          <Sign />
        </YStack>
      </Stack>
    </TamaguiProvider>
  );
} 

