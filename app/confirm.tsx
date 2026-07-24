/* eslint-disable react-native/no-inline-styles */
import Icons from '@expo/vector-icons/Ionicons';
import * as Notifications from 'expo-notifications';
import { useFocusEffect, usePathname, useRouter } from 'expo-router';
import { debounce } from 'lodash';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, Platform } from 'react-native';
import { Button, Image, ScrollView, Stack, Text, View } from 'tamagui';
import { AccordionInfo } from '../src/components/AccordionInfo';
import { DialogInstance } from '../src/components/confirm/dialogInstance';
// eslint-disable-next-line max-len
import { OrderScheduleNotificationDialog } from '../src/components/confirm/orderScheduleNotificationDialog';
import { CreditCardSection } from '../src/components/CreditCardSection';
import { useResponsiveness } from '../src/components/hooks/useResponsiveness';
import { ImageWithFallback } from '../src/components/image/ImageWithFallback';
import PdfViewerModal from '../src/components/modais/PdfViewerModal';
import { CreateCreditCardModal } from '../src/components/pages/confirm/CreateCreditCardModal';
// eslint-disable-next-line max-len
import { RetroactiveQuotationWarningBanner } from '../src/components/quotations/RetroactiveQuotationWarningBanner';
import { getCreditCards } from '../src/services/creditCardService';
import { CreditCard } from '../src/types/creditCardTypes';
import { SupplierData } from './quotationDetailsScreen';
import { extractDefaultCreditCart } from '../src/utils/creditCardUtils';
import { getBrazilDateTime } from '../src/utils/dateUtils';
import { extractErrorMessage } from '../src/utils/errorUtils';
import { processOrderResponse } from '../src/utils/processOrderResponse';
import {
  checkSupplierAvailabilityMessage,
  SupplierAvailabilityOnConfirm,
} from '../src/utils/supplierUtils';
import { getSecondsUntilTime } from '../src/utils/timeUtils';
import PageContainer from '../src/components/box/PageContainer';
import CustomAlert from '../src/components/modais/CustomAlert';
import MissingItemsDialog from '../src/components/modais/MissingItemsDialog';
import SundayOrderAlert from '../src/components/modais/SundayOrderAlert';
import { useDeliveryDate } from '../src/contexts/deliveryDate.context';
import { useRestaurantContext } from '../src/contexts/restaurant.context';
import { confirmOrder, ConfirmOrderRequestBody } from '../src/services/orderService';
import { scheduleNotification } from '../src/utils/agendamentoUtils';
import { useInactivityRedirect } from '../src/utils/inativityTimer';
import { getPaymentDate, getPaymentDescription } from '../src/utils/paymentUtils';
import { deleteStorage, getStorage, getToken } from '../src/utils/utils';
import { validateAddress } from '../src/utils/validateAddress';
import BadgeText from '../src/components/text/BadgeText';

if (Platform.OS !== 'web') {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });
}

export default function Confirm() {
  const [supplier, setSupplier] = useState<SupplierData>({} as SupplierData);
  const [loading, setLoading] = useState<boolean>(true);
  const [loadingToConfirm, setLoadingToConfirm] = useState<boolean>(false);
  const [dots, setDots] = useState('');
  const [showErros, setShowErros] = useState<string[]>([]);
  const [booleanErros, setBooleanErros] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const [showMissingItemsModal, setShowMissingItemsModal] = useState(false);
  const [showSundayWarning, setShowSundayWarning] = useState(false);
  const [cartOrder, setCartOrder] = useState<{ sku: string; addOrder: number }[]>([]);
  const [selectedPdfUrl, setSelectedPdfUrl] = useState<string | null>(null);
  const [showPdfModal, setShowPdfModal] = useState(false);
  const [isAlertVisible, setIsAlertVisible] = useState<boolean>(false);
  const [alertMessage, setAlertMessage] = useState<string>('');
  const [supplierAvailability, setSupplierAvailability] = useState<SupplierAvailabilityOnConfirm>();
  const [disableConfirm, setDisableConfirm] = useState<boolean>(false);
  const [openCreditCardDialog, setOpenCreditCardDialog] = useState<boolean>(false);
  const [selectedCreditCard, setSelectedCreditCard] = useState<CreditCard | undefined>();
  const [isCpf, setIsCpf] = useState<boolean>(false);
  const [confirmedWarnings, setConfirmedWarnings] = useState<{
    missingItems: boolean;
    sundayWarning: boolean;
  }>({
    missingItems: false,
    sundayWarning: false,
  });
  const { selectedRestaurant } = useRestaurantContext();
  const { deliveryDate, getFormattedDate, resetDeliveryDate, isRetroactiveDate } =
    useDeliveryDate();
  const { isLargeScreen } = useResponsiveness();
  const router = useRouter();
  const pathname = usePathname();

  const hasSameDayOrdersWithSupplier = useMemo(() => {
    return supplier?.supplier?.sameDayOrders?.length > 0;
  }, [supplier]);

  const handleShowPdf = useCallback((pdfUrl: string) => {
    setSelectedPdfUrl(pdfUrl);
    setShowPdfModal(true);
  }, []);

  useEffect(() => {
    if (loadingToConfirm) {
      const interval = setInterval(() => {
        setDots((prevDots) => {
          if (prevDots.length === 3) {
            return '';
          }
          return `${prevDots}.`;
        });
      }, 500);

      return () => clearInterval(interval);
    }
  }, [loadingToConfirm]);

  useInactivityRedirect({
    timeout: 120000,
    redirectPath: '/prices',
    enabled: pathname === '/confirm',
  });

  const loadSupplier = useCallback(async () => {
    const supplierText = await getStorage('supplierSelected');
    if (!supplierText) return;
    const supplier = JSON.parse(supplierText);
    setSupplier(supplier);
    return supplier;
  }, []);

  const loadCreditCards = useCallback(async () => {
    const restaurantId = selectedRestaurant?.id;
    if (!restaurantId) return;

    if (selectedRestaurant.paymentWay !== 'CC32') {
      return;
    }

    try {
      const isCpfRestaurant = selectedRestaurant.companyRegistrationNumber.length === 11;
      setIsCpf(isCpfRestaurant);
      if (isCpfRestaurant) {
        const creditCards = await getCreditCards(restaurantId);
        const defaultCreditCard = extractDefaultCreditCart(creditCards);
        if (defaultCreditCard) {
          setSelectedCreditCard(defaultCreditCard);
        } else {
          setOpenCreditCardDialog(true);
        }
      }
    } catch (err) {
      console.error(err);
    }
  }, [selectedRestaurant]);

  useEffect(() => {
    const loadSupplierAsync = async () => {
      try {
        setLoading(true);
        const loadedSupplier = await loadSupplier();
        const supplierAvailabilityData = checkSupplierAvailabilityMessage(
          loadedSupplier?.supplier?.openingTime,
        );

        if (selectedRestaurant?.allowEmergencyOrder ?? false) {
          supplierAvailabilityData.isSupplierAvailableForOrder = true;
        }

        setSupplierAvailability(supplierAvailabilityData);
      } catch (err) {
        console.error(err);
        router.push('/prices');
      } finally {
        setLoading(false);
      }
    };
    loadSupplierAsync();
  }, [loadSupplier, router]);

  useFocusEffect(
    useCallback(() => {
      loadCreditCards();
    }, [loadCreditCards]),
  );

  useEffect(() => {
    const tryToLoadCartOrder = async () => {
      try {
        const data = await getStorage('cartOrder');
        const parsed = JSON.parse(data || '[]');
        Array.isArray(parsed) && setCartOrder(parsed);
      } catch (e) {
        console.error('Erro ao carregar cartOrder:', e);
      }
    };

    tryToLoadCartOrder();
  }, []);

  const productsWithAddOrder = useMemo(
    () =>
      supplier?.supplier?.discount?.product
        ?.map((i) => ({
          ...i,
          addOrder: cartOrder.find((o) => o.sku === i.sku)?.addOrder ?? Infinity,
        }))
        .sort((a, b) => {
          if (a.price === 0 && b.price !== 0) return -1;
          if (a.price !== 0 && b.price === 0) return 1;

          return a.addOrder - b.addOrder;
        }) || [],
    [supplier, cartOrder],
  );

  const isOpen = () => {
    const currentDate = getBrazilDateTime();
    const currentHour = Number(
      `${currentDate.hour.toString().length < 2 ? `0${currentDate.hour}` : currentDate.hour}${
        currentDate.minute.toString().length < 2 ? `0${currentDate.minute}` : currentDate.minute
      }${currentDate.second.toString().length < 2 ? `0${currentDate.second}` : currentDate.second}`,
    );

    return (
      Number(supplier?.supplier?.hour.replaceAll(':', '')) >= currentHour &&
      (supplier?.supplier?.minimumOrder <= supplier?.supplier?.discount.orderValueFinish ||
        hasSameDayOrdersWithSupplier ||
        (selectedRestaurant?.allowMinimumOrder ?? false))
    );
  };

  const displayMissingItems = supplier?.supplier?.missingItens ?? 0;
  const hasScheduledProduct = supplier?.supplier?.discount?.product.filter(
    (p) => p.scheduled === true,
  );

  const handleConfirmOrder = useCallback(
    async (overrideWarnings?: { missingItems?: boolean; sundayWarning?: boolean }) => {
      if (disableConfirm) {
        return;
      }
      setDisableConfirm(true);

      try {
        if (isRetroactiveDate) {
          setAlertMessage(
            // eslint-disable-next-line max-len
            'Cotação retroativa: Não é possível criar pedidos com datas passadas. Esta funcionalidade é apenas para comparação de preços históricos.',
          );
          setIsAlertVisible(true);
          setDisableConfirm(false);
          return;
        }

        const token = await getToken();
        if (!token || !selectedRestaurant) {
          Alert.alert('Erro', 'Token de autenticação não encontrado.');
          return;
        }

        const effectiveWarnings = {
          ...confirmedWarnings,
          ...overrideWarnings,
        };

        if (
          (displayMissingItems > 0 && !effectiveWarnings.missingItems) ||
          hasScheduledProduct.length > 0
        ) {
          setShowMissingItemsModal(true);
          return;
        }

        if (getBrazilDateTime(deliveryDate).weekday === 7 && !effectiveWarnings.sundayWarning) {
          setShowSundayWarning(true);
          return;
        }

        setLoadingToConfirm(true);
        const body: ConfirmOrderRequestBody = {
          token,
          supplier: supplier.supplier,
          restaurant: selectedRestaurant,
          appVersion: process.env.EXPO_PUBLIC_VERSION,
          creditCardId: selectedCreditCard?.id,
          deliveryDate: selectedRestaurant.allowEmergencyOrder
            ? getBrazilDateTime().toISODate()
            : deliveryDate,
        };

        const erros = [];
        if (!selectedRestaurant.allowEmergencyOrder) {
          if (!isOpen() && !selectedRestaurant.allowClosedSupplier) {
            erros.push('O fornecedor está fechado');
          }
          if (
            supplier?.supplier?.minimumOrder > supplier?.supplier?.discount.orderValueFinish &&
            !selectedRestaurant.allowMinimumOrder &&
            !hasSameDayOrdersWithSupplier
          ) {
            erros.push('O valor do pedido não atingiu o mínimo do fornecedor');
          }

          if (erros.length > 0) {
            setShowErros(erros);
            setBooleanErros(true);
            setLoadingToConfirm(false);
            return;
          }
        }

        const result = await confirmOrder(body);

        resetDeliveryDate();
        setConfirmedWarnings({ missingItems: false, sundayWarning: false });

        const suppliersWithOrderId = processOrderResponse(
          [supplier],
          [{ orderId: result.data.orderId, externalId: supplier.supplier.externalId }],
        );

        router.push({
          pathname: '/orderSuccess',
          params: {
            suppliers: JSON.stringify(suppliersWithOrderId),
            deliveryDate: getFormattedDate(deliveryDate),
          },
        });
      } catch (error) {
        const errorMessage = extractErrorMessage(error);
        console.error('Erro ao confirmar o pedido por fornecedor:', error);
        setShowErros([errorMessage]);
        setBooleanErros(true);
      } finally {
        setLoadingToConfirm(false);
        setDisableConfirm(false);
      }
    },
    [
      supplier,
      disableConfirm,
      selectedRestaurant,
      router,
      confirmedWarnings,
      displayMissingItems,
      deliveryDate,
      selectedCreditCard,
      resetDeliveryDate,
    ],
  );

  const handleConfirmMissingItems = useCallback(async () => {
    setShowMissingItemsModal(false);
    setConfirmedWarnings((prev) => ({ ...prev, missingItems: true }));
    await handleConfirmOrder({ missingItems: true });
  }, [handleConfirmOrder]);

  const handleConfirmSundayWarning = useCallback(async () => {
    setShowSundayWarning(false);
    setConfirmedWarnings((prev) => ({ ...prev, sundayWarning: true }));
    await handleConfirmOrder({ sundayWarning: true });
  }, [handleConfirmOrder]);

  const handleCloseMissingItems = useCallback(() => {
    setShowMissingItemsModal(false);
    setConfirmedWarnings({ missingItems: false, sundayWarning: false });
  }, []);

  const handleCloseSundayWarning = useCallback(() => {
    setShowSundayWarning(false);
    setConfirmedWarnings({ missingItems: false, sundayWarning: false });
  }, []);

  const isSuppliersAvailableForOrder = supplierAvailability?.isSupplierAvailableForOrder ?? false;

  const handleConfirmButtonPress = useCallback(async () => {
    try {
      const isSupplierAvailable = supplierAvailability?.isSupplierAvailableForOrder ?? false;
      if (!isSupplierAvailable && selectedRestaurant) {
        setDisableConfirm(true);
        const [targetHours, targetMinutes] = supplierAvailability?.openingTime
          ?.split(':')
          .map(Number) ?? [13, 0];
        const errors = await scheduleNotification(
          selectedRestaurant!.addressInfos[0].responsibleReceivingPhoneNumber,
          getSecondsUntilTime(targetHours, targetMinutes),
        );

        setShowErros(errors);
        if (errors.length) setBooleanErros(true);
        else setShowNotification(true);
        setDisableConfirm(false);
      } else {
        const validationResult = validateAddress(selectedRestaurant);
        if (!validationResult.isValid) {
          setAlertMessage(validationResult.message);
          setIsAlertVisible(true);
          return;
        }

        await handleConfirmOrder();
      }
    } catch (error) {
      console.error('Erro no botão de confirmação:', error);
    }
  }, [supplierAvailability, selectedRestaurant, handleConfirmOrder]);

  // Debounce para evitar múltiplos cliques rápidos
  const onConfirmPressDebounced = useMemo(
    () =>
      debounce(handleConfirmButtonPress, 300, {
        leading: true,
        trailing: false,
      }) as unknown as () => void,
    [handleConfirmButtonPress],
  );

  if (loading || !selectedRestaurant || !supplier?.supplier) {
    return (
      <View flex={1} justifyContent="center" alignItems="center">
        <ActivityIndicator size="large" color="#04BF7B" />
      </View>
    );
  }

  if (loadingToConfirm) {
    return (
      <View backgroundColor="#e3e6e7" flex={1} justifyContent="center" alignItems="center">
        <Image width={300} height={300} source={require('../assets/images/korzina.gif')} />
        <Text fontWeight="800" paddingTop={20}>
          Estamos confirmando o seu pedido{dots}
        </Text>
      </View>
    );
  }

  return (
    <PageContainer backgroundColor="white">
      <Stack backgroundColor="#F9F9F9" height="100%" position="relative">
        <DialogInstance
          openModal={booleanErros}
          setRegisterInvalid={setBooleanErros}
          erros={showErros}
        />

        <OrderScheduleNotificationDialog
          openModal={showNotification}
          setRegisterInvalid={setShowNotification}
          supplierOpeningTime={supplierAvailability?.openingTime}
        />
        <MissingItemsDialog
          open={showMissingItemsModal}
          onClose={handleCloseMissingItems}
          onConfirm={handleConfirmMissingItems}
          missingItemsCount={displayMissingItems}
          scheduleItemsCount={hasScheduledProduct.length}
        />
        <CreateCreditCardModal
          open={openCreditCardDialog}
          setOpen={setOpenCreditCardDialog}
          onSaved={async () => {
            await loadCreditCards();
          }}
        />
        <CustomAlert
          visible={isAlertVisible}
          title="Endereço Incompleto"
          message={alertMessage}
          onConfirm={() => setIsAlertVisible(false)}
          width="80%"
        />
        <SundayOrderAlert
          visible={showSundayWarning}
          onCancel={handleCloseSundayWarning}
          onConfirm={handleConfirmSundayWarning}
        />
        {selectedPdfUrl && showPdfModal && (
          <PdfViewerModal
            key={selectedPdfUrl}
            pdfUrl={selectedPdfUrl}
            open={showPdfModal}
            onClose={() => setShowPdfModal(false)}
          />
        )}

        {isRetroactiveDate && <RetroactiveQuotationWarningBanner />}

        <View
          backgroundColor="white"
          flexDirection="row"
          style={{ width: isLargeScreen ? '74%' : '90%' }}
          marginHorizontal="auto"
        >
          <View alignItems="center" flexDirection="row" paddingVertical="$4" gap="$4">
            <Icons
              size={30}
              name="chevron-back"
              onPress={() => {
                setLoading(true);
                deleteStorage('supplierSelected');
                router.push('/prices');
              }}
            />
          </View>
          <View flexDirection="row" marginLeft={10} alignSelf="center">
            <View justifyContent="center">
              <ImageWithFallback
                // eslint-disable-next-line max-len
                uri={`https://cdn.conectarhortifruti.com.br/files/images/supplier/${supplier?.supplier?.externalId}.jpg`}
              />
            </View>
            <View marginLeft={10} justifyContent="center">
              <Text fontSize={16}>{supplier?.supplier?.name}</Text>
              <View flexDirection="row" alignItems="center">
                <Icons color="orange" name="star" />
                <Text color="gray" paddingLeft={4}>
                  {supplier?.supplier?.star}
                </Text>
              </View>
            </View>
          </View>
        </View>

        <ScrollView backgroundColor="white">
          <View backgroundColor="white" padding={15}>
            {hasSameDayOrdersWithSupplier && (
              <View
                marginLeft={isLargeScreen ? 10 : 0}
                width={isLargeScreen ? '70.5vw' : '100%'}
                alignSelf="center"
              >
                <AccordionInfo
                  // eslint-disable-next-line max-len
                  title={`Você já possui ${supplier?.supplier?.sameDayOrders.length} pedido${supplier?.supplier?.sameDayOrders.length > 1 ? 's' : ''} com esse fornecedor para o dia ${getBrazilDateTime(deliveryDate).toFormat('dd/MM/yyyy')}`}
                  content={supplier?.supplier?.sameDayOrders.map((order, index) => (
                    <View key={order.id || index}>
                      <View padding={12} backgroundColor="#F9F9F9" borderRadius={8} gap={8}>
                        <View
                          flexDirection="row"
                          justifyContent="space-between"
                          alignItems="center"
                        >
                          <View>
                            <Text fontSize={14} fontWeight="600">
                              Pedido {order.id || 'N/A'}
                            </Text>
                          </View>
                          {order.orderDocument && (
                            <Button
                              onPress={() => handleShowPdf(order.orderDocument!)}
                              backgroundColor="#04BF7B"
                              size="$3"
                              paddingHorizontal={16}
                              paddingVertical={8}
                            >
                              <Text fontSize={12} color="white" fontWeight="600">
                                Ver recibo
                              </Text>
                            </Button>
                          )}
                        </View>
                      </View>
                      {index < (supplier?.supplier?.sameDayOrders.length || 0) - 1 && (
                        <View height={1} backgroundColor="#E0E0E0" marginVertical={8} />
                      )}
                    </View>
                  ))}
                />
              </View>
            )}
            <View
              alignItems="center"
              marginLeft={isLargeScreen ? 10 : ''}
              width={isLargeScreen ? '70.5vw' : ''}
              alignSelf="center"
              borderColor="gray"
              minHeight={40}
              flexDirection="row"
              borderWidth={0.5}
            >
              <Icons color="gray" size={24} name="warning" style={{ paddingLeft: 5 }} />
              {/* // modified add */}
              <Text
                color="gray"
                marginLeft={5}
                marginRight={10}
                textBreakStrategy="simple"
                fontSize={12}
                width={isLargeScreen ? '70vw' : '90%'}
              >
                Podem ocorrer pequenas variações de peso/tamanho nos produtos, comum ao hortifrúti.
              </Text>
            </View>
            <View
              paddingTop={25}
              width={isLargeScreen ? '70vw' : ''}
              alignSelf={isLargeScreen ? 'center' : 'flex-start'}
            >
              <Text>Produtos selecionados</Text>
            </View>
          </View>
          <View
            width={isLargeScreen ? '70vw' : '92%'}
            alignSelf="center"
            flex={1}
            backgroundColor="white"
          >
            {productsWithAddOrder.map((item) => {
              return (
                <View
                  key={item.sku}
                  borderBottomColor="lightgray"
                  paddingVertical={10}
                  borderBottomWidth={0.5}
                  justifyContent="center"
                >
                  <View flexDirection="row" alignItems="center">
                    <View flex={1} flexDirection="row" alignItems="center">
                      <View padding={5}>
                        <Image source={{ uri: item.image[0], width: 50, height: 50 }} />
                      </View>
                      <View maxWidth={150}>
                        <Text>{item.name}</Text>
                        <Text fontSize={12} color="gray">
                          Obs: {item.obs ? item.obs : ''}
                        </Text>
                        {item.scheduled && (
                          <BadgeText text="Por encomenda" color="#3B82F6" marginTop={4} />
                        )}
                      </View>
                    </View>
                    <View>
                      <Text
                        fontWeight="800"
                        color={item.price ? 'black' : 'red'}
                        alignSelf="flex-end"
                        fontSize={16}
                      >
                        {item.price
                          ? `R$ ${item.price.toFixed(2).replace('.', ',')}`
                          : 'Indisponível'}
                      </Text>
                      <View alignSelf="flex-end" flexDirection="row" alignItems="center">
                        <Text paddingRight={5} fontSize={12}>
                          {item.quant} {item.orderUnit.replace('Unid', 'Un')}
                        </Text>
                        <Text color="gray">
                          |{' '}
                          {item.priceUniqueWithTaxAndDiscount
                            ? `R$ ${item.priceUniqueWithTaxAndDiscount
                                .toFixed(2)
                                .replace('.', ',')}`
                            : 'R$ ----'}
                          /{item.orderUnit.replace('Unid', 'Un')}
                        </Text>
                      </View>
                    </View>
                  </View>
                </View>
              );
            })}
          </View>
          <View
            backgroundColor="white"
            gap={15}
            marginTop={20}
            paddingVertical={16}
            width={isLargeScreen ? '70vw' : '92%'}
            alignSelf="center"
          >
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={{ fontSize: 14, color: 'gray', flexGrow: 0 }}>Subtotal: </Text>
              <Text
                style={{
                  flexGrow: 1,
                  marginLeft: isLargeScreen ? 8 : '',
                }}
              >
                R$ {supplier.supplier?.discount.orderValueFinish.toFixed(2).replace('.', ',')}
              </Text>
            </View>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                paddingTop: 10,
              }}
            >
              <Text style={{ fontSize: 14, color: 'gray', flexGrow: 0 }}>Descontos: </Text>
              <Text
                style={{
                  flexGrow: 1,
                  marginLeft: isLargeScreen ? 8 : '',
                }}
              >
                R$ 0,00
              </Text>
            </View>
            <View style={{ flexDirection: 'column', paddingTop: 10 }}>
              <View style={{ flexDirection: 'row' }}>
                <Text style={{ fontSize: 14, color: 'gray', flexGrow: 0 }}>Total: </Text>
                <Text
                  style={{
                    flexGrow: 1,
                    marginLeft: isLargeScreen ? 8 : '',
                  }}
                >
                  R$ {supplier?.supplier?.discount.orderValueFinish.toFixed(2).replace('.', ',')}
                </Text>
              </View>
              <Text style={{ fontSize: 14, color: 'gray', flexGrow: 0 }}>
                {supplier?.supplier?.discount.product.length} item(s) | {displayMissingItems}{' '}
                faltante(s)
              </Text>
            </View>
            <View marginVertical={20} borderWidth={0.5} borderColor="lightgray" />
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                paddingTop: 10,
              }}
            >
              <Text style={{ fontSize: 14, color: 'gray', flexGrow: 0 }}>Formato pagamento: </Text>
              <Text
                style={{
                  flexGrow: 1,
                  marginLeft: isLargeScreen ? 8 : '',
                }}
              >
                {getPaymentDescription(selectedRestaurant.paymentWay)}
              </Text>
            </View>
            {selectedCreditCard && <CreditCardSection creditCard={selectedCreditCard} />}
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                paddingTop: 10,
              }}
            >
              <Text style={{ fontSize: 14, color: 'gray', flexGrow: 0 }}>Vencimento: </Text>
              <Text
                style={{
                  flexGrow: 1,
                  marginLeft: isLargeScreen ? 8 : '',
                }}
              >
                {getPaymentDate(
                  selectedRestaurant.paymentWay,
                  selectedRestaurant.allowEmergencyOrder,
                )}
              </Text>
            </View>
            <View marginVertical={20} borderWidth={0.5} borderColor="lightgray" />
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={{ fontSize: 14, color: 'gray', flexGrow: 0 }}>Restaurante: </Text>
              <View
                style={{
                  flexGrow: 1,
                  marginLeft: isLargeScreen ? 8 : '',
                }}
              >
                <Text>{selectedRestaurant.name}</Text>
              </View>
            </View>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                paddingTop: 10,
              }}
            >
              <Text style={{ fontSize: 14, color: 'gray', flexGrow: 0 }}>Endereço: </Text>
              <View
                style={{
                  flexGrow: 1,
                  marginLeft: isLargeScreen ? 8 : '',
                }}
              >
                <Text numberOfLines={3} ellipsizeMode="tail">
                  {(selectedRestaurant.addressInfos[0].localType ?? '').toUpperCase()}{' '}
                  {(selectedRestaurant.addressInfos[0].address ?? '').toUpperCase()},{' '}
                  {selectedRestaurant.addressInfos[0].localNumber},{' '}
                  {(selectedRestaurant.addressInfos[0].complement ?? '').toUpperCase()} -{' '}
                  {(selectedRestaurant.addressInfos[0].neighborhood ?? '').toUpperCase()},{' '}
                  {(selectedRestaurant.addressInfos[0].city ?? '').toUpperCase()}
                </Text>
              </View>
            </View>

            <View
              style={{
                flexDirection: 'row',
                paddingTop: 10,
                alignItems: 'center',
              }}
            >
              <Text style={{ fontSize: 14, color: 'gray', flexGrow: 0 }}>Data: </Text>
              <View
                style={{
                  flexGrow: 1,
                  marginLeft: isLargeScreen ? 8 : '',
                }}
              >
                <Text>{getFormattedDate()}</Text>
              </View>
            </View>

            <View
              style={{
                flexDirection: 'row',
                paddingTop: 10,
                alignItems: 'center',
              }}
            >
              <Text style={{ fontSize: 14, color: 'gray', flexGrow: 0 }}>Horário: </Text>
              <View
                style={{
                  flexGrow: 1,
                  marginLeft: isLargeScreen ? 8 : '',
                }}
              >
                <Text>
                  {selectedRestaurant.addressInfos[0].initialDeliveryTime.substring(11, 16)} -{' '}
                  {selectedRestaurant.addressInfos[0].finalDeliveryTime.substring(11, 16)}
                </Text>
              </View>
            </View>

            <View
              style={{
                flexDirection: 'row',
                paddingTop: 10,
                alignItems: 'center',
              }}
            >
              <Text style={{ fontSize: 14, color: 'gray', flexGrow: 0 }}>Obs entrega: </Text>
              <Text
                style={{
                  maxWidth: 200,
                  flexGrow: 1,
                  marginLeft: isLargeScreen ? 8 : '',
                }}
              >
                {selectedRestaurant.addressInfos[0].deliveryInformation || '--'}
              </Text>
            </View>
            <View
              style={{
                flexDirection: 'row',
                paddingTop: 10,
                alignItems: 'center',
              }}
            >
              <Text style={{ fontSize: 14, color: 'gray', flexGrow: 0 }}>Entregar para: </Text>
              <Text
                style={{
                  flexGrow: 1,
                  marginLeft: isLargeScreen ? 8 : '',
                }}
              >
                {selectedRestaurant.addressInfos[0].responsibleReceivingName || '--'}
              </Text>
            </View>
            <View
              style={{
                flexDirection: 'row',
                paddingTop: 10,
                alignItems: 'center',
              }}
            >
              <Text style={{ fontSize: 14, color: 'gray', flexGrow: 0 }}>Telefone: </Text>
              <Text
                style={{
                  flexGrow: 1,
                  marginLeft: isLargeScreen ? 8 : '',
                }}
              >
                {selectedRestaurant.addressInfos[0].responsibleReceivingPhoneNumber || '--'}
              </Text>
            </View>
          </View>
        </ScrollView>
        <View paddingTop={10} paddingHorizontal={10}>
          <Text
            marginHorizontal="auto"
            color="red"
            fontSize={10}
            textAlign="center"
            display={isSuppliersAvailableForOrder ? 'none' : 'flex'}
          >
            {supplierAvailability?.mainMessage || 'Fornecedor indisponível para pedidos no momento'}
            {isLargeScreen ? '.' : ', agende uma notificação para alertar no horário'}
          </Text>
        </View>
        <View
          backgroundColor="white"
          gap={10}
          flexDirection="row"
          padding={10}
          justifyContent="center"
          alignItems="center"
        >
          <Button
            onPress={() => {
              router.push('/cart');
            }}
            width={170}
            backgroundColor="#000"
          >
            <Text color="white">Alterar itens</Text>
          </Button>
          <Button
            disabled={
              disableConfirm ||
              isRetroactiveDate ||
              (isCpf && isSuppliersAvailableForOrder && !selectedCreditCard)
            }
            onPress={onConfirmPressDebounced}
            width={170}
            backgroundColor="#04BF7B"
            disabledStyle={{
              backgroundColor: '#A9A9A9',
            }}
          >
            <Text fontSize={13} color="white" textAlign="center" style={{ fontSize: 12 }}>
              {isSuppliersAvailableForOrder ? 'Confirmar pedido' : 'Agendar notificação'}
            </Text>
          </Button>
        </View>
      </Stack>
    </PageContainer>
  );
}
