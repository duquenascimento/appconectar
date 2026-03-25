import PageContainer from '@/src/components/box/PageContainer';
import { getPaymentDate, getPaymentDescription } from '@/src/utils/paymentUtils';
import Icons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { Button, Image, Text, View } from 'tamagui';
import { saveUserAppInfo } from '../src/services/versionService';
import { clearPurchaseStorage, clearStorage, getStorage } from '../src/utils/utils';
import { SupplierData } from './prices';
import { useRestaurantContext } from '@/src/contexts/restaurant.context';

interface DeliveryInfo {
  restName: string;
  address: string;
  maxHour: string;
  minHour: string;
  deliveryDateFormated: string;
  paymentWay: string;
}

export default function FinalConfirm() {
  const router = useRouter();
  const [supplier, setSupplier] = useState<SupplierData>();
  const [deliveryData, setDeliveryData] = useState<DeliveryInfo>();
  const { selectedRestaurant } = useRestaurantContext();
  const loadSupplier = useCallback(async () => {
    const supplierText = await getStorage('supplierSelected');
    const deliveryDataText = await getStorage('finalConfirmData');

    if (supplierText) {
      const supplier = JSON.parse(supplierText);
      setSupplier(supplier);
    }
    if (deliveryDataText) {
      const deliveryDataResult = JSON.parse(deliveryDataText);
      setDeliveryData(deliveryDataResult);
    }
    // TODO - Modificar para clearPurchaseStorage - [check]
    await clearPurchaseStorage();
  }, []);

  useEffect(() => {
    const loadSupplierAsync = async () => {
      try {
        await loadSupplier();
      } catch (err) {
        console.error(err);
        router.push('/prices');
      }
    };
    loadSupplierAsync();
  }, [loadSupplier, router]);

  useEffect(() => {
    return () => {
      router.dismissTo('/products');
    };
  }, []);

  return (
    <PageContainer backgroundColor="gray">
      <View
        padding={30}
        backgroundColor="#F0F2F6"
        flex={1}
        justifyContent="center"
        alignItems="center"
      >
        <Icons size={90} color="#04BF7B" name="checkmark-circle" />
        <Text paddingBottom={25} fontSize={30}>
          Pedido confirmado!
        </Text>
        <View padding={15} backgroundColor="white" borderRadius={5} width="80%">
          <View borderBottomColor="gray" borderBottomWidth={0.5} flexDirection="row">
            <Image
              source={{
                uri: `https://cdn.conectarhortifruti.com.br/files/images/supplier/${supplier?.supplier.externalId}.jpg`,
              }}
              width={50}
              height={50}
              borderRadius={50}
            />
            <View marginLeft={5} justifyContent="center" flex={1}>
              <Text>{supplier?.supplier.name}</Text>
              <View alignItems="center" flexDirection="row">
                <Icons color="orange" name="star" />
                <Text color="gray" paddingLeft={4}>
                  {supplier?.supplier.star}
                </Text>
              </View>
            </View>
            <View paddingRight={5} justifyContent="center">
              <Text fontSize={16} fontWeight="800">
                R$ {supplier?.supplier.discount.orderValueFinish.toString().replace('.', ',')}
              </Text>
            </View>
          </View>
          <View alignItems="center" marginTop={15} flexDirection="row">
            <Icons size={20} name="location" />
            <View marginLeft={10}>
              <Text fontSize={16}>{deliveryData?.restName}</Text>
              <Text fontSize={12}>{deliveryData?.address}</Text>
            </View>
          </View>
          <View alignItems="center" marginTop={15} flexDirection="row">
            <Icons size={20} name="time" />
            <View marginLeft={10}>
              <Text fontSize={16}>
                Entre {deliveryData?.minHour} e {deliveryData?.maxHour}
              </Text>
              <Text fontSize={12}>{deliveryData?.deliveryDateFormated}</Text>
            </View>
          </View>
          <View alignItems="center" marginTop={15} flexDirection="row">
            <Icons size={20} name="cash" />
            <View marginLeft={10}>
              <Text fontSize={16}>
                Venc.{' '}
                {getPaymentDate(
                  deliveryData?.paymentWay ?? '',
                  selectedRestaurant?.allowEmergencyOrder ?? false,
                )}
              </Text>
              <Text fontSize={12}>{getPaymentDescription(deliveryData?.paymentWay ?? '')}</Text>
            </View>
          </View>
          <View paddingTop={40}>
            <Button
              onPress={async () => {
                router.push('/products');
                saveUserAppInfo();
              }}
              backgroundColor="#04BF7B"
            >
              <Icons size={20} color="white" name="checkmark" />
            </Button>
          </View>
        </View>
      </View>
    </PageContainer>
  );
}
