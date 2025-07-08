import { type NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Stack, Text, View, Image, ScrollView, XStack } from 'tamagui'; // Removido 'Button'
import Icons from '@expo/vector-icons/Ionicons';
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Platform } from 'react-native';
import { getStorage } from '../utils/utils';
import CustomButton from '../../src/components/button/CustomButton'; 

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
  const [totalQuotationValue, setTotalQuotationValue] = useState<number>(0);

  const loadQuotationData = useCallback(async () => {
    try {
      const { suppliersData } = route.params;
      if (suppliersData && suppliersData.length > 0) {
        setSuppliers(suppliersData);
        const total = suppliersData.reduce((acc, supplierData) => {
          return acc + supplierData.supplier.discount.orderValueFinish;
        }, 0);
        setTotalQuotationValue(total);
      } else {
        console.warn('No quotation data received, attempting to load from storage.');
        const storedSuppliersText = await getStorage('selectedSuppliersForQuotation');
        if (storedSuppliersText) {
          const storedSuppliers: SupplierData[] = JSON.parse(storedSuppliersText);
          setSuppliers(storedSuppliers);
          const total = storedSuppliers.reduce((acc, supplierData) => {
            return acc + supplierData.supplier.discount.orderValueFinish;
          }, 0);
          setTotalQuotationValue(total);
        } else {
          navigation.replace('Prices');
          return;
        }
      }
    } catch (error) {
      console.error('Error loading quotation data:', error);
      navigation.replace('Prices');
    } finally {
      setLoading(false);
    }
  }, [route.params, navigation]);

  useEffect(() => {
    loadQuotationData();
  }, [loadQuotationData]);

  if (loading) {
    return (
      <View flex={1} justifyContent="center" alignItems="center">
        <ActivityIndicator size="large" color="#04BF7B" />
        <Text fontSize={16} mt={5} color="gray" textAlign="center">
          Carregando detalhes da cotação...
        </Text>
      </View>
    );
  }

  return (
    <Stack pt={20} backgroundColor="#F0F2F6" height="100%" position="relative">
      <View height={50} flex={1} paddingTop={20}>
        <View height={50} alignItems="center" paddingLeft={20} paddingRight={20} flexDirection="row">
          <Icons
            onPress={() => {
              navigation.replace('Prices');
            }}
            size={25}
            name="chevron-back"
          />
          <Text f={1} textAlign="center" fontSize={20}>
            Detalhamento Cotação
          </Text>
        </View>

        <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
          <View p={16} width={Platform.OS === 'web' ? '70%' : '92%'} alignSelf="center">
            {suppliers.map((supplierData, index) => (
              <View key={supplierData.supplier.externalId} backgroundColor="white" borderRadius={10} mb={16} p={16}>
                <XStack alignItems="center" mb={10}>
                  <Image
                    source={{
                      uri: `https://cdn.conectarhortifruti.com.br/files/images/supplier/${supplierData.supplier.externalId}.jpg`,
                    }}
                    width={40}
                    height={40}
                    borderRadius={20}
                  />
                  <Text fontSize={18} fontWeight="bold" ml={10}>
                    {supplierData.supplier.name.replace('Distribuidora', '')}
                  </Text>
                  <View flexDirection="row" alignItems="center" ml="auto">
                    <Icons color="orange" name="star" />
                    <Text pl={4}>{supplierData.supplier.star}</Text>
                  </View>
                </XStack>

                {supplierData.supplier.discount.product.map((product, prodIndex) => (
                  <View key={product.sku} borderBottomColor="#F0F2F6" borderBottomWidth={prodIndex === supplierData.supplier.discount.product.length - 1 ? 0 : 1} py={10}>
                    <XStack alignItems="center">
                      <Image source={{ uri: product.image[0], width: 40, height: 40 }} borderRadius={5} />
                      <View ml={10} flex={1}>
                        <Text fontSize={14}>{product.name}</Text>
                        {product.obs ? <Text fontSize={10} color="gray">Obs: {product.obs}</Text> : null}
                      </View>
                      <View alignItems="flex-end">
                        <Text fontWeight="bold" fontSize={14} color={product.price ? 'black' : 'red'}>
                          {product.price ? `R$ ${product.price.toFixed(2).replace('.', ',')}` : 'Indisponível'}
                        </Text>
                        <Text fontSize={12} color="gray">
                          {product.quant} {product.orderUnit.replace('Unid', 'Un')}
                        </Text>
                      </View>
                    </XStack>
                  </View>
                ))}

                <View mt={15} borderTopColor="#F0F2F6" borderTopWidth={1} pt={10}>
                  <XStack justifyContent="space-between" alignItems="center">
                    <Text fontSize={16} fontWeight="bold">
                      Total por Fornecedor:
                    </Text>
                    <Text fontSize={16} fontWeight="bold">
                      R$ {supplierData.supplier.discount.orderValueFinish.toFixed(2).replace('.', ',')}
                    </Text>
                  </XStack>
                </View>
              </View>
            ))}

            <View backgroundColor="white" borderRadius={10} p={16} mt={16}>
              <XStack justifyContent="space-between" alignItems="center">
                <Text fontSize={20} fontWeight="bold">
                  Total Geral da Cotação:
                </Text>
                <Text fontSize={20} fontWeight="bold" color="#04BF7B">
                  R$ {totalQuotationValue.toFixed(2).replace('.', ',')}
                </Text>
              </XStack>
            </View>
          </View>
        </ScrollView>

        <XStack
          backgroundColor="white"
          position="absolute"
          bottom={0}
          left={0}
          right={0}
          p={16}
          justifyContent="space-around"
          alignItems="center"
          borderTopWidth={1}
          borderTopColor="#F0F2F6"
          width={Platform.OS === 'web' ? '70%' : '100%'}
          alignSelf="center"
        >
          <CustomButton
            title="Alterar itens"
            onPress={() => navigation.replace('Cart')} // Redireciona para a tela de carrinho
            backgroundColor="black"
            flex={1}
            mr={10}
            borderRadius={10}
            textColor="white" 
          />
          <CustomButton
            title="Confirmar combinação"
            onPress={() => {
              console.log('Combinação confirmada!');
              navigation.replace('Products');
            }}
            backgroundColor="#04BF7B"
            flex={1}
            ml={10}
            borderRadius={10}
            textColor="white" // Adicionado para garantir a cor do texto
          />
        </XStack>
      </View>
    </Stack>
  );
}
