import { useResponsiveness } from '@/src/components/hooks/useResponsiveness';
import PdfViewerModal from '@/src/components/modais/PdfViewerModal';
import { RetroactiveQuotationWarningBanner } from '@/src/components/quotations/RetroactiveQuotationWarningBanner';
import { confirmScheduleOrder } from '@/src/services/scheduleOrderService';
import { CombinationMissingProducts } from '@/src/types/combinationTypes';
import { SameDayOrder } from '@/src/types/types';
import { getBrazilDateTime, getBrazilDateTimeTomorrow } from '@/src/utils/dateUtils';
import { getStorageRestaurant } from '@/src/utils/restaurantUtils';
import { HttpStatusCode } from 'axios';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { debounce } from 'lodash';
import React, { useCallback, useMemo, useState } from 'react';
import { Alert } from 'react-native';
import { Button, ScrollView, Separator, Text, View, XStack, YStack } from 'tamagui';
import PageContainer from '../src/components/box/PageContainer';
import CustomButton from '../src/components/button/customButton';
import CustomInfoCard from '../src/components/card/customInfoCard';
import CustomHeader from '../src/components/header/customHeader';
import { LoadingConfirm } from '../src/components/loading/confirmOrder';
import CustomAlert from '../src/components/modais/CustomAlert';
import SundayOrderAlert from '../src/components/modais/SundayOrderAlert';
import { MissingItemsList } from '../src/components/quotations/MissingItensList';
import { SupplierList } from '../src/components/quotations/SupplierList';
import { useDeliveryDate } from '../src/contexts/deliveryDate.context';
import { useRestaurantContext } from '../src/contexts/restaurant.context';
import {
  confirmConectarPlusOrder,
  ConfirmConectarPlusOrderRequestBody,
} from '../src/services/orderService';
import { scheduleNotification } from '../src/utils/agendamentoUtils';
import { formatCurrency } from '../src/utils/formatCurrency';
import { processOrderResponse } from '../src/utils/processOrderResponse';
import { isBefore13Hours } from '../src/utils/timeUtils';
import { deleteMultiStorage, getToken } from '../src/utils/utils';
import { extractErrorMessage } from '@/src/utils/errorUtils';

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
  quotationUnit: string;
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

export interface ConectarPlusSupplier {
  name: string;
  externalId: string;
  image: string;
  missingItens: number;
  minimumOrder: number;
  hour: string;
  discount: Discount;
  star: string;
  sameDayOrders: SameDayOrder[];
}

export interface SupplierData {
  supplier: ConectarPlusSupplier;
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
    missingProducts: CombinationMissingProducts[];
  };
};

export default function QuotationDetailsScreen() {
  const router = useRouter();
  const {
    combinationId,
    combinationName,
    suppliersData: suppliersDataParam,
    missingProducts,
    scheduleId,
  } = useLocalSearchParams<{
    combinationId?: string;
    combinationName?: string;
    suppliersData?: string;
    missingProducts?: string | string[];
    scheduleId?: string;
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
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showErros, setShowErros] = useState<string[]>([]);
  const [booleanErros, setBooleanErros] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const { selectedRestaurant } = useRestaurantContext();
  const [showSundayWarning, setShowSundayWarning] = useState(false);
  const [confirmedWarnings, setConfirmedWarnings] = useState<{ sundayWarning: boolean }>({
    sundayWarning: false,
  });
  const { deliveryDate, resetDeliveryDate, isRetroactiveDate } = useDeliveryDate();
  const [selectedPdfUrl, setSelectedPdfUrl] = useState<string | null>(null);
  const [showPdfModal, setShowPdfModal] = useState(false);
  const [disableConfirm, setDisableConfirm] = useState<boolean>(false);
  const { isLargeScreen } = useResponsiveness();

  const handleShowPdf = (pdfUrl: string) => {
    setSelectedPdfUrl(pdfUrl);
    setShowPdfModal(true);
  };

  const parsedMissingProducts: CombinationMissingProducts[] = useMemo(() => {
    if (!missingProducts) return [];

    try {
      // Extract string from URL param (can be string or string[])
      const raw =
        typeof missingProducts === 'string'
          ? missingProducts
          : Array.isArray(missingProducts) && missingProducts.length > 0
            ? missingProducts[0]
            : '';

      if (!raw) return [];

      // Decode and parse JSON
      const decoded = decodeURIComponent(raw).trim();
      const parsed = JSON.parse(decoded);

      // Ensure we return an array
      return Array.isArray(parsed) ? parsed : [parsed];
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

  const isBefore13h = selectedRestaurant?.allowEmergencyOrder ? false : isBefore13Hours();

  const handleBackPress = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.push('prices');
    }
  };
  
  const handleConfirm = useCallback(
    async (overrideWarnings?: { sundayWarning?: boolean }) => {
      if(disableConfirm) {
        return
      }
      setDisableConfirm(true);
      try {
        const token = await getToken();
        if (!token) {
          Alert.alert('Erro', 'Token de autenticação não encontrado.');
          return;
        }

        const restaurantData = await getStorageRestaurant();
        if (!restaurantData) {
          Alert.alert('Erro', 'Restaurante não encontrado.');
          return;
        }

        const effectiveWarnings = {
          ...confirmedWarnings,
          ...overrideWarnings,
        };

        if (getBrazilDateTime(deliveryDate).weekday === 7 && !effectiveWarnings.sundayWarning) {
          setShowSundayWarning(true);
          return;
        }

        if (isBefore13h) {
          const errors = await scheduleNotification(
            restaurantData.addressInfos[0].responsibleReceivingPhoneNumber,
          );

          setShowErros(errors);
          if (errors.length) setBooleanErros(true);
          else setShowNotification(true);

          return;
        }

        setIsLoading(true);

        if (scheduleId) {
          await confirmScheduleOrder(scheduleId, { appVersion: process.env.EXPO_PUBLIC_VERSION });
          router.push({
            pathname: '/orderConfirmedScreen',
            params: {
              suppliers: suppliersDataParam,
              deliveryDate: getBrazilDateTimeTomorrow().toFormat('dd/MM/yyyy'),
            },
          });
          return;
        }

        const body: ConfirmConectarPlusOrderRequestBody = {
          token,
          suppliers: suppliers.map((s) => s.supplier),
          restaurant: restaurantData,
          deliveryDate,
          appVersion: process.env.EXPO_PUBLIC_VERSION,
          missingProducts: parsedMissingProducts,
        };

        const createdOrders = await confirmConectarPlusOrder(body);
        if (createdOrders && createdOrders.status === HttpStatusCode.Ok) {
          deleteMultiStorage(['cartOrder', `cart_${restaurantData.externalId}`]);
          const { deliveryDateFormated } = createdOrders.data.data[0];

          const ordersBySupplier = createdOrders.data.data.map(
            (item: { orderId: string; externalId: string }) => ({
              orderId: item.orderId,
              externalId: item.externalId,
            }),
          );

          const supplierWithOrderId = processOrderResponse(suppliers, ordersBySupplier);

          setConfirmedWarnings({ sundayWarning: false });
          resetDeliveryDate();

          router.push({
            pathname: '/orderConfirmedScreen',
            params: {
              suppliers: JSON.stringify(supplierWithOrderId),
              deliveryDate: deliveryDateFormated,
            },
          });
        } else {
          throw Error('Erro ao confirmar a combinação');
        }
      } catch (error) {
        const errorMessage = extractErrorMessage(error);
        console.error('Erro ao confirmar a combinação:', error);
        setShowErros([errorMessage]);
        setBooleanErros(true);
      } finally {
        setIsLoading(false);
        setDisableConfirm(false);
      }
    },
    [suppliers, disableConfirm, deliveryDate, confirmedWarnings, isBefore13h, resetDeliveryDate, router],
  );

  const handleConfirmSundayWarning = useCallback(async () => {
    setShowSundayWarning(false);
    setConfirmedWarnings((prev) => ({ ...prev, sundayWarning: true }));
    await handleConfirm({ sundayWarning: true });
  }, [handleConfirm]);

  const handleCloseSundayWarning = useCallback(() => {
    setShowSundayWarning(false);
    setConfirmedWarnings({ sundayWarning: false });
  }, []);

  const onConfirmPressDebounced = useMemo(
    () =>
      debounce(handleConfirm, 300, {
        leading: true,
        trailing: false,
      }) as unknown as () => void,
    [handleConfirm],
  );

  if (!suppliers || suppliers.length === 0) {
    return (
      <PageContainer backgroundColor="white">
        <CustomHeader title="Erro" onBackPress={handleBackPress} />
        <View flex={1} justifyContent="center" alignItems="center">
          <Text>Não foi possível carregar os dados da cotação.</Text>
        </View>
      </PageContainer>
    );
  }

  return (
    <PageContainer backgroundColor="white">
      <YStack
        flex={1}
        backgroundColor="#F9F9F9"
        alignSelf="center"
        width={isLargeScreen ? '70%' : '100%'}
        maxWidth={1280}
      >
        {isRetroactiveDate && <RetroactiveQuotationWarningBanner />}

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
            <SupplierList
              suppliers={suppliers}
              deliveryDate={deliveryDate}
              onShowPdf={handleShowPdf}
            />

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
        <SundayOrderAlert
          visible={showSundayWarning}
          onCancel={handleCloseSundayWarning}
          onConfirm={handleConfirmSundayWarning}
        />
        {/* PDF Modal */}
        {selectedPdfUrl && showPdfModal && (
          <PdfViewerModal
            key={selectedPdfUrl}
            pdfUrl={selectedPdfUrl}
            open={showPdfModal}
            onClose={() => setShowPdfModal(false)}
          />
        )}
        {/* 3. Botões do rodapé com a nova lógica e estilo */}
        <View
          position="absolute"
          bottom={0}
          left={0}
          right={0}
          paddingVertical="$4"
          paddingHorizontal="$4"
          backgroundColor="#F9F9F9"
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
              {isLargeScreen ? '.' : ', agende uma notificação para alertar no horário.'}
            </Text>
          </View>
          {isLargeScreen ? (
            <XStack
              width="74%"
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
                  disabled={disableConfirm || isRetroactiveDate}
                  onPress={onConfirmPressDebounced}
                  hoverStyle={{
                    backgroundColor: '#1DC588',
                    opacity: 0.9,
                  }}
                  backgroundColor="#1DC588"
                  disabledStyle={{
                    backgroundColor: '#A9A9A9',
                  }}
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
              width="88%"
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
                  disabled={disableConfirm || isRetroactiveDate}
                  title={isBefore13h ? 'Agendar' : 'Confirmar'}
                  onPress={() => handleConfirm()}
                  backgroundColor="#1DC588"
                  textColor="#FFFFFF"
                />
              </YStack>
            </XStack>
          )}
        </View>
      </YStack>
      <LoadingConfirm loading={isLoading} />
    </PageContainer>
  );
}
