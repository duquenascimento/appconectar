import { type NativeStackNavigationProp } from '@react-navigation/native-stack'
import { Text, View, Image, ScrollView, XStack, YStack, Separator, Button } from 'tamagui'
import Icons from '@expo/vector-icons/Ionicons'
import React, { useState } from 'react'
import { SafeAreaView, Alert, Platform } from 'react-native'
import CustomHeader from '@/src/components/header/customHeader'
import CustomInfoCard from '@/src/components/card/customInfoCard'
import CustomButton from '../../src/components/button/customButton'
import { getStorage, getToken } from '../utils/utils'
import CustomAlert from '@/src/components/modais/CustomAlert'
export interface Product {
  price: number
  priceWithoutTax: number
  name: string
  sku: string
  quant: number
  orderQuant: number
  obs: string
  priceUnique: number
  priceUniqueWithTaxAndDiscount: number
  image: string[]
  orderUnit: string
}

export interface Discount {
  orderValue: number
  discount: number
  orderWithoutTax: number
  orderWithTax: number
  tax: number
  missingItens: number
  orderValueFinish: number
  product: Product[]
  sku: string
}

export interface Supplier {
  name: string
  externalId: string
  image: string
  missingItens: number
  minimumOrder: number
  hour: string
  discount: Discount
  star: string
}

export interface SupplierData {
  supplier: Supplier
}

type RootStackParamList = {
  Home: undefined
  Products: undefined
  Cart: undefined
  Prices: undefined
  OrderConfirmed: { suppliers: SupplierData[] }
  QuotationDetails: {
    combinationId: string
    combinationName?: string
    suppliersData: SupplierData[]
  }
}

type QuotationDetailsScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'QuotationDetails'>
  route: { params: RootStackParamList['QuotationDetails'] }
}

export function QuotationDetailsScreen({ navigation, route }: QuotationDetailsScreenProps) {
  const { combinationName, suppliersData } = route.params
  const [suppliers] = useState<SupplierData[]>(suppliersData || [])
  const [headerTitle] = useState<string>(combinationName || 'Detalhes da Cotação')
  const [isAlertVisible, setIsAlertVisible] = useState<boolean>(false)

  const totals = React.useMemo(() => {
    if (!suppliers) return { subtotal: 0, discount: 0, grandTotal: 0, totalItems: 0, missingItems: 0 }

    return suppliers.reduce(
      (acc, { supplier }) => {
        acc.subtotal += supplier.discount.orderValue
        acc.discount += supplier.discount.discount
        acc.grandTotal += supplier.discount.orderValueFinish

        const availableItems = supplier.discount.product.filter((p) => p.price > 0)
        acc.totalItems += availableItems.length

        const missingItemsInSupplier = supplier.discount.product.filter((p) => p.price === 0)
        acc.missingItems += missingItemsInSupplier.length

        return acc
      },
      { subtotal: 0, discount: 0, grandTotal: 0, totalItems: 0, missingItems: 0 }
    )
  }, [suppliers])

  const formatCurrency = (value: number) => `R$ ${value.toFixed(2).replace('.', ',')}`
  const formatUnit = (unit: string) => (unit || '').replace('Unid', 'UN')

  const handleBackPress = () => navigation.goBack()
  const handleConfirm = async () => {
    try {
      const token = await getToken()
      if (!token) {
        Alert.alert('Erro', 'Token de autenticação não encontrado.')
        return
      }

      const storedRestaurant = await getStorage('selectedRestaurant')
      if (!storedRestaurant) {
        Alert.alert('Erro', 'Restaurante não encontrado.')
        return
      }

      const parsedRestaurant = JSON.parse(storedRestaurant)

      const body = {
        token,
        suppliers: suppliers.map((s) => s.supplier),
        restaurant: parsedRestaurant
      }

      const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/confirm/conectar-plus`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      })

      if (response.ok) {
        const data = await response.json()
        // Se quiser salvar dados da resposta:
        // await setStorage('finalConfirmData', JSON.stringify(data));
        navigation.navigate('OrderConfirmed', { suppliers: suppliers })
      } else {
        Alert.alert('Erro', 'Erro ao confirmar a combinação.')
        setIsAlertVisible(true)
      }
    } catch (error) {
      console.error('Erro ao confirmar a combinação:', error)
      Alert.alert('Erro', 'Ocorreu um erro inesperado.')
    }
  }

  if (!suppliers || suppliers.length === 0) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
        <CustomHeader title="Erro" onBackPress={handleBackPress} />
        <View flex={1} justifyContent="center" alignItems="center">
          <Text>Não foi possível carregar os dados da cotação.</Text>
        </View>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
      <YStack flex={1} backgroundColor="#FFFFFF" alignSelf="center" width={Platform.OS === 'web' ? '70%' : '100%'} maxWidth={1280}>
        <CustomHeader title={headerTitle} onBackPress={handleBackPress} />

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120, marginTop: 16 }}>
          <YStack gap="$4" px="$4">
            <CustomInfoCard icon="warning" description="Podem ocorrer pequenas variações de peso/tamanho nos produtos, comum ao hortifrúti." />

            {suppliers.map(({ supplier }) => (
              <YStack key={supplier.externalId} bg="white" br={8} p="$3" gap="$3" borderColor="$gray6" borderWidth={1}>
                <XStack ai="center">
                  <Image source={{ uri: supplier.image }} width={Platform.OS === 'web' ? 40 : undefined} height={40} borderRadius={20} />
                  <YStack ml="$3" flex={1}>
                    <Text fontSize={16} fontWeight="bold">
                      {supplier.name.replace('Distribuidora', '').trim()}
                    </Text>
                    <XStack ai="center" gap="$1.5">
                      <Icons name="star" color="#F59E0B" size={14} />
                      <Text fontSize={12} color="$gray10">
                        {supplier.star}
                      </Text>
                    </XStack>
                  </YStack>
                  <YStack ai="flex-end">
                    <Text fontSize={16} fontWeight="bold">
                      {formatCurrency(supplier.discount.orderValueFinish)}
                    </Text>
                    <Text fontSize={12} color="$gray10">
                      {supplier.discount.product.length} item{supplier.discount.product.length !== 1 ? 's' : ''}
                    </Text>
                  </YStack>
                </XStack>

                <YStack gap="$3">
                  {supplier.discount.product.map((product) => (
                    <XStack key={product.sku} ai="center" gap="$3">
                      <Image source={{ uri: product.image[0] }} width={Platform.OS === 'web' ? 40 : undefined} height={40} resizeMode="cover" borderRadius={5} />
                      <YStack flex={1}>
                        <Text fontSize={14} color="$gray12">
                          {product.name}
                        </Text>
                        {product.obs ? (
                          <Text fontSize={10} color="$gray10">
                            Obs: {product.obs}
                          </Text>
                        ) : null}
                      </YStack>
                      <YStack ai="flex-end">
                        <Text fontWeight="bold" fontSize={14} color={product.price ? '$gray12' : '$red10'}>
                          {product.price ? formatCurrency(product.price) : 'Indisponível'}
                        </Text>
                        <Text fontSize={12} color="$gray10">
                          {`${product.quant} ${formatUnit(product.orderUnit)} | ${formatCurrency(product.priceUniqueWithTaxAndDiscount)}/${formatUnit(product.orderUnit)}`}
                        </Text>
                      </YStack>
                    </XStack>
                  ))}
                </YStack>
              </YStack>
            ))}

            {/* Card de totais */}
            <YStack bg="white" br={8} p="$3.5" gap="$2.5" borderColor="$gray6" borderWidth={1}>
              <XStack jc="space-between" ai="center">
                <Text fontSize={14} color="$gray11">
                  Subtotal
                </Text>
                <Text fontSize={14} color="$gray11">
                  {formatCurrency(totals.subtotal)}
                </Text>
              </XStack>
              <XStack jc="space-between" ai="center">
                <Text fontSize={14} color="$gray11">
                  Descontos
                </Text>
                <Text fontSize={14} color="$gray11">
                  - {formatCurrency(totals.discount)}
                </Text>
              </XStack>
              <Separator my="$1" borderColor="$gray4" />
              <XStack jc="space-between" ai="center">
                <Text fontSize={18} fontWeight="bold">
                  Total
                </Text>
                <Text fontSize={18} fontWeight="bold">
                  {formatCurrency(totals.grandTotal)}
                </Text>
              </XStack>
              <Text fontSize={12} color="$gray10" ta="right">
                {totals.totalItems} item{totals.totalItems !== 1 ? 's' : ''} | {totals.missingItems} faltante{totals.missingItems !== 1 ? 's' : ''}
              </Text>
            </YStack>
          </YStack>
        </ScrollView>

        <CustomAlert visible={isAlertVisible} title="Ops!" message="Ocorreu um erro ao confirmar combinação, tente novamente mais tarde." onConfirm={() => setIsAlertVisible(false)} width="35%" />

        {/* 3. Botões do rodapé com a nova lógica e estilo */}
        <View pos="absolute" bottom={0} left={0} right={0} py="$4" px="$4" bg="white" borderTopWidth={1} borderTopColor="$gray4">
          {Platform.OS === 'web' ? (
            <XStack width={'74%'} flexDirection="row" justifyContent="center" gap={10} alignSelf="center">
              <YStack f={1}>
                <Button
                  onPress={handleBackPress}
                  hoverStyle={{
                    backgroundColor: '#333333',
                    opacity: 0.9
                  }}
                  backgroundColor="#000000"
                  color="#FFFFFF"
                  borderColor="#A9A9A9"
                  borderWidth={1}
                >
                  Voltar
                </Button>
              </YStack>
              <YStack f={1}>
                <Button
                  onPress={handleConfirm}
                  hoverStyle={{
                    backgroundColor: '#1DC588',
                    opacity: 0.9
                  }}
                  backgroundColor="#1DC588"
                  color="#FFFFFF"
                  borderColor="#A9A9A9"
                  borderWidth={1}
                >
                  Confirmar combinação
                </Button>
              </YStack>
            </XStack>
          ) : (
            <XStack width={'88%'} flexDirection="row" justifyContent="center" gap={10} alignSelf="center">
              <YStack f={1}>
                <CustomButton title="Voltar" onPress={handleBackPress} backgroundColor="#000000" textColor="#FFFFFF" />
              </YStack>
              <YStack f={1}>
                <CustomButton title="Confirmar" onPress={handleConfirm} backgroundColor="#1DC588" textColor="#FFFFFF" />
              </YStack>
            </XStack>
          )}
        </View>
      </YStack>
    </SafeAreaView>
  )
}
