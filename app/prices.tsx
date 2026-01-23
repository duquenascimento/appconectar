import PageContainer from '@/src/components/box/PageContainer';
import CustomButton from '@/src/components/button/customButton';
import DialogComercialInstance from '@/src/components/dialogComercialInstance';
import LoadingActivityIndicator from '@/src/components/loading/loadingActivityIndicator';
import { Combination } from '@/src/types/combinationTypes';
import { SupplierData } from '@/src/types/types';
import { setStorageRestaurant } from '@/src/utils/restaurantUtils';
import { clearStorage, getStorage, setStorage } from '@/src/utils/utils';
import Icons from '@expo/vector-icons/Ionicons';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Platform } from 'react-native';
import { Stack, Text, View } from 'tamagui';
import CombinationList from '../src/components/combinationList';
import CustomAlert from '../src/components/modais/CustomAlert';
import { RestaurantInfoDialog } from '../src/components/restaurant/RestaurantInfoDialog';
import { RestaurantInfoDisplay } from '../src/components/restaurant/RestaurantInfoDisplay';
import SuppliersList from '../src/components/suppliersList';
import { useCombinacao } from '../src/contexts/combinacao.context';
import { useDeliveryDate } from '../src/contexts/deliveryDate.context';
import { useSupplier } from '../src/contexts/fornecedores.context';
import { useRestaurantContext } from '../src/contexts/restaurant.context';
import { getAllCombinationsByRestaurant } from '../src/services/combinationsService';
import { TCart } from '../src/types/cartTypes';
import { Restaurant } from '../src/types/restaurantTypes';
import { loadCart } from '../src/utils/cartUtils';

enum PricesTabs {
  CONECTAR_PLUS = 'plus',
  ONLY_SUPPLIER = 'onlySupplier',
}

export default function Prices() {
  const [confirmLoading, setConfirmLoading] = useState<boolean>(false);
  const [combinationsLoading, setCombinationsLoading] = useState<boolean>(false);
  const [suppliersLoading, setSuppliersLoading] = useState<boolean>(false);
  const [editInfos, setEditInfos] = useState<boolean>(false);
  const [tab, setTab] = useState<PricesTabs>(PricesTabs.CONECTAR_PLUS);
  const [finalCotacao, setFinalCotacao] = useState<boolean>(false);
  const [isConectarAlertVisible, setIsConectarAlertVisible] = useState(false);
  const [emergencyAlertVisible, setEmergencyAlertVisible] = useState<boolean>(false);
  const [retroactiveAlertVisible, setRetroactiveAlertVisible] = useState<boolean>(false);
  const [deliveryDatesAlertVisible, setDeliveryDatesAlertVisible] = useState<boolean>(true);
  const [hasAccessedConectarPlus, setHasAccessedConectarPlus] = useState(false);
  const [showBlockedModal, setShowBlockedModal] = useState(false);
  const [combinations, setCombinations] = useState<Combination[]>([]);
  const [cart, setCart] = useState<Map<string, TCart>>();
  const [mainDataLoaded, setMainDataLoaded] = useState(false);
  const router = useRouter();
  const { loadPrices } = useSupplier();
  const {
    restaurants,
    selectedRestaurant,
    handleRestaurantChange,
    loadRestaurants,
    areRestaurantsLoading,
    hasConectarPlusAccess,
  } = useRestaurantContext();
  const { modificado, setModificado } = useCombinacao();
  const {
    deliveryDate,
    errorMessage: deliveryDateErrorMessage,
    initializeDeliveryDates,
  } = useDeliveryDate();

  const handleLoadPrices = useCallback(
    async (restaurant?: Restaurant) => {
      try {
        setMainDataLoaded(false);
        setSuppliersLoading(true);
        setCombinationsLoading(true);

        await loadRestaurants(restaurant);

        if (restaurant) {
          setTab(restaurant.premium ? PricesTabs.CONECTAR_PLUS : PricesTabs.ONLY_SUPPLIER);
        }

        await loadPrices(restaurant?.externalId, deliveryDate);
        setMainDataLoaded(true);
      } catch (err) {
        setMainDataLoaded(false);
        console.error(err);
      } finally {
        setSuppliersLoading(false);
        setCombinationsLoading(false);
      }
    },
    [deliveryDate, selectedRestaurant, loadPrices, loadRestaurants, initializeDeliveryDates],
  );

  const isTabLoading = (tab: PricesTabs): boolean => {
    switch (tab) {
      case PricesTabs.CONECTAR_PLUS:
        return combinationsLoading;
      case PricesTabs.ONLY_SUPPLIER:
        return suppliersLoading;
    }
  };

  const handleTabChange = async (newTab: PricesTabs) => {
    setTab(newTab);

    if (isTabLoading(newTab)) return;

    await handleLoadPrices();
  };

  useEffect(() => {
    const loadCombinations = async () => {
      if (!mainDataLoaded || tab !== PricesTabs.CONECTAR_PLUS) return;
      try {
        const restaurantId = selectedRestaurant?.id;

        if (restaurantId) {
          const fetchedCombinations = await getAllCombinationsByRestaurant(restaurantId);
          setCombinations(fetchedCombinations);
        }
      } catch (e) {
        console.error('Erro ao carregar combinations:', e);
      }
      setModificado(false);
    };

    loadCombinations();
  }, [mainDataLoaded, tab, modificado]);

  useEffect(() => {
    async function getCart() {
      const getCartData = await loadCart();

      if (getCartData) setCart(getCartData);
    }
    getCart();
  }, []);

  const handleConfirm = () => {
    setFinalCotacao(true);
    clearStorage();
    setTimeout(() => {
      router.push('/products');
    }, 1000);
  };

  const goToConfirm = async (supplier: SupplierData, selectedRestaurant: Restaurant) => {
    try {
      setConfirmLoading(true);
      await setStorage('supplierSelected', JSON.stringify(supplier));
      await setStorageRestaurant(selectedRestaurant);
      router.push('/confirm');
    } catch (err) {
      console.error(err);
    } finally {
      setConfirmLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      const loadPricesAsync = async () => {
        try {
          setMainDataLoaded(false);

          if (!selectedRestaurant) return;

          const validRestaurant = restaurants.find(
            (r: any) => r.externalId === selectedRestaurant.externalId,
          );

          if (!validRestaurant) return;

          if (validRestaurant.registrationReleasedNewApp) {
            setShowBlockedModal(true);
          }

          await handleLoadPrices(validRestaurant);
        } catch (err) {
          console.error(err);
        } finally {
          setMainDataLoaded(true);
        }
      };
      loadPricesAsync();
    }, []),
  );

  useFocusEffect(
    useCallback(() => {
      const handleConectarPlus = async () => {
        const stored = await getStorage('hasAccessedConectarPlus');
        const alreadyAccessed = stored === 'true';
        setHasAccessedConectarPlus(alreadyAccessed);

        if (selectedRestaurant?.conectarPlusAuthorization) {
          await setStorage('hasAccessedConectarPlus', 'true');
          setHasAccessedConectarPlus(true);
        }

        if (
          tab === PricesTabs.CONECTAR_PLUS &&
          selectedRestaurant?.conectarPlusAuthorization === false &&
          alreadyAccessed
        ) {
          setIsConectarAlertVisible(true);
        }
      };
      handleConectarPlus();
    }, [selectedRestaurant]),
  );

  if (finalCotacao) {
    return (
      <View flex={1} justifyContent="center" alignItems="center">
        <ActivityIndicator size="large" color="#04BF7B" />
        <Text fontSize={12} marginTop={5} color="gray" textAlign="center">
          Cotação solicitada, fique de olho no Whatsapp
        </Text>
      </View>
    );
  }

  if (confirmLoading || !selectedRestaurant) {
    return (
      <View flex={1} justifyContent="center" alignItems="center">
        <LoadingActivityIndicator />
      </View>
    );
  }

  return (
    <PageContainer backgroundColor="white">
      <Stack backgroundColor="#F9F9F9" height="100%" position="relative">
        <View height={50} flex={1}>
          <View
            alignItems="center"
            flexDirection="row"
            paddingVertical="$2"
            gap="$4"
            style={{ width: Platform.OS === 'web' ? '70%' : '92%' }}
            marginHorizontal={'auto'}
          >
            <Icons
              onPress={() => {
                router.push('/cart');
              }}
              size={30}
              name="chevron-back"
            />
            <Text flex={1} fontSize={16}>
              Cotações
            </Text>
          </View>
          <View
            borderRadius={50}
            flexDirection="row"
            justifyContent="space-between"
            height={50}
            width={Platform.OS === 'web' ? '70vw' : ''}
            alignSelf="center"
          >
            <View
              disabled={!selectedRestaurant?.premium}
              opacity={selectedRestaurant?.premium ? 1 : 0.4}
              onPress={() => handleTabChange(PricesTabs.CONECTAR_PLUS)}
              cursor="pointer"
              hoverStyle={{ opacity: 0.75 }}
              flex={1}
              alignItems="center"
              justifyContent="center"
            >
              <Text color={tab === PricesTabs.CONECTAR_PLUS ? '#04BF7B' : 'gray'}>Conéctar+</Text>
              <View
                marginTop={10}
                height={1}
                width="100%"
                backgroundColor={tab === PricesTabs.CONECTAR_PLUS ? '#04BF7B' : 'white'}
              />
            </View>
            <View
              onPress={() => handleTabChange(PricesTabs.ONLY_SUPPLIER)}
              cursor="pointer"
              hoverStyle={{ opacity: 0.75 }}
              flex={1}
              alignItems="center"
              justifyContent="center"
            >
              <Text color={tab === PricesTabs.CONECTAR_PLUS ? 'gray' : '#04BF7B'}>
                Por fornecedor
              </Text>
              <View
                marginTop={10}
                height={1}
                width="100%"
                backgroundColor={tab === PricesTabs.CONECTAR_PLUS ? 'white' : '#04BF7B'}
              />
            </View>
          </View>
          {areRestaurantsLoading && !selectedRestaurant ? (
            <View flex={1} justifyContent="center" alignItems="center">
              <LoadingActivityIndicator />
            </View>
          ) : (
            <>
              <View backgroundColor="white" flex={1} paddingHorizontal={5}>
                <View padding={10} paddingTop={0} height="100%">
                  {tab === PricesTabs.ONLY_SUPPLIER && (
                    <SuppliersList
                      cart={cart}
                      goToConfirm={goToConfirm}
                      suppliersLoading={suppliersLoading}
                    />
                  )}

                  {tab === PricesTabs.CONECTAR_PLUS && (
                    <CombinationList
                      combinationsLoading={combinationsLoading}
                      mainDataLoaded={mainDataLoaded}
                      handleConfirm={handleConfirm}
                    />
                  )}
                </View>
              </View>
              {tab === PricesTabs.CONECTAR_PLUS && hasConectarPlusAccess && (
                <CustomButton
                  title="Minhas combinações"
                  onPress={async () => {
                    router.push('/preferencesScreen');
                  }}
                ></CustomButton>
              )}
              <RestaurantInfoDisplay
                onEditPress={() => setEditInfos(true)}
                setEmergencyAlertVisible={setEmergencyAlertVisible}
                setRetroactiveAlertVisible={setRetroactiveAlertVisible}
              />
              <RestaurantInfoDialog
                visible={editInfos}
                onClose={() => setEditInfos(false)}
                handleLoadPrices={handleLoadPrices}
              />
            </>
          )}
          <CustomAlert
            visible={isConectarAlertVisible}
            title="Conéctar+ indisponível!"
            message="Parece que a cotação automática do Conectar+ ainda não está disponível para sua conta. Mas tudo bem! Solicite uma cotação e daremos continuidade ao seu pedido."
            onConfirm={() => setIsConectarAlertVisible(false)}
          />
          <CustomAlert
            visible={emergencyAlertVisible}
            title="Este é um pedido de emergência"
            message="Fique atento à data de entrega do pedido"
            onConfirm={() => setEmergencyAlertVisible(false)}
          />
          <CustomAlert
            visible={retroactiveAlertVisible}
            title="Cotação Retroativa"
            message="Você está em modo de cotação retroativa para verificar preços anteriores. As cotações feitas neste modo não serão enviadas aos fornecedores."
            onConfirm={() => setRetroactiveAlertVisible(false)}
          />
          <CustomAlert
            visible={deliveryDateErrorMessage !== null && deliveryDatesAlertVisible}
            title="Erro ao carregar datas de entrega disponíveis"
            message={deliveryDateErrorMessage || ''}
            onConfirm={() => setDeliveryDatesAlertVisible(false)}
          />
          <DialogComercialInstance
            openModal={showBlockedModal}
            setOpenModal={setShowBlockedModal}
            setRegisterInvalid={setShowBlockedModal}
            rest={restaurants}
            messageText="Este restaurante não está liberado para fazer cotações. Entre em contato conosco ou selecione outro restaurante disponível."
            onSelectAvailable={async () => {
              try {
                // Encontrar um restaurante disponível
                const availableRestaurant = restaurants.find((r) => !r.registrationReleasedNewApp);
                if (availableRestaurant) {
                  // 1. Fechar o modal
                  setShowBlockedModal(false);

                  // 2. Troca restaurante
                  handleRestaurantChange(availableRestaurant);

                  // 3. Recarregar os preços para o novo restaurante
                  await handleLoadPrices(availableRestaurant);
                }
              } catch (error) {
                console.error('Erro ao trocar de restaurante:', error);
              }
            }}
          />
        </View>
      </Stack>
    </PageContainer>
  );
}
