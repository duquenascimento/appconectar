import { type NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Text, View, Image, ScrollView, XStack, YStack, Separator, Button } from 'tamagui';
import Icons from '@expo/vector-icons/Ionicons';
import React, { useMemo, useState } from 'react';
import { SafeAreaView, Alert, Platform } from 'react-native';
import CustomHeader from '@/src/components/header/customHeader';
import CustomInfoCard from '@/src/components/card/customInfoCard';
import CustomButton from '../src/components/button/customButton';
import { deleteMultiStorage, getStorage, getToken } from '../src/utils/utils';
import CustomAlert from '@/src/components/modais/CustomAlert';
import { LoadingConfirm } from '@/src/components/loading/confirmOrder';
import { formatCurrency } from '../src/utils/formatCurrency';
import { createOrderPremium } from '@/src/services/orderService';
import { processOrderResponse } from '../src/utils/processOrderResponse';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { MissingItemsList } from '@/src/components/quotations/MissingItensList';
import { SupplierList } from '@/src/components/quotations/SupplierList';
import { isBefore13Hours } from '@/src/utils/timeUtils';
import { scheduleNotification } from '@/src/utils/agendamentoUtils';
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
  OrderConfirmed: { suppliers: SupplierData[]; deliveryDate?: string };
  QuotationDetails: {
    combinationId: string;
    combinationName?: string;
    suppliersData: SupplierData[];
    missingProducts: string[];
  };
};

type QuotationDetailsScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'QuotationDetails'>;
  route: { params: RootStackParamList['QuotationDetails'] };
};

export default function QuotationDetailsScreen() {
  const router = useRouter();
  const {
    combinationId,
    combinationName,
    suppliersData: suppliersDataParam,
    missingProducts,
  } = useLocalSearchParams<{
    combinationId?: string;
    combinationName?: string;
    suppliersData?: string;
    missingProducts: string[];
  }>();

  const suppliersData = useMemo(() => {
    if (!suppliersDataParam) return [];
    try {
      return JSON.parse(decodeURIComponent(suppliersDataParam as string));
    } catch (error) {
      console.error('Erro ao parsear suppliersData:', error);
      return [];
    }
  }, [suppliersDataParam]);

  const [suppliers] = useState<SupplierData[]>(suppliersData || []);
  const [headerTitle] = useState<string>(combinationName || 'Detalhes da Cotação');
  const [isAlertVisible, setIsAlertVisible] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showErros, setShowErros] = useState<string[]>([]);
  const [booleanErros, setBooleanErros] = useState(false);
  const [showNotification, setShowNotification] = useState(false);

  const parsedMissingProducts = useMemo(() => {
    if (!missingProducts) return [];

    try {
      if (Array.isArray(missingProducts)) return missingProducts;

      const raw =
        typeof missingProducts === 'string'
          ? decodeURIComponent(missingProducts).trim()
          : Array.isArray(missingProducts)
            ? missingProducts
            : String(missingProducts);

      if (Array.isArray(raw)) {
        return raw.map(String);
      }

      if (raw.includes(',')) {
        return raw
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean);
      }
      return raw ? [raw] : [];
    } catch (err) {
      console.error('Erro ao parsear missingProducts:', err);
      return [];
    }
  }, [missingProducts]);

  const totals = React.useMemo(() => {
    if (!suppliers)
      return {
        subtotal: 0,
        discount: 0,
        grandTotal: 0,
        totalItems: 0,
        missingItems: 0,
      };

    return suppliers.reduce(
      (acc, { supplier }) => {
        acc.subtotal += supplier.discount.orderValue;
        acc.discount += supplier.discount.discount;
        acc.grandTotal += supplier.discount.orderValueFinish;

        const availableItems = supplier.discount.product.filter((p) => p.price > 0);
        acc.totalItems += availableItems.length;

        const missingItemsInSupplier = supplier.discount.product.filter((p) => p.price === 0);
        acc.missingItems += missingItemsInSupplier.length;

        return acc;
      },
      {
        subtotal: 0,
        discount: 0,
        grandTotal: 0,
        totalItems: 0,
        missingItems: 0,
      },
    );
  }, [suppliers]);

  const formatUnit = (unit: string) => (unit || '').replace('Unid', 'UN');

  const isBefore13h = isBefore13Hours();

  const handleBackPress = () => router.back();
  const handleConfirm = async () => {
    setIsLoading(true);
    try {
      const token = await getToken();
      if (!token) {
        Alert.alert('Erro', 'Token de autenticação não encontrado.');
        return;
      }

      const storedRestaurant = await getStorage('selectedRestaurant');
      if (!storedRestaurant) {
        Alert.alert('Erro', 'Restaurante não encontrado.');
        return;
      }

      const parsedRestaurant = JSON.parse(storedRestaurant);

      if (isBefore13h) {
        const errors = await scheduleNotification(
          parsedRestaurant.restaurant.addressInfos[0].responsibleReceivingPhoneNumber,
        );

        setShowErros(errors);
        if (errors.length) {
          setBooleanErros(true);
        } else {
          setShowNotification(true);
        }

        return;
      }

      const body = {
        token,
        suppliers: suppliers.map((s) => s.supplier),
        restaurant: parsedRestaurant,
      };

      const createdOrders = await createOrderPremium(body);
      if (createdOrders && createdOrders.status === 201) {
        deleteMultiStorage(['cartOrder', 'cart']);
        const deliveryDateFormated = createdOrders.data.data[0].deliveryDateFormated;

        const ordersBySupplier = createdOrders.data.data.map(
          (item: { orderId: string; externalId: string }) => ({
            orderId: item.orderId,
            externalId: item.externalId,
          }),
        );

        const supplierWithOrderId = processOrderResponse(suppliers, ordersBySupplier);

        router.push({
          pathname: '/orderConfirmedScreen',
          params: {
            suppliers: JSON.stringify(supplierWithOrderId),
            deliveryDate: deliveryDateFormated,
          },
        });
      } else {
        Alert.alert('Erro', 'Erro ao confirmar a combinação.');
        setIsAlertVisible(true);
      }
    } catch (error) {
      console.error('Erro ao confirmar a combinação:', error);
      Alert.alert('Erro', 'Ocorreu um erro inesperado.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!suppliers || suppliers.length === 0) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
        <CustomHeader title="Erro" onBackPress={handleBackPress} />
        <View flex={1} justifyContent="center" alignItems="center">
          <Text>Não foi possível carregar os dados da cotação.</Text>
        </View>
      </SafeAreaView>
    );
  }


  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
      <YStack
        flex={1}
        backgroundColor="#FFFFFF"
        alignSelf="center"
        width={Platform.OS === 'web' ? '70%' : '100%'}
        maxWidth={1280}
      >
        <CustomHeader title={headerTitle} onBackPress={handleBackPress} />

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 120, marginTop: 16 }}
        >
          <YStack gap="$4" paddingHorizontal="$4">
            <CustomInfoCard
              icon="warning"
              description="Podem ocorrer pequenas variações de peso/tamanho nos produtos, comum ao hortifrúti."
            />

            <MissingItemsList missingProducts={parsedMissingProducts} />
            <SupplierList suppliers={suppliers} />

            <YStack
              backgroundColor="white"
              borderRadius={8}
              padding="$3.5"
              gap="$2.5"
              borderColor="$gray6"
              borderWidth={1}
            >
              <XStack justifyContent="space-between" alignItems="center">
                <Text fontSize={14} color="$gray11">
                  Subtotal
                </Text>
                <Text fontSize={14} color="$gray11">
                  {formatCurrency(totals.subtotal)}
                </Text>
              </XStack>
              <XStack justifyContent="space-between" alignItems="center">
                <Text fontSize={14} color="$gray11">
                  Descontos
                </Text>
                <Text fontSize={14} color="$gray11">
                  - {formatCurrency(totals.discount)}
                </Text>
              </XStack>
              <Separator marginVertical="$1" borderColor="$gray4" />
              <XStack justifyContent="space-between" alignItems="center">
                <Text fontSize={18} fontWeight="bold">
                  Total
                </Text>
                <Text fontSize={18} fontWeight="bold">
                  {formatCurrency(totals.grandTotal)}
                </Text>
              </XStack>
              <Text fontSize={12} color="$gray10" textAlign="right">
                {totals.totalItems} item{totals.totalItems !== 1 ? 's' : ''} | {totals.missingItems}{' '}
                faltante
                {totals.missingItems !== 1 ? 's' : ''}
              </Text>
            </YStack>
          </YStack>
        </ScrollView>

        <CustomAlert
          visible={booleanErros}
          title="Algo inesperado aconteceu!"
          message={showErros.join('\n')}
          onConfirm={() => setBooleanErros(false)}
          width="35%"
        />
        <CustomAlert
          visible={showNotification}
          title="Notificação agendada!"
          message="Sua notificação foi agendada para as 13h para que você possa confirmar seu pedido."
          onConfirm={() => setShowNotification(false)}
          width="35%"
        />
        <CustomAlert
          visible={isAlertVisible}
          title="Ops!"
          message="Ocorreu um erro ao confirmar combinação, tente novamente mais tarde."
          onConfirm={() => setIsAlertVisible(false)}
          width="35%"
        />
        {/* 3. Botões do rodapé com a nova lógica e estilo */}
        <View
          position="absolute"
          bottom={0}
          left={0}
          right={0}
          paddingVertical="$4"
          paddingHorizontal="$4"
          backgroundColor="white"
          borderTopWidth={1}
          borderTopColor="$gray4"
        >
          <View paddingVertical={10} paddingHorizontal={10}>
            <Text
              marginHorizontal="auto"
              color="red"
              fontSize={12}
              textAlign="center"
              display={isBefore13h ? 'flex' : 'none'}
            >
              A confirmação só pode ser feita após as 13h
              {Platform.OS === 'web' ? '.' : ', agende uma notificação para alertar no horário.'}
            </Text>
          </View>
          {Platform.OS === 'web' ? (
            <XStack
              width={'74%'}
              flexDirection="row"
              justifyContent="center"
              gap={10}
              alignSelf="center"
            >
              <YStack flex={1}>
                <Button
                  onPress={handleBackPress}
                  hoverStyle={{
                    backgroundColor: '#333333',
                    opacity: 0.9,
                  }}
                  backgroundColor="#000000"
                  color="#FFFFFF"
                  borderColor="#A9A9A9"
                  borderWidth={1}
                >
                  Voltar
                </Button>
              </YStack>
              <YStack flex={1}>
                <Button
                  onPress={handleConfirm}
                  hoverStyle={{
                    backgroundColor: '#1DC588',
                    opacity: 0.9,
                  }}
                  backgroundColor="#1DC588"
                  color="#FFFFFF"
                  borderColor="#A9A9A9"
                  borderWidth={1}
                >
                  {isBefore13h ? 'Agendar notificação' : 'Confirmar combinação'}
                </Button>
              </YStack>
            </XStack>
          ) : (
            <XStack
              width={'88%'}
              flexDirection="row"
              justifyContent="center"
              gap={10}
              alignSelf="center"
            >
              <YStack flex={1}>
                <CustomButton
                  title="Voltar"
                  onPress={handleBackPress}
                  backgroundColor="#000000"
                  textColor="#FFFFFF"
                />
              </YStack>
              <YStack flex={1}>
                <CustomButton
                  title={isBefore13h ? 'Agendar' : 'Confirmar'}
                  onPress={handleConfirm}
                  backgroundColor="#1DC588"
                  textColor="#FFFFFF"
                />
              </YStack>
            </XStack>
          )}
        </View>
      </YStack>
      <LoadingConfirm loading={isLoading} />
    </SafeAreaView>
  );
}
