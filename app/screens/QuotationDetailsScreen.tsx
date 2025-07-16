import { type NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Stack, Text, View, Image, ScrollView, XStack, YStack, Separator } from 'tamagui';
import Icons from '@expo/vector-icons/Ionicons';
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, SafeAreaView } from 'react-native';
import { getStorage } from '../utils/utils';
import CustomButton from '../../src/components/button/CustomButton';
import CustomHeader from '@/src/components/header/customHeader';
import CustomInfoCard from '@/src/components/card/customInfoCard';

export interface Product {
  price: number;
  priceWithoutTax: number;
  name: string;
  sku: string;
  quant: number;
  orderQuant: number;
  obs: string;
  priceUnique: number;
  priceUniqueWithTaxAndDiscount: number;
  image: string[];
  orderUnit: string;
}

export interface Discount {
  orderValue: number;
  discount: number;
  orderWithoutTax: number;
  orderWithTax: number;
  tax: number;
  missingItens: number;
  orderValueFinish: number;
  product: Product[];
  sku: string;
}

export interface Supplier {
  name: string;
  externalId: string;
  image: string; 
  missingItens: number;
  minimumOrder: number;
  hour: string;
  discount: Discount;
  star: string;
}

export interface SupplierData {
  supplier: Supplier;
}

type RootStackParamList = {
  Home: undefined;
  Products: undefined;
  Cart: undefined;
  Prices: undefined;
  QuotationDetails: { suppliersData: SupplierData[] };
};

type QuotationDetailsScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'QuotationDetails'>;
  route: { params: { suppliersData: SupplierData[] } };
};

export function QuotationDetailsScreen({ navigation, route }: QuotationDetailsScreenProps) {
  const [loading, setLoading] = useState<boolean>(true);
  const [suppliers, setSuppliers] = useState<SupplierData[]>([]);

  // Carregamento dos dados (API, storage ou mock)
  const loadQuotationData = useCallback(async () => {
    try {
      const { suppliersData } = route.params;
      if (suppliersData && suppliersData.length > 0) {
        setSuppliers(suppliersData);
      } else {
        const storedSuppliersText = await getStorage('selectedSuppliersForQuotation');
        if (storedSuppliersText) {
          setSuppliers(JSON.parse(storedSuppliersText));
        } else {
          navigation.replace('Prices');
        }
      }
    } catch (error) {
      console.error('Error loading quotation data:', error);
      navigation.replace('Prices');
    } finally {
      setLoading(false);
    }
  }, [route.params, navigation]);

  //    Simulação de chamada de API
  //  setLoading(true); 
  //   try {
  //     const response = await fetch('https://api-conectar+.com/endpoint/cotacoes');
  //     const dataFromApi: SupplierData[] = await response.json();
  //     setSuppliers(dataFromApi);
  //   } catch (error) {
  //     console.error('Falha ao buscar dados da cotação:', error);
  //   } finally {
  //     setLoading(false);
  //   }
  // }, []);

  useEffect(() => {
    loadQuotationData();
  }, [loadQuotationData]);

  const totals = React.useMemo(() => {
    return suppliers.reduce(
      (acc, { supplier }) => {
        acc.subtotal += supplier.discount.orderValue;
        acc.discount += supplier.discount.discount;
        acc.grandTotal += supplier.discount.orderValueFinish;
        acc.totalItems += supplier.discount.product.length;
        acc.missingItems += supplier.missingItens;
        return acc;
      },
      { subtotal: 0, discount: 0, grandTotal: 0, totalItems: 0, missingItems: 0 }
    );
  }, [suppliers]);

  if (loading) {
    return (
      <View flex={1} justifyContent="center" alignItems="center" bg="#F0F2F6">
        <ActivityIndicator size="large" color="#04BF7B" />
        <Text fontSize={16} mt="$3" color="$gray10">
          Carregando detalhes da cotação...
        </Text>
      </View>
    );
  }

const formatCurrency = (value: number) => `R$ ${value.toFixed(2).replace('.', ',')}`;
const formatUnit = (unit: string) => unit.replace('Unid', 'UN');

const handleBackPress = () => navigation.goBack();

return (
  <SafeAreaView style={{ flex: 1, backgroundColor: '#F0F2F6' }}>
    <YStack 
      flex={1} 
      backgroundColor="#F0F2F6" 
      alignSelf="center" 
      width="100%"
      $gtMd={{ 
        maxWidth: 768 
      }}
    >
      {/* <XStack ai="center" p="$4" pb="$2" gap="$4">
        <Icons onPress={() => navigation.replace('Prices')} size={28} name="arrow-back" color="$gray12" />
        <Text fontSize={18} fontWeight="bold">
          Combinação 1
        </Text>
      </XStack> */}

      <CustomHeader title="Combinação 1" 
      onBackPress={handleBackPress} 
      />
      
      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 }}
      >
        <YStack px="$4" gap="$4">
          {/* <XStack bg="#FEF3C7" p="$3" borderRadius={8} alignItems="center" gap="$3">
            <Icons name="warning" size={20} color="#F59E0B" />
            <Text fontSize={12} color="$gray11" flex={1}>
              Podem ocorrer pequenas variações de peso/tamanho nos produtos, comum ao hortifrúti.
            </Text>
          </XStack> */}

          <CustomInfoCard
            description="Podem ocorrer pequenas variações de peso/tamanho nos produtos, comum ao hortifrúti."
          />

          {suppliers.map(({ supplier }) => (
            <YStack 
              key={supplier.externalId} 
              bg="white" 
              br={8} 
              p="$3" 
              gap="$3"
              $gtSm={{
                  hoverStyle: {
                  borderColor: '$gray6',
                  borderWidth: 1
                }
              }}
            >
              <XStack ai="center">
                  <Image
                    source={{ uri: supplier.image }}
                    width={40}
                    height={40}
                    borderRadius={20}
                  />
                <YStack ml="$3" flex={1}>
                  <Text fontSize={16} fontWeight="bold">
                    {supplier.name.replace('Distribuidora', '').trim()}
                  </Text>
                  <XStack ai="center" gap="$1.5">
                    <Icons name="star" color="#F59E0B" size={14} />
                    <Text fontSize={12} color="$gray10">{supplier.star}</Text>
                  </XStack>
                </YStack>
                <YStack ai="flex-end">
                  <Text fontSize={16} fontWeight="bold">
                    {formatCurrency(supplier.discount.orderValueFinish)}
                  </Text>
                  <Text fontSize={12} color="$gray10">
                    {supplier.discount.product.length} item(s) / {supplier.missingItens} faltante(s)
                  </Text>
                </YStack>
              </XStack>

              <YStack gap="$3">
                {supplier.discount.product.map((product) => (
                  <XStack key={product.sku} ai="center" gap="$3">
                    <Image
                      source={{ uri: product.image[0] }}
                      width={40}
                      height={40}
                      borderRadius={5}
                    />
                    <YStack flex={1}>
                      <Text fontSize={14} color="$gray12">{product.name}</Text>
                      {product.obs ? (
                        <Text fontSize={10} color="$gray10">Obs: {product.obs}</Text>
                      ) : null}
                    </YStack>
                    <YStack ai="flex-end">
                      <Text fontWeight="bold" fontSize={14} color={product.price ? '$gray12' : '$red10'}>
                        {product.price ? formatCurrency(product.price) : 'Indisponível'}
                      </Text>
                      <Text fontSize={12} color="$gray10">
                        {`${product.quant} ${formatUnit(product.orderUnit)} | ${formatCurrency(product.priceUnique)}/${formatUnit(product.orderUnit)}`}
                      </Text>
                    </YStack>
                  </XStack>
                ))}
              </YStack>
            </YStack>
          ))}

          {/* card de totais... */}
          <YStack bg="white" br={8} p="$3.5" gap="$2.5">
              <XStack jc="space-between" ai="center">
                <Text fontSize={14} color="$gray11">Subtotal</Text>
                <Text fontSize={14} color="$gray11">{formatCurrency(totals.subtotal)}</Text>
              </XStack>
              <XStack jc="space-between" ai="center">
                <Text fontSize={14} color="$gray11">Descontos</Text>
                <Text fontSize={14} color="$gray11">- {formatCurrency(totals.discount)}</Text>
              </XStack>
              <Separator my="$1" borderColor="$gray4" />
              <XStack jc="space-between" ai="center">
                <Text fontSize={18} fontWeight="bold">Total</Text>
                <Text fontSize={18} fontWeight="bold">{formatCurrency(totals.grandTotal)}</Text>
              </XStack>
              <Text fontSize={12} color="$gray10" ta="right">
                {totals.totalItems} item(s) | {totals.missingItems} faltante(s)
              </Text>
          </YStack>
        </YStack>
      </ScrollView>

      {/* Os botões do rodapé respeitam a largura máxima do container pai */}
      <XStack pos="absolute" bottom={0} left={0} right={0} p="$4" bg="white" gap="$3" borderTopWidth={1} borderTopColor="$gray4">
        <CustomButton title="Alterar itens" onPress={() => navigation.replace('Cart')} backgroundColor="black" flex={1} borderRadius={10} textColor="white"/>
        <CustomButton title="Confirmar combinação" onPress={() => navigation.replace('Products')} backgroundColor="#04BF7B" flex={1} borderRadius={10} textColor="white"/>
      </XStack>
    </YStack>
  </SafeAreaView>
);
}