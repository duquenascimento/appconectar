import { type NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Stack, Text, View, Image, ScrollView, XStack, YStack, Separator } from 'tamagui';
import Icons from '@expo/vector-icons/Ionicons';
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, SafeAreaView, Alert } from 'react-native';

// import { getQuotationDetailsByCombinationId } from '../services/combinationsService';

import { mockSuppliersData } from '../../src/components/data/mockDataQuotationDetails';

import CustomHeader from '@/src/components/header/customHeader';
import CustomInfoCard from '@/src/components/card/customInfoCard';
import CustomButton from '../../src/components/button/customButton';

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
  QuotationDetails: { combinationId: string; combinationName?: string }; 
};

type QuotationDetailsScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'QuotationDetails'>;
  route: { params: { combinationId: string; combinationName?: string } };
};

export function QuotationDetailsScreen({ navigation, route }: QuotationDetailsScreenProps) {
  const { combinationId, combinationName } = route.params;
  const [loading, setLoading] = useState<boolean>(true);
  const [suppliers, setSuppliers] = useState<SupplierData[]>([]);
  const [headerTitle, setHeaderTitle] = useState<string>(combinationName || 'Detalhes da Cotação');

  const loadQuotationData = useCallback(async () => {
    setLoading(true);

    await new Promise(resolve => setTimeout(resolve, 1000));
    const detailedQuotation = mockSuppliersData;
    
    if (detailedQuotation && detailedQuotation.length > 0) {
      setSuppliers(detailedQuotation);
    } else {
      Alert.alert("Aviso", "Não foram encontrados dados de exemplo para esta combinação.");
      navigation.goBack();
    }
    
    setLoading(false);

    /*
      // --- BLOCO DE CÓDIGO PARA QUANDO A API ESTIVER PRONTA ---
      // Quando o backend estiver funcionando, substitua o código acima por este:
      
      try {
        // 1. Descomente a linha abaixo para chamar a API real
        // const detailedQuotation = await getQuotationDetailsByCombinationId(combinationId);
        
        if (detailedQuotation && detailedQuotation.length > 0) {
          setSuppliers(detailedQuotation);
        } else {
          Alert.alert("Aviso", "Nenhum fornecedor encontrado para esta combinação.");
          navigation.goBack();
        }
      } catch (error) {
        console.error('Erro ao buscar detalhes da cotação:', error);
        Alert.alert("Erro", "Não foi possível carregar os detalhes da cotação. Tente novamente.");
        navigation.goBack();
      } finally {
        setLoading(false);
      }
    */
  }, [combinationId, navigation]);

  useEffect(() => {
    loadQuotationData();
  }, [loadQuotationData]);

  // Lógica de cálculo de totais (mantenha como está)
  const totals = React.useMemo(() => {
    return suppliers.reduce(
      (acc, { supplier }) => {
        acc.subtotal += supplier.discount.orderValue;
        acc.discount += supplier.discount.discount;
        acc.grandTotal += supplier.discount.orderValueFinish;
        acc.totalItems += supplier.discount.product.filter(p => p.price > 0).length;
        acc.missingItems += supplier.missingItens;
        return acc;
      },
      { subtotal: 0, discount: 0, grandTotal: 0, totalItems: 0, missingItems: 0 }
    );
  }, [suppliers]);

  const formatCurrency = (value: number) => `R$ ${value.toFixed(2).replace('.', ',')}`;
  const formatUnit = (unit: string) => (unit || '').replace('Unid', 'UN');
  const handleBackPress = () => navigation.goBack();

  if (loading) {
    return (
      <View flex={1} justifyContent="center" alignItems="center" bg="#F0F2F6">
        <ActivityIndicator size="large" color="#04BF7B" />
        <Text fontSize={16} mt="$3" color="$gray10">
          Gerando melhor cotação...
        </Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
      <YStack
        flex={1}
        backgroundColor="#FFFFFF"
        alignSelf="center"
        width="100%"
        $gtMd={{
          maxWidth: 768
        }}
      >
        <CustomHeader title={headerTitle} onBackPress={handleBackPress} />

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 120, marginTop: 16 }}
        >
          <YStack gap="$4" px="$4">
            <CustomInfoCard
              icon="warning"
              description="Podem ocorrer pequenas variações de peso/tamanho nos produtos, comum ao hortifrúti."
            />

            {suppliers.map(({ supplier }) => (
              <YStack
                key={supplier.externalId}
                bg="white"
                br={8}
                p="$3"
                gap="$3"
                borderColor='$gray6'
                borderWidth={1}
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

            <YStack bg="white" br={8} p="$3.5" gap="$2.5" borderColor='$gray6' borderWidth={1}>
              {/* ... JSX para totais ... */}
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

        <XStack pos="absolute" bottom={0} left={0} right={0} py="$4" px="$4" bg="white" gap="$3" borderTopWidth={1} borderTopColor="$gray4" alignItems="stretch">
          <CustomButton title="Alterar itens" onPress={() => navigation.replace('Back')} backgroundColor="black" flex={1} borderRadius={10} textColor="white" />
          <CustomButton title="Confirmar combinação" onPress={() => navigation.replace('Products')} backgroundColor="#04BF7B" flex={1} borderRadius={10} textColor="white" />
        </XStack>
      </YStack>
    </SafeAreaView>
  );
}