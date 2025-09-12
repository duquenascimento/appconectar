import 'react-native-gesture-handler'
import { CombinacaoProvider } from '@/src/contexts/combinacao.context'
import { SupplierProvider } from '@/src/contexts/fornecedores.context'
import { ProductProvider } from '@/src/contexts/produtos.context'
import { Stack } from 'expo-router'
import { TamaguiProvider } from 'tamagui'
import config from '../tamagui.config'
import { useFonts } from 'expo-font'

export default function RootLayout() {
  const [loaded] = useFonts({
    Inter: require('@tamagui/font-inter/otf/Inter-Medium.otf'),
    InterBold: require('@tamagui/font-inter/otf/Inter-Bold.otf')
  })

  if (!loaded) {
    return null
  }

  return (
    <TamaguiProvider config={config}>
      <ProductProvider>
        <CombinacaoProvider>
          <SupplierProvider>
            <Stack screenOptions={{ headerShown: false }}></Stack>
          </SupplierProvider>
        </CombinacaoProvider>
      </ProductProvider>
    </TamaguiProvider>
  )
}
