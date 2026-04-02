import PageContainer from '@/src/components/box/PageContainer';
import CustomButton from '@/src/components/button/customButton';
import * as Clipboard from 'expo-clipboard';
import { Restaurant } from '@/src/types/restaurantTypes';
import { SupplierData } from '@/src/types/types';
import { getStorageRestaurant } from '@/src/utils/restaurantUtils';
import Icons from '@expo/vector-icons/Ionicons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Platform, SafeAreaView, ScrollView } from 'react-native';
import { Button, Image, Separator, Text, View, XStack, YStack } from 'tamagui';
import { formatCurrency } from '../src/utils/formatCurrency';
import { getPaymentDate, getPaymentMethod } from '../src/utils/paymentUtils';
import { getDeliveryWindow } from '../src/utils/timeUtils';
import { clearPurchaseStorage } from '@/src/utils/utils';
import { getQrCodeByOrderId } from '@/src/services/pixService';
import { PixCharge } from '@/src/types/pixTypes';
import { PixDisplay } from '@/src/components/PixDisplay';

export default function OrderSuccess() {
  const router = useRouter();
  const { suppliers: suppliersParam, deliveryDate } = useLocalSearchParams<{
    suppliers?: string;
    deliveryDate?: string;
  }>();
  
  const [suppliers, setSuppliers] = useState<SupplierData[]>([]);
  const [restaurantDetails, setRestaurantDetails] = useState<Restaurant | null>(null);
  const [pixCharge, setPixCharge] = useState<PixCharge | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [paymentDateOrder, setPaymentDateOrder] = useState<string | null>(null);

  useEffect(() => {
    const loadSuppliers = (): SupplierData[] => {
      if (suppliersParam) {
        try {
          const parsed = JSON.parse(decodeURIComponent(suppliersParam));
          if (Array.isArray(parsed)) {
            setSuppliers(parsed);
            return parsed;
          } else {
            console.error('suppliers não é um array:', parsed);
          }
        } catch (error) {
          console.error('Erro ao parsear suppliers:', error);
        }
      }
      return [];
    }

    const loadRestaurantData = async () => {
      try {
        const restaurantData = await getStorageRestaurant();
        if (restaurantData) {
          setRestaurantDetails(restaurantData);
          setPaymentDateOrder(
            getPaymentDate(restaurantData.paymentWay, restaurantData.allowEmergencyOrder),
          );
        } else {
          Alert.alert('Erro', 'Não foi possível encontrar os dados do restaurante.');
        }
      } catch (error) {
        console.error('Erro ao carregar dados do restaurante:', error);
        Alert.alert('Erro', 'Ocorreu um problema ao carregar as informações do restaurante.');
      } 
    };

    const loadPixQrCode = async (currentSuppliers: SupplierData[]) => {
      const someOrderId = currentSuppliers[0]?.supplier.orderId;
      console.log('loadPixQrCode', currentSuppliers);
      if(!someOrderId) {
        console.error('Nenhum ID de pedido encontrado');
        return;
      }

      try {
        const qrCode = await getQrCodeByOrderId(someOrderId);
        setPixCharge(qrCode);
      } catch (error) {
        console.error('Erro ao carregar QR Code:', error);
      }
    }

    const loadInitalData = async () => {
      try {
        setIsLoading(true);
        const currentSuppliers = loadSuppliers();
        await Promise.all([loadRestaurantData(), loadPixQrCode(currentSuppliers)]);
      } finally {
        setIsLoading(false);
      }
    };

    loadInitalData();

    // return () => {
    //   router.dismissTo('/products');
    // };
  }, []);

  useEffect(() => {
    
  }, [])

  const getFormattedAddress = () => {
    if (!restaurantDetails || !restaurantDetails.addressInfos.length) return '';
    const addr = restaurantDetails.addressInfos[0];
    return `${addr.address}, ${addr.localNumber} - ${addr.neighborhood}, ${addr.city}`;
  };

  if (isLoading) {
    return (
      <SafeAreaView
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: '#F0F4F8',
        }}
      >
        <ActivityIndicator size="large" color="#1DC588" />
        <Text marginTop="$4">Carregando confirmação...</Text>
      </SafeAreaView>
    );
  }

  const isPixPayment = 'AV01' === restaurantDetails?.paymentWay;
  return (
    <PageContainer backgroundColor="gray">
      <YStack
        flex={1}
        backgroundColor="#F0F4F8"
        alignSelf="center"
        width="100%"
        maxWidth={Platform.OS === 'web' ? 768 : undefined}
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, paddingVertical: 16 }}
          showsVerticalScrollIndicator={false}
        >
          <YStack flex={1} alignItems="center" justifyContent="center" padding="$4" gap="$4">
            <YStack alignItems="center" gap="$3">
              <YStack
                width={80}
                height={80}
                borderRadius={40}
                backgroundColor="white"
                alignItems="center"
                justifyContent="center"
                elevation={5}
              >
                <Icons name="checkmark" size={48} color="#1DC588" />
              </YStack>
              <Text fontSize={24} fontWeight="bold" color="$gray12">
                {isPixPayment ? 'Pagamento pendente!' : 'Pedidos confirmados!'}
              </Text>
            </YStack>

            {isPixPayment && (
              <YStack width="100%" backgroundColor="white" borderRadius={8} padding="$4" gap="$3" alignItems="center">
                <PixDisplay pixCharge={pixCharge} />
              </YStack>
            )}

            <YStack width="100%" backgroundColor="white" borderRadius={8} padding="$4" gap="$3">
              {suppliers.map(({ supplier }, index) => (
                <React.Fragment key={supplier.externalId}>
                  <XStack alignItems="center" justifyContent="space-between">
                    <XStack alignItems="center" gap="$3">
                      <Image
                        source={{ uri: supplier.image }}
                        width={40}
                        height={40}
                        borderRadius={20}
                      />
                      <YStack>
                        <Text fontSize={16} fontWeight="bold">
                          {supplier.name}
                        </Text>
                        <XStack alignItems="center" gap="$1.5">
                          <Icons name="star" color="#F59E0B" size={14} />
                          <Text fontSize={12} color="$gray10">
                            {supplier.star}
                          </Text>
                        </XStack>
                      </YStack>
                    </XStack>
                    <YStack alignItems="flex-end">
                      <Text fontSize={16} fontWeight="bold">
                        {formatCurrency(supplier.discount.orderValueFinish)}
                      </Text>
                      <Text fontSize={12} color="$gray10">
                        Pedido {supplier.orderId ?? ''}
                      </Text>
                    </YStack>
                  </XStack>
                  {index < suppliers.length - 1 && <Separator borderColor="$gray4" />}
                </React.Fragment>
              ))}
            </YStack>

            {restaurantDetails && (
              <YStack width="100%" backgroundColor="white" borderRadius={8} padding="$4" gap="$4">
                <XStack alignItems="flex-start" gap="$3">
                  <Icons name="location-outline" size={24} color="$gray11" />
                  <YStack flex={1}>
                    <Text fontSize={16} fontWeight="bold">
                      {restaurantDetails.name}
                    </Text>
                    <Text fontSize={14} color="$gray10">
                      {getFormattedAddress()}
                    </Text>
                  </YStack>
                </XStack>

                <XStack alignItems="flex-start" gap="$3">
                  <Icons name="time-outline" size={24} color="$gray11" />
                  <YStack>
                    <Text fontSize={16} fontWeight="bold">
                      {getDeliveryWindow(restaurantDetails)}
                    </Text>
                    <Text fontSize={14} color="$gray10">
                      {deliveryDate}
                    </Text>
                  </YStack>
                </XStack>

                <XStack alignItems="flex-start" gap="$3">
                  <Icons name="cash-outline" size={24} color="$gray11" />
                  <YStack>
                    <Text fontSize={16} fontWeight="bold">
                      {!paymentDateOrder ? '' : `Venc. ${paymentDateOrder}`}
                    </Text>
                    <Text fontSize={14} color="$gray10">
                      Pagamento via {getPaymentMethod(restaurantDetails.paymentWay)}
                    </Text>
                  </YStack>
                </XStack>
              </YStack>
            )}
          </YStack>
        </ScrollView>

        <YStack paddingVertical="$4" paddingHorizontal="$4" backgroundColor="#F0F4F8">
          <CustomButton
            title="Ok"
            onPress={async () => {
              await clearPurchaseStorage();
              router.push('/products');
            }}
            backgroundColor="#04BF7B"
            textColor="white"
          />
        </YStack>
      </YStack>
    </PageContainer>
  );
}
