import { useFonts } from 'expo-font'
import { TamaguiProvider } from 'tamagui'
import config from '../tamagui.config'
import 'react-native-gesture-handler'
import { CombinacaoProvider } from '@/src/contexts/combinacao.context'
import { SupplierProvider } from '@/src/contexts/fornecedores.context'
import { ProductProvider } from '@/src/contexts/produtos.context'

export default function App() {
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
          <SupplierProvider></SupplierProvider>
        </CombinacaoProvider>
      </ProductProvider>
    </TamaguiProvider>
  )
}
