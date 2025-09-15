import 'react-native-gesture-handler'
import { CombinacaoProvider } from '@/src/contexts/combinacao.context'
import { SupplierProvider } from '@/src/contexts/fornecedores.context'
import { ProductProvider } from '@/src/contexts/produtos.context'
import { Stack } from 'expo-router'
import { TamaguiProvider } from 'tamagui'
import config from '../tamagui.config'
import { useFonts } from 'expo-font'
import { useEffect } from 'react'
import { BackHandler } from 'react-native'

export default function RootLayout() {
  const [loaded] = useFonts({
    Inter: require('@tamagui/font-inter/otf/Inter-Medium.otf'),
    InterBold: require('@tamagui/font-inter/otf/Inter-Bold.otf')
  })

  useEffect(() => {
    const backAction = () => {
      return false
    }
    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backAction
    )

    return () => backHandler.remove()
  }, [])

  if (!loaded) {
    return null
  }

  return (
    <TamaguiProvider config={config}>
      <ProductProvider>
        <CombinacaoProvider>
          <SupplierProvider>
            <Stack
              screenOptions={{
                headerShown: false,
                animation: 'slide_from_right',
                gestureEnabled: true
              }}
            ></Stack>
          </SupplierProvider>
        </CombinacaoProvider>
      </ProductProvider>
    </TamaguiProvider>
  )
}
