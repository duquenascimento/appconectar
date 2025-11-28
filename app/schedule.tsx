import { useRouter, useLocalSearchParams } from 'expo-router';
import { DateTime } from 'luxon';
import Icons from '@expo/vector-icons/Ionicons';
import { useWindowDimensions } from 'react-native';
import { Button, Label, RadioGroup, ScrollView, Spacer, Text, View, XStack, YStack } from 'tamagui';
import { CustomImageBadge } from '@/src/components/image/customImageBadge';
import { DropdownCampo } from '@/src/components/Combination/DropdownCampo';
import { useCallback, useEffect, useState } from 'react';
import { getAllSuppliers } from '@/src/services/supplierService';
import { CartProduct } from '@/src/types/cartTypes';
import { useCart } from '@/src/components/useCart';
import { getCartProducts } from '@/src/services/cartService';
import { getSavedRestaurant } from '@/src/utils/savedRestaurant';
import { getCombinationsByRestaurant } from '@/src/services/combinationsService';
import {
  createScheduleOrder,
  deleteScheduleOrder,
  editScheduleOrder,
  getScheduleOrder,
} from '@/src/services/scheduleOrderService';
import { ScheduleOrderCreationBody, ScheduleOrderResponse } from '@/src/types/scheduleOrderTypes';
import CustomAlert from '@/src/components/modais/CustomAlert';
import { isTomorrow } from '@/src/utils/dateUtils';
import { TwoButtonCustomAlert } from '@/src/components/modais/TwoButtonCustomAlert';
import { getPricesBySupplierOrCombination, getSuppliersPrices } from '@/src/services/pricesService';
import { getUserRestaurants } from '@/src/services/restaurantService';

function capitalizeFirstLetter(str: string) {
  if (typeof str !== 'string' || str.length === 0) {
    return str;
  }
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export default function ScheduleScreen() {
  const { orderId } = useLocalSearchParams<{ orderId?: string }>();
  const { width: screenWidth } = useWindowDimensions();

  const [daysUpfront, setDaysUpfront] = useState<number>(0);
  const [selectedSupplier, setSelectedSupplier] = useState<string>('');
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [currentOrder, setCurrentOrder] = useState<ScheduleOrderResponse | undefined>();
  const [cartProducts, setCartProducts] = useState<CartProduct[]>([]);
  const [combinations, setCombinations] = useState<any[]>([]);
  const [selectedCombination, setSelectedCombination] = useState<string>('');
  const [showCombinationDropdown, setShowCombinationDropdown] = useState<boolean>(false);
  const [defaultDeliveryDateText, setDefaultDeliveryDateText] = useState<string>('Selecione...');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [openDeleteDialog, setOpenDeleteDialog] = useState<boolean>(false);
  const [isPremium, setIsPremium] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const { cart, loadCart } = useCart();
  const router = useRouter();

  const isMobile = screenWidth < 800;
  const maxWidth = isMobile ? '100%' : '70%';
  const dateOptions = Array(7)
    .fill(null)
    .map((_, index) => ({
      label: capitalizeFirstLetter(
        DateTime.now()
          .setLocale('pt-BR')
          .plus({ days: index + 2 })
          .toFormat('EEEE • dd/MM'),
      ),
      value: index + 2,
    }))
    .filter((item) => !item.label.startsWith('Dom'));

  const goBack = useCallback(() => {
    if (orderId) {
      router.push('/ordersScreen');
    } else {
      router.push('/cart');
    }
  }, []);

  const onCreateSchedule = useCallback(async () => {
    try {
      setIsSubmitting(true);
      const restaurant = await getSavedRestaurant();
      if (orderId) {
        const updateData: Partial<Omit<ScheduleOrderCreationBody, 'restaurantId'>> = {};
        if (
          Math.ceil(
            DateTime.fromISO(currentOrder!.deliveryDate).diff(DateTime.now(), 'days').days,
          ) !== daysUpfront
        ) {
          updateData.deliveryDate = DateTime.now().plus({ days: daysUpfront }).toISO();
        }

        if (showCombinationDropdown && selectedCombination !== currentOrder?.combination?.id) {
          updateData.combinationId = selectedCombination;
        }

        if (!showCombinationDropdown && selectedSupplier !== currentOrder?.supplier?.externalId) {
          updateData.supplierId = selectedSupplier;
        }

        await editScheduleOrder(orderId, updateData);
      } else {
        const creationData: ScheduleOrderCreationBody = {
          deliveryDate: DateTime.now().plus({ days: daysUpfront }).toISO(),
          restaurantId: restaurant!.id,
          combinationId: showCombinationDropdown ? selectedCombination : undefined,
          supplierId: selectedSupplier,
          products: cartProducts.map((product) => ({
            productId: product.id,
            quantity: Number(product.amount ?? '1'),
            obs: product.obs,
          })),
        };
        await createScheduleOrder(creationData);
      }
      goBack();
    } catch (error: any) {
      setErrorMessage(error?.message ?? error);
    } finally {
      setIsSubmitting(false);
    }
  }, [selectedSupplier, selectedCombination, showCombinationDropdown, daysUpfront]);

  const onDeleteSchedule = useCallback(async () => {
    try {
      if (orderId) {
        await deleteScheduleOrder(orderId!);
        setOpenDeleteDialog(false);
        goBack();
      }
    } catch (error: any) {
      setOpenDeleteDialog(false);
      setErrorMessage(error?.message ?? error);
    }
  }, []);

  const onOpenDeleteDialog = useCallback(() => {
    if (orderId) {
      setOpenDeleteDialog(true);
    }
  }, []);

  const onConfirmScheduleOrder = useCallback(async () => {
    console.log('currentOrder', currentOrder);
    if (!currentOrder) {
      return;
    }
    setIsSubmitting(true);
    try {
      const restaurant = await getSavedRestaurant();
      const userRestaurants = await getUserRestaurants();
      const currentRestaurant = userRestaurants.find(
        (r) => r.externalId === restaurant!.externalId,
      );
      console.log('currentRestaurant', currentRestaurant);
      const supplierPrices = await getSuppliersPrices({
        restaurantId: currentRestaurant!.id,
        restaurantExternalId: currentRestaurant!.externalId,
        tax: Number(currentRestaurant!.tax),
        addressInfos: currentRestaurant!.addressInfos,
      });

      const pricesBySupplier = await getPricesBySupplierOrCombination({
        restaurantId: currentRestaurant!.id,
        supplierExternalId: currentOrder.supplier?.externalId,
        combinationId: currentOrder.combination?.id,
        products: cartProducts.map((product) => ({
          id: product.id,
          sku: product.sku,
          amount: Number(product.amount ?? '1'),
          obs: product.obs,
        })),
      });
      console.log('pricesBySupplier', pricesBySupplier);
      const params: {
        combinationName?: string;
        suppliersData?: string;
        missingProducts?: string[];
        scheduleId?: string;
      } = {
        combinationName: currentOrder.combination?.nome,
        suppliersData: JSON.stringify(pricesBySupplier.map((p) => ({ supplier: p }))),
        scheduleId: currentOrder.id,
      };

      router.push({
        pathname: '/quotationDetailsScreen',
        params: params,
      });
    } catch (error: any) {
      console.log('error', error);
      setErrorMessage(error?.message ?? error);
    } finally {
      setIsSubmitting(false);
    }
  }, []);

  useEffect(() => {
    // fetch supplier options
    const featchAllSuppliers = async () => {
      const allSuppliers = await getAllSuppliers();
      setSuppliers(allSuppliers);
    };
    featchAllSuppliers();

    // fetch combination options
    const loadCombinations = async () => {
      const restaurant = await getSavedRestaurant();
      if (!restaurant) return;

      const res = await getCombinationsByRestaurant(restaurant.id);
      if (Array.isArray(res.return)) {
        setCombinations(res.return);
      }
    };
    loadCombinations();

    // fetch current order if is editing
    const loadCurrentOrder = async () => {
      const restaurant = await getSavedRestaurant();
      setIsPremium(restaurant?.premium ?? false);
      const order = await getScheduleOrder(orderId!);
      setCurrentOrder(order);

      const deliveryDate = DateTime.fromISO(order.deliveryDate);
      const diffDays = Math.ceil(deliveryDate.diff(DateTime.now(), 'days').days);

      if (diffDays > 1 && deliveryDate.weekday !== 7) {
        setDaysUpfront(diffDays);
      } else {
        setDefaultDeliveryDateText(
          capitalizeFirstLetter(
            DateTime.now().setLocale('pt-BR').plus({ days: diffDays }).toFormat('EEEE • dd/MM'),
          ),
        );
      }

      if (order.combination && restaurant?.premium) {
        setSelectedCombination(order.combination.id);
        setShowCombinationDropdown(true);
      }
      if (order.supplier) {
        setSelectedSupplier(order.supplier.externalId);
      }
      setCartProducts(
        order.products.map(
          (p) =>
            ({
              id: p.productId,
              name: p.productName,
              amount: p.quantity,
              obs: p.obs,
              sku: p.productSku,
              quotationUnit: p.unit,
            }) as CartProduct,
        ),
      );
    };
    if (orderId) {
      loadCurrentOrder();
    } else {
      if ((cart?.size ?? 0) === 0) {
        loadCart();
      }
    }
  }, []);

  useEffect(() => {
    const loadProducts = async () => {
      const restaurant = await getSavedRestaurant();
      const products = await getCartProducts(restaurant!.id);
      setCartProducts(products);
    };
    if (!orderId) {
      loadProducts();
    }
  }, [cart]);

  return (
    <View
      flex={1}
      maxWidth={maxWidth}
      padding={'$5'}
      width={'100%'}
      backgroundColor={'#F0F2F6'}
      alignSelf="center"
    >
      <View flex={1} paddingBottom={'$4'}>
        <ScrollView>
          <View gap="$2" flexDirection="row" alignItems="center">
            <Icons onPress={goBack} size={30} name="chevron-back" />
            <Text fontSize={isMobile ? 20 : 28}>
              {orderId ? 'Editar agendamento' : 'Novo agendamento'}
            </Text>
            <Spacer flex={1} />
            {orderId && isMobile && (
              <Icons onPress={onOpenDeleteDialog} size={24} name="trash-outline" color="#DD2300" />
            )}
          </View>
          <View>
            <DropdownCampo
              items={dateOptions}
              label="Data de entrega"
              value={daysUpfront}
              placeholder={defaultDeliveryDateText}
              onChange={(val) => setDaysUpfront(val)}
              campo="data_de_entrega"
              zIndex={100000}
            />
            {isPremium && (
              <RadioGroup
                aria-label="Selecionar método de pagamento"
                defaultValue="fornecedores"
                marginTop={'$2'}
                value={showCombinationDropdown ? 'combinacoes' : 'fornecedores'}
                onValueChange={(value) => setShowCombinationDropdown(value === 'combinacoes')}
              >
                <XStack gap="$4">
                  <XStack alignItems="center" gap="$2">
                    <RadioGroup.Item
                      value="fornecedores"
                      id="fornecedores"
                      background={'white'}
                      borderColor={'$black05'}
                    >
                      <RadioGroup.Indicator />
                    </RadioGroup.Item>
                    <Label htmlFor="fornecedores">Fornecedores</Label>
                  </XStack>

                  <XStack alignItems="center" gap="$2">
                    <RadioGroup.Item
                      value="combinacoes"
                      id="combinacoes"
                      background={'white'}
                      borderColor={'$black05'}
                    >
                      <RadioGroup.Indicator />
                    </RadioGroup.Item>
                    <Label htmlFor="combinacoes">Combinações</Label>
                  </XStack>
                </XStack>
              </RadioGroup>
            )}

            {showCombinationDropdown ? (
              <DropdownCampo
                items={combinations.map((c) => ({
                  label: c.nome,
                  value: c.id,
                }))}
                isLoading={!isPremium}
                label="Combinação"
                value={selectedCombination}
                onChange={(val) => setSelectedCombination(val)}
                campo="combinacao"
              />
            ) : (
              <DropdownCampo
                items={suppliers.map((supplier) => ({
                  label: supplier.nomefornecedor,
                  value: supplier.idexterno,
                }))}
                label="Fornecedor"
                value={selectedSupplier}
                onChange={(val) => setSelectedSupplier(val)}
                campo="fornecedor"
              />
            )}
          </View>
          <Text fontSize={16} paddingVertical={'$4'}>
            Lista de produtos
          </Text>
          <View gap={isMobile ? '$2' : '$4'}>
            {cartProducts.map((cartProduct) => (
              <View
                key={cartProduct.id}
                backgroundColor={'white'}
                width={'100%'}
                borderRadius={16}
                padding={'$4'}
              >
                <XStack gap={'$4'} alignItems="center">
                  <CustomImageBadge
                    uri={
                      Array.isArray(cartProduct.image) && cartProduct.image.length > 0
                        ? cartProduct.image[0]
                        : ''
                    }
                    badgeText={cartProduct.quotationUnit}
                    badgeTextSize={10}
                    badgeColor="#0BC07D"
                  />
                  <YStack gap={'$1'} flex={1}>
                    <Text fontSize={16}>{cartProduct.name}</Text>
                    <Text fontSize={12} color="#aaa">
                      Obs.: {cartProduct.obs}
                    </Text>
                  </YStack>
                  <Text fontSize={18} fontWeight={'600'} flex={0} whiteSpace="nowrap">
                    {`${cartProduct.amount ?? 1} ${cartProduct.quotationUnit ?? 'KG'}`}
                  </Text>
                </XStack>
              </View>
            ))}
          </View>
        </ScrollView>
      </View>
      <View width={'100%'} gap={isMobile ? '$2' : '$4'}>
        {currentOrder &&
          isTomorrow(DateTime.fromISO(currentOrder!.deliveryDate)) &&
          (currentOrder!.status === 'CONFIRMED' ? (
            <Text textAlign="center" color={'$green9'} fontSize={20}>
              Entrega confirmada
            </Text>
          ) : (
            <Button
              backgroundColor={'orange'}
              flex={1}
              hoverStyle={{ backgroundColor: '$orange9' }}
              onPress={onConfirmScheduleOrder}
            >
              <Text color={'white'} fontSize={16} letterSpacing={1} fontWeight={'500'}>
                Confirmar entrega
              </Text>
            </Button>
          ))}
        <XStack justifyContent="space-between" gap={'$2'}>
          {!isMobile && orderId && (
            <Button
              backgroundColor="black"
              hoverStyle={{ backgroundColor: '$black075' }}
              onPress={onOpenDeleteDialog}
            >
              <Icons name="trash" color="white" size={20} />
            </Button>
          )}

          <Button
            disabled={currentOrder && currentOrder?.status !== 'PENDENT'}
            flex={1}
            backgroundColor={
              currentOrder && currentOrder?.status !== 'PENDENT' ? '$gray8' : '#04BF7B'
            }
            hoverStyle={{ backgroundColor: '$green9' }}
            onPress={!isSubmitting ? undefined : onCreateSchedule}
          >
            <Text color={'white'} fontSize={16} letterSpacing={1} fontWeight={'500'}>
              {orderId ? 'Editar' : 'Agendar'}
            </Text>
          </Button>
        </XStack>
      </View>

      {/* DIALOGS */}
      <CustomAlert
        visible={!!errorMessage}
        title="Erro!"
        message={errorMessage}
        color="black"
        onConfirm={() => {
          setErrorMessage('');
        }}
      />

      <TwoButtonCustomAlert
        visible={openDeleteDialog}
        title="Excluir agendamento?"
        message="Essa operação não poderá ser desfeita. Tem certeza?"
        cancelText="Cancelar"
        confirmText="Excluir"
        confirmColor="#E74C3C"
        cancelColor="#04BF7B"
        onCancel={() => setOpenDeleteDialog(false)}
        onConfirm={onDeleteSchedule}
      />
    </View>
  );
}
