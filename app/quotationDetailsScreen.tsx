/* eslint-disable max-len */
/* eslint-disable react-native/no-inline-styles */
import { HttpStatusCode } from 'axios';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
// eslint-disable-next-line import/no-extraneous-dependencies
import { debounce } from 'lodash';
import React, { useCallback, useMemo, useState } from 'react';
import { Alert } from 'react-native';
import { Button, ScrollView, Separator, Text, View, XStack, YStack } from 'tamagui';
import { CreditCardSection } from '../src/components/CreditCardSection';
import { useResponsiveness } from '../src/components/hooks/useResponsiveness';
import MissingItemsDialog from '../src/components/modais/MissingItemsDialog';
import PdfViewerModal from '../src/components/modais/PdfViewerModal';
import { CreateCreditCardModal } from '../src/components/pages/confirm/CreateCreditCardModal';

import { RetroactiveQuotationWarningBanner } from '../src/components/quotations/RetroactiveQuotationWarningBanner';
import { getCreditCards } from '../src/services/creditCardService';
import { confirmScheduleOrder } from '../src/services/scheduleOrderService';
import { CombinationMissingProducts } from '../src/types/combinationTypes';
import { CreditCard } from '../src/types/creditCardTypes';
import { SameDayOrder } from '../src/types/types';
import { extractDefaultCreditCart } from '../src/utils/creditCardUtils';
import { getBrazilDateTime, getBrazilDateTimeTomorrow } from '../src/utils/dateUtils';
import { extractErrorMessage } from '../src/utils/errorUtils';
import { getStorageRestaurant } from '../src/utils/restaurantUtils';
import { checkSupplierAvailabilityMessageForConectarPlus } from '../src/utils/supplierUtils';
import { getSecondsUntilTime } from '../src/utils/timeUtils';
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
import { deleteMultiStorage, getToken } from '../src/utils/utils';

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
  scheduled: boolean;
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
  openingTime: string | undefined;
}

export interface SupplierData {
  supplier: ConectarPlusSupplier;
}

export default function QuotationDetailsScreen() {
  const router = useRouter();
  const {
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

  const suppliersData = useMemo<SupplierData[]>(() => {
    if (!suppliersDataParam) return [];
    try {
      return JSON.parse(decodeURIComponent(suppliersDataParam as string)) as SupplierData[];
    } catch (error) {
      console.error('Erro ao parsear suppliersData:', error);
      return [];
    }
  }, [suppliersDataParam]);

  const hasScheduled = useMemo(() => {
    let qty = 0;
    suppliersData.forEach((supD) => {
      supD.supplier.discount.product.forEach((prod) => {
        if (prod.scheduled) qty += 1;
      });
    });
    return qty;
  }, [suppliersData]);

  const [suppliers] = useState<SupplierData[]>(suppliersData || []);
  const [headerTitle] = useState<string>(combinationName || 'Detalhes da Cotação');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showErros, setShowErros] = useState<string[]>([]);
  const [booleanErros, setBooleanErros] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const { selectedRestaurant } = useRestaurantContext();
  const [showSundayWarning, setShowSundayWarning] = useState(false);
  const [showMissingItemsModal, setShowMissingItemsModal] = useState(false);
  const [confirmedWarnings, setConfirmedWarnings] = useState<{ sundayWarning: boolean }>({
    sundayWarning: false,
  });
  const { deliveryDate, resetDeliveryDate, isRetroactiveDate } = useDeliveryDate();
  const [selectedPdfUrl, setSelectedPdfUrl] = useState<string | null>(null);
  const [showPdfModal, setShowPdfModal] = useState(false);
  const [openCreditCardDialog, setOpenCreditCardDialog] = useState<boolean>(false);
  const [selectedCreditCard, setSelectedCreditCard] = useState<CreditCard | undefined>();
  const [disableConfirm, setDisableConfirm] = useState<boolean>(false);
  const { isLargeScreen } = useResponsiveness();

  const isCreditCardRequired = useMemo(() => 
    selectedRestaurant?.paymentWay === 'CC32', 
    [selectedRestaurant]
  );

  const handleShowPdf = (pdfUrl: string) => {
    setSelectedPdfUrl(pdfUrl);
    setShowPdfModal(true);
  };

  const parsedMissingProducts: CombinationMissingProducts[] = useMemo(() => {
    if (!missingProducts) return [];

    try {
      const raw =
        // eslint-disable-next-line no-nested-ternary
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

  const suppliersAvailability = checkSupplierAvailabilityMessageForConectarPlus(
    suppliers.map((s) => s.supplier),
  );
  if (selectedRestaurant?.allowEmergencyOrder) {
    suppliersAvailability.isSupplierAvailableForOrder = true;
  }

  const areAllSuppliersAvailableForOrder = suppliersAvailability.isSupplierAvailableForOrder;

  const handleBackPress = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.push('prices');
    }
  };

  const handleConfirm = useCallback(
    async (overrideWarnings?: { sundayWarning?: boolean }) => {
      if (disableConfirm) {
        return;
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

        if (!areAllSuppliersAvailableForOrder) {
          const [targetHours, targetMinutes] = suppliersAvailability?.openingTime
            ?.split(':')
            .map(Number) ?? [13, 0];
          const errors = await scheduleNotification(
            restaurantData.addressInfos[0].responsibleReceivingPhoneNumber,
            getSecondsUntilTime(targetHours, targetMinutes),
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
            pathname: '/orderSuccess',
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
          creditCardId: selectedCreditCard?.id,
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
            pathname: '/orderSuccess',
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
        setShowErros([errorMessage]);
        setBooleanErros(true);
      } finally {
        setIsLoading(false);
        setDisableConfirm(false);
      }
    },
    [
      suppliers,
      disableConfirm,
      deliveryDate,
      selectedCreditCard,
      confirmedWarnings,
      areAllSuppliersAvailableForOrder,
      resetDeliveryDate,
      router,
    ],
  );

  const loadCreditCards = useCallback(async () => {
    const restaurantId = selectedRestaurant?.id;
    if (!restaurantId) return;

    if (!isCreditCardRequired) {
      return;
    }

    try {
      const creditCards = await getCreditCards(restaurantId);
      const defaultCreditCard = extractDefaultCreditCart(creditCards);
      if (defaultCreditCard) {
        setSelectedCreditCard(defaultCreditCard);
      } else {
        setOpenCreditCardDialog(true);
      }
    } catch (err) {
      console.error(err);
    }
  }, [selectedRestaurant]);

  const handleConfirmSundayWarning = useCallback(async () => {
    setShowSundayWarning(false);
    setConfirmedWarnings((prev) => ({ ...prev, sundayWarning: true }));
    await handleConfirm({ sundayWarning: true });
  }, [handleConfirm]);

  const handleCloseSundayWarning = useCallback(() => {
    setShowSundayWarning(false);
    setConfirmedWarnings({ sundayWarning: false });
  }, []);

  const handleConfirmMissingItems = useCallback(async () => {
    setShowMissingItemsModal(false);
    await handleConfirm();
  }, [handleConfirm]);

  const handleCloseMissingItems = useCallback(() => {
    setShowMissingItemsModal(false);
  }, []);

  const onConfirmPress = useCallback(() => {
    if (hasScheduled > 0) {
      setShowMissingItemsModal(true);
      return;
    }
    handleConfirm();
  }, [hasScheduled, handleConfirm]);

  const onConfirmPressDebounced = useMemo(
    () =>
      debounce(onConfirmPress, 300, {
        leading: true,
        trailing: false,
      }) as unknown as () => void,
    [onConfirmPress],
  );

  useFocusEffect(
    useCallback(() => {
      loadCreditCards();
    }, [loadCreditCards]),
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
            {selectedCreditCard && <CreditCardSection creditCard={selectedCreditCard} />}
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
          message={
            suppliersAvailability.notificationMessage ||
            'Sua notificação foi agendada para o horário de abertura dos fornecedores.'
          }
          onConfirm={() => setShowNotification(false)}
          width="35%"
        />
        <CreateCreditCardModal
          open={openCreditCardDialog}
          setOpen={setOpenCreditCardDialog}
          onSaved={async () => {
            await loadCreditCards();
          }}
        />
        <SundayOrderAlert
          visible={showSundayWarning}
          onCancel={handleCloseSundayWarning}
          onConfirm={handleConfirmSundayWarning}
        />
        <MissingItemsDialog
          open={showMissingItemsModal}
          onClose={handleCloseMissingItems}
          onConfirm={handleConfirmMissingItems}
          scheduleItemsCount={hasScheduled}
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
              display={areAllSuppliersAvailableForOrder ? 'none' : 'flex'}
            >
              {suppliersAvailability?.mainMessage ||
                'Fornecedor indisponível para pedidos no momento'}
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
                  disabled={
                    disableConfirm ||
                    isRetroactiveDate ||
                    (isCreditCardRequired && areAllSuppliersAvailableForOrder && !selectedCreditCard)
                  }
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
                  {areAllSuppliersAvailableForOrder
                    ? 'Confirmar combinação'
                    : 'Agendar notificação'}
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
                  disabled={
                    disableConfirm ||
                    isRetroactiveDate ||
                    (isCreditCardRequired && areAllSuppliersAvailableForOrder && !selectedCreditCard)
                  }
                  title={areAllSuppliersAvailableForOrder ? 'Confirmar' : 'Agendar'}
                  onPress={onConfirmPress}
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
