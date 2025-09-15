import 'react-native-gesture-handler'
import { CombinacaoProvider } from '@/src/contexts/combinacao.context'
import { SupplierProvider } from '@/src/contexts/fornecedores.context'
import { ProductProvider } from '@/src/contexts/produtos.context'
import { Stack, useRouter, useSegments } from 'expo-router'
import { TamaguiProvider } from 'tamagui'
import config from '../tamagui.config'
import { useFonts } from 'expo-font'
import { useEffect } from 'react'
import { ActivityIndicator, BackHandler, View } from 'react-native'
import { isProtectedRoute, useAuth } from '@/src/components/hooks/useAuth'

export default function RootLayout() {
  const [loaded] = useFonts({
    Inter: require('@tamagui/font-inter/otf/Inter-Medium.otf'),
    InterBold: require('@tamagui/font-inter/otf/Inter-Bold.otf')
  })

  const { isAuthenticated } = useAuth()
  const segments = useSegments()
  const router = useRouter()

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

  if (
    !loaded ||
    isAuthenticated === null ||
    (isAuthenticated === false && isProtectedRoute(segments))
  ) {
    return (
      <View flex={1} justifyContent="center" alignItems="center">
        <ActivityIndicator size="large" color="#04BF7B" />
      </View>
    )
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
