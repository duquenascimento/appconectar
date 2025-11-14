import PageContainer from '@/src/components/box/PageContainer';
import CustomButton from '@/src/components/button/customButton';
import CombinationList, { Combination } from '@/src/components/combinationList';
import { DialogComercialInstance } from '@/src/components/dialogComercialInstance';
import CustomAlert from '@/src/components/modais/CustomAlert';
import DialogInstanceNotification from '@/src/components/modais/DialogInstanceNotification';
import { useCombinacao } from '@/src/contexts/combinacao.context';
import { useSupplier } from '@/src/contexts/fornecedores.context';
import { useRestaurantContext } from '@/src/contexts/restaurant.context';
import { useDeliveryDate } from '@/src/hooks/useDeliveryDate';
import { getAllCombinationsByRestaurant } from '@/src/services/combinationsService';
import { confirmPremiumOrder } from '@/src/services/orderService';
import { loadPermissionConectarPlus } from '@/src/services/restaurantService';
import { TCart } from '@/src/types/cartTypes';
import { Restaurant } from '@/src/types/restaurant';
import { loadCart } from '@/src/utils/cartUtils';
import { campoString } from '@/src/utils/formatCampos';
import { getStarValue } from '@/src/utils/getStarValue';
import { clearStorage, getStorage, getToken, setStorage } from '@/src/utils/utils';
import Icons from '@expo/vector-icons/Ionicons';
import { useFocusEffect, useRouter } from 'expo-router';
import { DateTime } from 'luxon';
import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  KeyboardAvoidingView,
  Modal,
  Platform,
  VirtualizedList,
} from 'react-native';
import DropDownPicker from 'react-native-dropdown-picker';
import { Button, Image, Input, ScrollView, Stack, Text, View } from 'tamagui';

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
  addOrder: number;
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

type SelectItem = {
  name: string;
  addressInfos: any[];
  premium: boolean;
  registrationReleasedNewApp: boolean;
};

const getScreenSize = () => {
  const { width } = Dimensions.get('window');
  return width >= 1024 ? 'lg/xl' : 'sm/md';
};

const useScreenSize = () => {
  const [screenSize, setScreenSize] = useState(getScreenSize());

  useEffect(() => {
    const updateScreenSize = () => {
      setScreenSize(getScreenSize());
    };

    const subscription = Dimensions.addEventListener('change', updateScreenSize);

    return () => subscription.remove();
  }, []);

  return screenSize;
};

const sortSuppliers = (suppliers: SupplierData[]): SupplierData[] => {
  return suppliers.sort((a, b) => {
    // First, sort by missing items (ascending)
    const missingA = a.supplier.discount.product.length - a.supplier.missingItens;
    const missingB = b.supplier.discount.product.length - b.supplier.missingItens;
    if (missingA !== missingB) {
      return missingA - missingB;
    }

    // Second, sort by star rating (descending)
    if (a.supplier.star !== b.supplier.star) {
      const starA = getStarValue(a.supplier.star);
      const starB = getStarValue(b.supplier.star);
      return starB - starA;
    }

    // Third, sort by order value (ascending)
    return a.supplier.discount.orderValueFinish - b.supplier.discount.orderValueFinish;
  });
};

function SupplierBox({
  supplier,
  available,
  goToConfirm,
  selectedRestaurant,
}: {
  supplier: SupplierData;
  star: string;
  available: boolean;
  selectedRestaurant: any;
  goToConfirm: (supplier: SupplierData, selectedRestaurant: any) => void;
}) {
  const isOpen = () => {
    const currentDate = DateTime.now().setZone('America/Sao_Paulo');
    const currentHour = Number(
      `${currentDate.hour.toString().length < 2 ? `0${currentDate.hour}` : currentDate.hour}${currentDate.minute.toString().length < 2 ? `0${currentDate.minute}` : currentDate.minute}${currentDate.second.toString().length < 2 ? `0${currentDate.second}` : currentDate.second}`,
    );
    return (
      Number(supplier.supplier.hour.replaceAll(':', '')) < currentHour &&
      supplier.supplier.missingItens > 0
    );
  };

  return (
    <View
      opacity={available && supplier.supplier.missingItens > 0 ? 1 : 0.4}
      onPress={() => {
        if (available && supplier.supplier.missingItens > 0) {
          goToConfirm(supplier, selectedRestaurant);
        }
      }}
      flexDirection="row"
      borderBottomWidth={0.1}
      borderBottomColor="lightgray"
    >
      <View
        style={{ paddingLeft: Platform.OS === 'web' ? '20vw' : '' }}
        marginVertical={10}
        flexDirection="row"
        flex={1}
      >
        <View padding={5}>
          <Image
            source={{
              uri: `https://cdn.conectarhortifruti.com.br/files/images/supplier/${supplier.supplier.externalId}.jpg`,
            }}
            width={50}
            height={50}
            borderRadius={50}
          />
        </View>
        <View marginLeft={10} maxWidth="75%" justifyContent="center">
          <Text flexShrink={16}>{supplier.supplier.name.replace('Distribuidora', '')}</Text>
          <View flexDirection="row" alignItems="center">
            <Icons color="orange" name="star" />
            <Text paddingLeft={4}>{supplier.supplier.star}</Text>
          </View>
        </View>
      </View>
      <View style={{ paddingRight: Platform.OS === 'web' ? '10vw' : '' }} justifyContent="center">
        <View>
          <Text textAlign="right" fontSize={16} fontWeight="800">
            R$ {supplier.supplier.discount.orderValueFinish.toFixed(2).replace('.', ',')}
          </Text>
          {available ? (
            <Text
              color={
                supplier.supplier.discount.product.length - supplier.supplier.missingItens > 0
                  ? 'red'
                  : 'black'
              }
              fontSize={12}
            >
              {supplier.supplier.discount.product.length - supplier.supplier.missingItens} iten(s)
              faltante(s)
            </Text>
          ) : (
            <>
              <Text color="red" fontSize={12}>
                {supplier.supplier.discount.product.length - supplier.supplier.missingItens} iten(s)
                faltante(s)
              </Text>
              {isOpen() && !selectedRestaurant.allowClosedSupplier ? (
                <Text color="red" fontSize={12}>
                  Fechado às {supplier.supplier.hour.substring(0, 5)}
                </Text>
              ) : (
                <></>
              )}
              {supplier.supplier.minimumOrder > supplier.supplier.discount.orderValueFinish &&
              !selectedRestaurant.allowMinimumOrder ? (
                <Text color="red" fontSize={12}>
                  Mínimo R$
                  {supplier.supplier.minimumOrder.toFixed(2).replace('.', ',')}
                </Text>
              ) : (
                <></>
              )}
            </>
          )}
        </View>
      </View>
      <View
        paddingLeft={10}
        justifyContent="center"
        style={{ paddingRight: Platform.OS === 'web' ? '10vw' : undefined }}
      >
        {available && <Icons name="chevron-forward" size={24} />}
      </View>
    </View>
  );
}

export default function Prices() {
  const [loading, setLoading] = useState<boolean>(true);
  const [showRestInfo, setShowRestInfo] = useState<boolean>(false);
  const [minhours, setMinhours] = useState<string[]>([]);
  const [maxhours, setMaxhours] = useState<string[]>([]);
  const [minHour, setMinHour] = useState<string>('');
  const [maxHour, setMaxHour] = useState<string>('');
  const [editInfos, setEditInfos] = useState<boolean>(false);
  const [allRestaurants, setAllRestaurants] = useState<Restaurant[]>([]);
  const [city, setCity] = useState<string>();
  const [zipCode, setZipCode] = useState<string>();
  const [localType, setLocalType] = useState<string>();
  const [street, setStreet] = useState<string>();
  const [localNumber, setLocalNumber] = useState<string>('');
  const [neighborhood, setNeighborhood] = useState<string>();
  const [streetComplete, setStreetComplete] = useState<string>(''); // para exibir
  const [responsibleReceivingName, setResponsibleReceivingName] = useState<string>();
  const [responsibleReceivingPhoneNumber, setResponsibleReceivingPhoneNumber] = useState<string>();
  const [deliveryInformation, setDeliveryInformation] = useState<string>();
  const [complement, setComplement] = useState<string>();
  const [tab, setTab] = useState<string>('onlySupplier');
  const [finalCotacao, setFinalCotacao] = useState<boolean>(false);
  const [deliveryDateOpen, setDeliveryDateOpen] = useState(false);
  const [minHourOpen, setMinHourOpen] = useState(false);
  const [maxHourOpen, setMaxHourOpen] = useState(false);
  const [restOpen, setRestOpen] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const [isAlertVisible, setIsAlertVisible] = useState<boolean>(false);
  const [isConectarAlertVisible, setIsConectarAlertVisible] = useState(false);
  const [hasAccessedConectarPlus, setHasAccessedConectarPlus] = useState(false);
  const [missingFields, setMissingFields] = useState<string[]>([]);
  const [hasCheckedFields, setHasCheckedFields] = useState<boolean>(false);
  const [draftSelectedRestaurant, setDraftSelectedRestaurant] = useState<any>(null); // Escolha temporária do restaurante no dropdown.
  const [showBlockedModal, setShowBlockedModal] = useState(false);
  const screemSize = useScreenSize();
  const [combinations, setCombinations] = useState<Combination[]>([]);
  const [permissionConectarPlus, setPermissionConectarPlus] = useState<boolean>(false);
  const [cart, setCart] = useState<Map<string, TCart>>();
  const router = useRouter();
  const { suppliers, unavailableSupplier, loadingSuppliers, loadPrices } = useSupplier();
  const { restaurants, selectedRestaurant, handleRestaurantChange, loadRestaurants } =
    useRestaurantContext();
  const { modificado, setModificado } = useCombinacao();
  const [mainDataLoaded, setMainDataLoaded] = useState(false);
  const [sortedSuppliers, setSortedSuppliers] = useState<SupplierData[]>([]);
  const [sortedUnavailableSuppliers, setSortedUnavailableSuppliers] = useState<SupplierData[]>([]);
  const {
    deliveryDate,
    deliveryDates,
    initializeDeliveryDates,
    getFormattedDate,
    canChangeDeliveryDate,
    deliveryDatesDropdownOptions,
    setDropdownDeliveryDate,
  } = useDeliveryDate();

  useEffect(() => {
    if (!selectedRestaurant) return;

    initializeDeliveryDates(selectedRestaurant);
  }, []);

  useEffect(() => {
    const loadCombinations = async () => {
      if (!mainDataLoaded || tab !== 'plus') return;
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

  useFocusEffect(
    useCallback(() => {
      loadRestaurants();
    }, [loadRestaurants]),
  );

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

  useEffect(() => {
    if (minHour) {
      const [minHourValue, minMinuteValue] = minHour.split(':').map(Number);
      const [currentMaxHourValue, currentMaxMinuteValue] = maxHour
        ? maxHour.split(':').map(Number)
        : [0, 0];

      // Adiciona 1h30m à minHour
      let hour = minHourValue + 1;
      let minute = minMinuteValue + 30;
      if (minute >= 60) {
        minute -= 60;
        hour += 1;
      }

      // Verifica se o maxHour existente é menor que o novo tempo
      const newMaxInMinutes = hour * 60 + minute;
      const currentMaxInMinutes = currentMaxHourValue * 60 + currentMaxMinuteValue;

      if (currentMaxInMinutes < newMaxInMinutes) {
        // Atualiza maxHour se o valor atual for menor que o novo calculado
        const updatedMaxHour = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
        setMaxHour(updatedMaxHour);
      }

      // Gera as opções para maxHour
      const maxOptions = [];
      hour = minHourValue + 1; // Reinicializa o valor de hour para começar a partir do minHour + 1h30m
      minute = minMinuteValue + 30;
      if (minute >= 60) {
        minute -= 60;
        hour += 1;
      }

      while (hour < 24) {
        maxOptions.push(`${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`);
        minute += 30;
        if (minute >= 60) {
          minute -= 60;
          hour += 1;
        }
      }

      setMaxhours(maxOptions);
    } else {
      setMaxhours([]);
    }
  }, [minHour, maxHour]);

  // TODO verificar chamada
  const goToConfirm = async (supplier: SupplierData, selectedRestaurant: Restaurant) => {
    try {
      setLoading(true);
      await setStorage('supplierSelected', JSON.stringify(supplier));
      await setStorage('selectedRestaurant', JSON.stringify({ restaurant: selectedRestaurant }));
      router.push('/confirm');
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      const loadPricesAsync = async () => {
        try {
          setAllRestaurants(restaurants);

          if (!selectedRestaurant) return;
          // Verifica se o restaurante salvo ainda existe na lista
          const validRestaurant = restaurants.find(
            (r: any) => r.externalId === selectedRestaurant.externalId,
          );

          if (!validRestaurant) return;

          if (selectedRestaurant.registrationReleasedNewApp) {
            setShowBlockedModal(true);
          }

          if (selectedRestaurant.conectarPlusAuthorization) {
            const permissionResult = await loadPermissionConectarPlus(validRestaurant.externalId);
            setPermissionConectarPlus(permissionResult.authorized);
          }
          setTab(selectedRestaurant.conectarPlusAuthorization ? 'plus' : 'onlySupplier');
          setMinHour(selectedRestaurant.addressInfos[0]?.initialDeliveryTime.substring(11, 16));
          setMaxHour(selectedRestaurant.addressInfos[0]?.finalDeliveryTime.substring(11, 16));

          await loadPrices();
          const hours = [];
          for (let hour = 0; hour < 22; hour++) {
            hours.push(`${String(hour).padStart(2, '0')}:00`);
            hours.push(`${String(hour).padStart(2, '0')}:30`);
          }
          hours.push('22:00');
          setMinhours(hours);
        } catch (err) {
          console.error(err);
        } finally {
          setLoading(false);
          setMainDataLoaded(true);
        }
      };

      loadPricesAsync();
    }, [selectedRestaurant]),
  );

  useEffect(() => {
    let tempSuppliers: any[] = [];
    let tempUnavailableSuppliers: any[] = [];

    const filteredSuppliers = suppliers.filter(
      (item) => item.supplier.hour.substring(0, 5) !== '06:00',
    );

    const filteredUnavailableSuppliers = unavailableSupplier;

    tempSuppliers.push(...filteredSuppliers.map((item) => ({ ...item, available: true })));
    tempUnavailableSuppliers.push(
      ...filteredUnavailableSuppliers.map((item) => ({ ...item, available: false })),
    );

    const finalSortedSuppliers = sortSuppliers(tempSuppliers);
    const finalSortedUnavailableSuppliers = sortSuppliers(tempUnavailableSuppliers);

    setSortedSuppliers(finalSortedSuppliers);
    setSortedUnavailableSuppliers(finalSortedUnavailableSuppliers);
  }, [suppliers, unavailableSupplier]);

  useEffect(() => {
    if (selectedRestaurant) {
      const addressInfo = selectedRestaurant.addressInfos && selectedRestaurant.addressInfos[0];

      setTab(selectedRestaurant.premium ? 'plus' : 'onlySupplier');

      if (addressInfo) {
        setNeighborhood(addressInfo.neighborhood);
        setCity(addressInfo.city);
        setLocalType(addressInfo.localType);
        setLocalNumber(addressInfo.localNumber || '');
        setResponsibleReceivingName(addressInfo.responsibleReceivingName);
        setResponsibleReceivingPhoneNumber(addressInfo.responsibleReceivingPhoneNumber);
        setZipCode(addressInfo.zipCode.replace(/\D/g, '').replace(/(\d{5})(\d{3})/, '$1-$2'));
        setStreet(addressInfo.address);
        setComplement(addressInfo.complement);
        setDeliveryInformation(addressInfo.deliveryInformation);
        setMaxHour(addressInfo.finalDeliveryTime.substring(11, 16));
        setMinHour(addressInfo.initialDeliveryTime.substring(11, 16));
        setStreetComplete(`${addressInfo.localType ?? ''} ${addressInfo.address ?? ''}`.trim());
      } else {
        console.log('Address info not found for the selected restaurant');
      }

      setLoading(false);
    }
  }, [selectedRestaurant]);

  useEffect(() => {
    if (!draftSelectedRestaurant) return;
    const addressInfo = draftSelectedRestaurant.addressInfos[0];
    if (!addressInfo) return;

    setNeighborhood(addressInfo.neighborhood);
    setCity(addressInfo.city);
    setLocalType(addressInfo.localType);
    setLocalNumber(addressInfo.localNumber || '');
    setResponsibleReceivingName(addressInfo.responsibleReceivingName);
    setResponsibleReceivingPhoneNumber(addressInfo.responsibleReceivingPhoneNumber);
    setZipCode(addressInfo.zipCode?.replace(/\D/g, '')?.replace(/(\d{5})(\d{3})/, '$1-$2'));
    setStreet(addressInfo.address);
    setComplement(addressInfo.complement);
    setDeliveryInformation(addressInfo.deliveryInformation);
    setMinHour(addressInfo.initialDeliveryTime?.substring(11, 16));
    setMaxHour(addressInfo.finalDeliveryTime?.substring(11, 16));
    setStreetComplete(`${addressInfo.localType ?? ''} ${addressInfo.address ?? ''}`.trim());
  }, [draftSelectedRestaurant]);

  useEffect(() => {
    const handleConectarPlus = async () => {
      const stored = await getStorage('hasAccessedConectarPlus');
      const alreadyAccessed = stored === 'true';
      setHasAccessedConectarPlus(alreadyAccessed);

      if (selectedRestaurant?.conectarPlusAuthorization) {
        await setStorage('hasAccessedConectarPlus', 'true');
        setHasAccessedConectarPlus(true);
      }

      if (
        tab === 'plus' &&
        selectedRestaurant?.conectarPlusAuthorization === false &&
        alreadyAccessed
      ) {
        setIsConectarAlertVisible(true);
      }
    };

    handleConectarPlus();
  }, [selectedRestaurant, tab]);

  const getItem = (data: SupplierData[], index: number) => data[index];
  const getItemCount = (data: SupplierData[]) => data.length;
  const renderItem = ({ item }: { item: any }) => {
    return (
      <SupplierBox
        supplier={item}
        star={item.star}
        available={item.available}
        selectedRestaurant={selectedRestaurant}
        goToConfirm={goToConfirm}
      />
    );
  };

  const fields = [
    zipCode,
    localNumber,
    street,
    responsibleReceivingName,
    responsibleReceivingPhoneNumber,
    localType,
    city,
    neighborhood,
  ];

  useEffect(() => {
    const allFieldsLoaded = fields.every((field) => field !== undefined && field !== null);

    if (allFieldsLoaded && !hasCheckedFields) {
      const anyFieldEmpty = fields.some((field) => !field);
      setEditInfos(anyFieldEmpty);
      setHasCheckedFields(true);
    }
  }, [hasCheckedFields, ...fields]);

  const validateFields = () => {
    const fieldLabels: { [key: string]: string } = {
      zipCode: 'CEP',
      localNumber: 'Número',
      street: 'Rua',
      responsibleReceivingName: 'Nome do responsável',
      responsibleReceivingPhoneNumber: 'Telefone do responsável',
      localType: 'Logradouro',
      city: 'Cidade',
      neighborhood: 'Bairro',
    };

    const fields: Record<string, string | undefined> = {
      zipCode,
      localNumber,
      street,
      responsibleReceivingName,
      responsibleReceivingPhoneNumber,
      localType,
      city,
      neighborhood,
    };

    const requiredFields = Object.values(fields);
    const isValid = requiredFields.every((field) => field?.trim());

    if (!isValid) {
      const emptyFields = Object.keys(fields).filter((key) => !fields[key]?.trim());
      setMissingFields(emptyFields.map((key) => fieldLabels[key]));
      setIsAlertVisible(true);
    }

    return isValid;
  };

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

  if (loading || !selectedRestaurant) {
    return (
      <View flex={1} justifyContent="center" alignItems="center">
        <ActivityIndicator size="large" color="#04BF7B" />
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
              onPress={async () => {
                if (!selectedRestaurant?.premium || loading) return;
                try {
                  setLoading(true);
                  await loadPrices();
                  setTab('plus');
                } catch (err) {
                  console.error(err);
                } finally {
                  setLoading(false);
                }
              }}
              cursor="pointer"
              hoverStyle={{ opacity: 0.75 }}
              flex={1}
              alignItems="center"
              justifyContent="center"
            >
              <Text color={tab === 'plus' ? '#04BF7B' : 'gray'}>Conéctar+</Text>
              <View
                marginTop={10}
                height={1}
                width="100%"
                backgroundColor={tab === 'plus' ? '#04BF7B' : 'white'}
              />
            </View>
            <View
              onPress={async () => {
                if (loading) return;
                try {
                  setLoading(true);
                  await loadPrices();
                  setTab('onlySupplier');
                } catch (err) {
                  console.error(err);
                } finally {
                  setLoading(false);
                }
              }}
              cursor="pointer"
              hoverStyle={{ opacity: 0.75 }}
              flex={1}
              alignItems="center"
              justifyContent="center"
            >
              <Text color={tab === 'plus' ? 'gray' : '#04BF7B'}>Por fornecedor</Text>
              <View
                marginTop={10}
                height={1}
                width="100%"
                backgroundColor={tab === 'plus' ? 'white' : '#04BF7B'}
              />
            </View>
          </View>
          <View backgroundColor="white" flex={1} paddingHorizontal={5}>
            <View padding={10} paddingTop={0} height="100%">
              {tab === 'onlySupplier' && cart && cart.size > 0 && (
                <ScrollView flex={1} overflow="scroll" padding={3}>
                  <Text
                    style={{ paddingLeft: Platform.OS === 'web' ? '20.7vw' : '' }}
                    paddingBottom={5}
                    marginTop={10}
                    fontSize={16}
                    color={'gray'}
                  >
                    Fornecedores disponíveis
                  </Text>

                  <VirtualizedList
                    style={{ marginBottom: 5 }}
                    data={sortedSuppliers}
                    getItemCount={getItemCount}
                    getItem={getItem}
                    keyExtractor={(item, index) =>
                      item.supplier ? item.supplier.name : `separator-${index}`
                    }
                    renderItem={renderItem}
                    ItemSeparatorComponent={() => <View height={2} />}
                    initialNumToRender={sortedSuppliers.length}
                    /* windowSize={4} */
                    scrollEnabled={false}
                  />

                  {unavailableSupplier.length > 0 && (
                    <>
                      <Text
                        style={{ paddingLeft: Platform.OS === 'web' ? '20.7vw' : '' }}
                        paddingBottom={5}
                        marginTop={10}
                        fontSize={16}
                        color={'gray'}
                      >
                        Fornecedores indisponíveis
                      </Text>

                      <VirtualizedList
                        style={{ marginBottom: 5 }}
                        data={sortedUnavailableSuppliers}
                        getItemCount={getItemCount}
                        getItem={getItem}
                        keyExtractor={(item, index) =>
                          item.supplier ? item.supplier.name : `separator-${index}`
                        }
                        renderItem={renderItem}
                        ItemSeparatorComponent={() => <View height={2} />}
                        initialNumToRender={sortedUnavailableSuppliers.length}
                        /* windowSize={4} */
                        scrollEnabled={false}
                      />
                    </>
                  )}
                </ScrollView>
              )}

              {tab === 'onlySupplier' && !(cart && cart.size > 0) && (
                <Stack flex={1} alignItems="center" justifyContent="center">
                  <Text>Não há cotações disponíveis...</Text>
                  <Text>Tente adicionar algo ao carrinho!</Text>
                </Stack>
              )}

              {tab !== 'onlySupplier' && !permissionConectarPlus && (
                <View padding={20} marginTop={10}>
                  <DialogInstanceNotification
                    openModal={showNotification}
                    setOpenModal={setShowNotification}
                    title="Pronto!"
                    subtitle="Cotação solicitada."
                    description="Seu pedido foi enviado para o seu Whatsapp, retornaremos com sua cotação."
                    buttonText="Ok"
                    onConfirm={handleConfirm}
                  />

                  <Button
                    backgroundColor="#04BF7B"
                    onPress={async () => {
                      if (!validateFields()) return;
                      setLoading(true);

                      const result = await confirmPremiumOrder({
                        token: await getToken(),
                        selectedRestaurant,
                        deliveryDate: deliveryDate,
                      });

                      if (result.status === 201) {
                        setLoading(false);
                        setShowNotification(true);
                      } else {
                        setLoading(false);
                      }
                    }}
                  >
                    <Text fontWeight="500" fontSize={16} color="white">
                      Solicitar cotação
                    </Text>
                  </Button>
                  <Text marginTop={5} textAlign="center" fontSize={12} color="gray">
                    Você receberá a cotação no Whatsapp
                  </Text>
                </View>
              )}
              {tab !== 'onlySupplier' && permissionConectarPlus && mainDataLoaded && (
                <CombinationList />
              )}
            </View>
          </View>
          {tab !== 'onlySupplier' && permissionConectarPlus && (
            <CustomButton
              title="Minhas combinações"
              onPress={async () => {
                router.push('/preferencesScreen');
              }}
            ></CustomButton>
          )}
          <View
            onPress={async () => {
              const addressInfos = selectedRestaurant?.addressInfos[0];

              setNeighborhood(addressInfos.neighborhood);
              setCity(addressInfos.city);
              setLocalType(addressInfos.localType);
              setLocalNumber(addressInfos.localNumber);
              setResponsibleReceivingName(addressInfos.responsibleReceivingName);
              setResponsibleReceivingPhoneNumber(addressInfos.responsibleReceivingPhoneNumber);
              setZipCode(
                addressInfos.zipCode.replace(/\D/g, '').replace(/(\d{5})(\d{3})/, '$1-$2'),
              );
              setStreet(addressInfos.address);
              setComplement(addressInfos.complement);
              setDeliveryInformation(addressInfos.deliveryInformation);
              setEditInfos(true);
            }}
            backgroundColor="white"
            paddingBottom={10}
            paddingTop={10}
            width={Platform.OS === 'web' ? '70%' : '92%'}
            alignSelf="center"
            borderTopColor="lightgray"
            borderTopWidth={1}
          >
            <View flexDirection="row" alignItems="center">
              <View
                padding={10}
                marginRight={10}
                flexDirection="row"
                flex={1}
                borderColor="lightgray"
                borderRadius={5}
                borderWidth={1}
                paddingHorizontal={10}
                backgroundColor="white"
                alignItems="center"
                overflow="hidden"
              >
                <Icons size={20} color="#04BF7B" name="storefront" />
                <View marginLeft={20} />
                <Text
                  numberOfLines={showRestInfo ? 1 : 1}
                  ellipsizeMode="tail"
                  fontSize={12}
                  style={{ flexShrink: 1, width: '100%' }}
                >
                  {selectedRestaurant?.name || ''}
                </Text>
              </View>
              <View
                padding={10}
                marginRight={10}
                flexDirection="row"
                flex={1}
                borderColor="lightgray"
                borderRadius={5}
                borderWidth={1}
                paddingHorizontal={10}
                backgroundColor="white"
                alignItems="center"
                overflow="hidden"
              >
                <Icons size={20} color="#04BF7B" name="calendar" />
                <View marginLeft={20} />
                <Text fontSize={12}>{getFormattedDate()}</Text>
              </View>
              <View
                padding={10}
                marginRight={10}
                flexDirection="row"
                flex={1}
                borderColor="lightgray"
                borderRadius={5}
                borderWidth={1}
                paddingHorizontal={10}
                backgroundColor="white"
                alignItems="center"
                overflow="hidden"
              >
                <Icons size={20} color="#04BF7B" name="time" />
                <View marginLeft={20} />
                <Text fontSize={12}>
                  {selectedRestaurant?.addressInfos[0].initialDeliveryTime.substring(11, 16)} -{' '}
                  {selectedRestaurant?.addressInfos[0].finalDeliveryTime.substring(11, 16)}
                </Text>
              </View>
              <Icons
                size={20}
                onPress={async () => {
                  setShowRestInfo(!showRestInfo);
                }}
                name={showRestInfo ? 'chevron-up' : 'chevron-down'}
              />
            </View>
            <View display={showRestInfo ? 'flex' : 'none'}>
              <View paddingTop={5} flexDirection="row" alignItems="center">
                <View
                  padding={10}
                  marginRight={10}
                  flexDirection="row"
                  flex={1}
                  borderColor="lightgray"
                  borderRadius={5}
                  borderWidth={1}
                  paddingHorizontal={10}
                  backgroundColor="white"
                  alignItems="center"
                  overflow="hidden"
                >
                  <Icons size={20} color="#04BF7B" name="location"></Icons>
                  <View marginLeft={20}></View>
                  <Text
                    numberOfLines={1}
                    textOverflow="ellipsis"
                    ellipsizeMode="tail"
                    fontSize={12}
                  >
                    {selectedRestaurant?.addressInfos[0].localType}{' '}
                    {selectedRestaurant?.addressInfos[0].address},{' '}
                    {selectedRestaurant?.addressInfos[0].localNumber}.{' '}
                    {selectedRestaurant?.addressInfos[0].complement} -{' '}
                    {selectedRestaurant?.addressInfos[0].neighborhood},{' '}
                    {selectedRestaurant?.addressInfos[0].city}
                  </Text>
                </View>
                <View
                  padding={10}
                  marginRight={10}
                  flexDirection="row"
                  flex={2}
                  borderColor="lightgray"
                  borderRadius={5}
                  borderWidth={1}
                  paddingHorizontal={10}
                  backgroundColor="white"
                  alignItems="center"
                  overflow="hidden"
                >
                  <Icons size={20} color="#04BF7B" name="chatbox"></Icons>
                  <View marginLeft={20}></View>
                  <Text fontSize={12}>
                    {selectedRestaurant?.addressInfos[0].deliveryInformation}
                  </Text>
                </View>
              </View>
              <View paddingTop={5} flexDirection="row" alignItems="center">
                <View
                  padding={10}
                  marginRight={10}
                  flexDirection="row"
                  flex={1}
                  borderColor="lightgray"
                  borderRadius={5}
                  borderWidth={1}
                  paddingHorizontal={10}
                  backgroundColor="white"
                  alignItems="center"
                  overflow="hidden"
                >
                  <Icons size={20} color="#04BF7B" name="person" />
                  <View marginLeft={20} />
                  <Text fontSize={12}>
                    {selectedRestaurant?.addressInfos[0].responsibleReceivingName}
                  </Text>
                </View>
                <View
                  padding={10}
                  marginRight={10}
                  flexDirection="row"
                  flex={1}
                  borderColor="lightgray"
                  borderRadius={5}
                  borderWidth={1}
                  paddingHorizontal={10}
                  backgroundColor="white"
                  alignItems="center"
                  overflow="hidden"
                >
                  <Icons size={20} color="#04BF7B" name="call" />
                  <View marginLeft={20} />
                  <Text fontSize={12}>
                    {selectedRestaurant?.addressInfos[0].responsibleReceivingPhoneNumber}
                  </Text>
                </View>
              </View>
            </View>
          </View>
          {editInfos && (
            <View flex={1} justifyContent="center" alignItems="center" backgroundColor="white">
              <Modal transparent={true}>
                <ScrollView
                  contentContainerStyle={{
                    flex: 1,
                    justifyContent: 'center',
                    padding: 20,
                  }}
                  keyboardShouldPersistTaps="handled"
                >
                  <View
                    flex={1}
                    justifyContent="center"
                    alignItems="center"
                    backgroundColor="rgba(0, 0, 0, 0.9)"
                  >
                    <View
                      paddingBottom={15}
                      paddingHorizontal={15}
                      paddingTop={40}
                      minWidth={Platform.OS === 'web' ? '40%' : '100%'}
                      backgroundColor="white"
                      borderRadius={Platform.OS === 'web' ? 10 : 0}
                      justifyContent="center"
                      zIndex={101}
                    >
                      {screemSize === 'lg/xl' ? (
                        <>
                          <Text paddingLeft={5} fontSize={12} color="gray">
                            Restaurante
                          </Text>
                          {allRestaurants.length > 0 ? (
                            <DropDownPicker
                              listMode="SCROLLVIEW"
                              value={
                                draftSelectedRestaurant
                                  ? draftSelectedRestaurant.name
                                  : selectedRestaurant?.name
                              }
                              style={{
                                borderWidth: 1,
                                borderColor: 'lightgray',
                                borderRadius: 5,
                                flex: 1,
                                marginBottom: Platform.OS === 'web' ? 0 : 35,
                              }}
                              setValue={() => {}}
                              items={allRestaurants.map((item) => ({
                                label: item?.name,
                                value: item?.name,
                              }))}
                              multiple={false}
                              open={restOpen}
                              setOpen={setRestOpen}
                              placeholder=""
                              onSelectItem={(value) => {
                                const rest = allRestaurants.find(
                                  (item) => item?.name === value.value,
                                );
                                if (rest) {
                                  if (rest.registrationReleasedNewApp === true) {
                                    setShowBlockedModal(true);
                                    return;
                                  }
                                  setDraftSelectedRestaurant(rest);
                                }
                              }}
                            ></DropDownPicker>
                          ) : (
                            <Text>Loading...</Text>
                          )}
                          <View
                            paddingTop={10}
                            gap={10}
                            marginBottom={Platform.OS === 'web' ? 0 : 35}
                            justifyContent="space-between"
                            flexDirection="row"
                            zIndex={100}
                          >
                            <View flex={1}>
                              <Text paddingLeft={5} fontSize={12} color="gray">
                                Data de entrega
                              </Text>
                              <DropDownPicker
                                value={deliveryDate}
                                zIndex={2}
                                disabled={!canChangeDeliveryDate}
                                style={{
                                  borderWidth: 1,
                                  borderColor: 'lightgray',
                                  borderRadius: 5,
                                  flex: 1,
                                }}
                                textStyle={{ color: canChangeDeliveryDate ? 'black' : 'gray' }}
                                setValue={setDropdownDeliveryDate}
                                items={deliveryDatesDropdownOptions}
                                multiple={false}
                                open={deliveryDateOpen}
                                setOpen={setDeliveryDateOpen}
                                placeholder=""
                                listMode="SCROLLVIEW"
                                showArrowIcon={canChangeDeliveryDate}
                              ></DropDownPicker>
                            </View>
                            <View flex={1}>
                              <Text paddingLeft={5} fontSize={12} color="gray">
                                A partir de
                              </Text>
                              <DropDownPicker
                                value={minHour}
                                zIndex={2}
                                style={{
                                  borderWidth: 1,
                                  borderColor: 'lightgray',
                                  borderRadius: 5,
                                  flex: 1,
                                }}
                                setValue={setMinHour}
                                items={minhours.map((item) => {
                                  return { label: item, value: item };
                                })}
                                multiple={false}
                                open={minHourOpen}
                                setOpen={setMinHourOpen}
                                placeholder=""
                                listMode="SCROLLVIEW"
                              ></DropDownPicker>
                            </View>
                            <View flex={1} zIndex={100}>
                              <Text paddingLeft={5} fontSize={12} color="gray">
                                Até
                              </Text>
                              <DropDownPicker
                                value={maxHour}
                                listMode="SCROLLVIEW"
                                style={{
                                  borderWidth: 1,
                                  borderColor: 'lightgray',
                                  borderRadius: 5,
                                  flex: 1,
                                }}
                                setValue={setMaxHour}
                                items={maxhours.map((item) => {
                                  return { label: item, value: item };
                                })}
                                multiple={false}
                                open={maxHourOpen}
                                setOpen={setMaxHourOpen}
                                placeholder=""
                              ></DropDownPicker>
                            </View>
                          </View>

                          <KeyboardAvoidingView>
                            <View
                              style={{
                                flexDirection: 'row',
                                gap: 10,
                                marginBottom: 5,
                              }}
                            >
                              <View width={150}>
                                <Text
                                  style={{
                                    paddingTop: 10,
                                    paddingLeft: 5,
                                    fontSize: 12,
                                    color: 'gray',
                                  }}
                                >
                                  Cep <Text color="red"> *</Text>
                                </Text>
                                <Input
                                  maxLength={9}
                                  backgroundColor="white"
                                  borderColor="lightgray"
                                  borderRadius={5}
                                  focusStyle={{
                                    borderColor: '#049A63',
                                    borderWidth: 1,
                                  }}
                                  hoverStyle={{
                                    borderColor: '#049A63',
                                    borderWidth: 1,
                                  }}
                                  onChangeText={async (value) => {
                                    const cleaned = value.replace(/\D/g, '');
                                    const formatted = cleaned.replace(/(\d{5})(\d{3})/, '$1-$2');

                                    if (formatted.length === 9) {
                                      setLoading(true);
                                      const response = await fetch(
                                        `https://viacep.com.br/ws/${cleaned}/json/`,
                                      );
                                      const result = await response.json();
                                      if (response.ok && !result.erro) {
                                        const rawStreet = campoString(result.logradouro);
                                        const [streetType, ...streetNameParts] = rawStreet
                                          .trim()
                                          .split(' ');

                                        setCity(campoString(result.localidade));
                                        setNeighborhood(campoString(result.bairro));
                                        setLocalType(streetType?.toUpperCase() || '');
                                        setStreet(streetNameParts.join(' '));
                                        setStreetComplete(rawStreet);
                                        setLocalNumber('');
                                      }
                                      setLoading(false);
                                    }

                                    setZipCode(formatted);
                                  }}
                                  value={zipCode}
                                />
                              </View>
                              <View zIndex={-1} flex={1} marginTop={10}>
                                <KeyboardAvoidingView>
                                  <Text paddingLeft={5} fontSize={12} color="gray">
                                    Cidade <Text color="red"> *</Text>
                                  </Text>
                                  <Input
                                    color="gray"
                                    fontSize={12}
                                    disabled
                                    flex={1}
                                    backgroundColor="white"
                                    borderColor="lightgray"
                                    borderRadius={5}
                                    value={city}
                                    focusStyle={{
                                      borderColor: '#049A63',
                                      borderWidth: 1,
                                    }}
                                    hoverStyle={{
                                      borderColor: '#049A63',
                                      borderWidth: 1,
                                    }}
                                  />
                                </KeyboardAvoidingView>
                              </View>
                            </View>
                          </KeyboardAvoidingView>

                          <View flex={1}>
                            <KeyboardAvoidingView>
                              <Text paddingLeft={5} fontSize={12} color="gray">
                                Bairro <Text color="red"> *</Text>
                              </Text>
                              <Input
                                color="gray"
                                fontSize={12}
                                disabled
                                backgroundColor="white"
                                borderColor="lightgray"
                                borderRadius={5}
                                value={neighborhood}
                                focusStyle={{
                                  borderColor: '#049A63',
                                  borderWidth: 1,
                                }}
                                hoverStyle={{
                                  borderColor: '#049A63',
                                  borderWidth: 1,
                                }}
                              />
                            </KeyboardAvoidingView>
                          </View>
                          <View flexDirection="row" marginTop={10}>
                            <View flex={1}>
                              <Text
                                style={{
                                  paddingLeft: 5,
                                  fontSize: 12,
                                  color: 'gray',
                                }}
                              >
                                Rua <Text color="red"> *</Text>
                              </Text>
                              <KeyboardAvoidingView>
                                <Input
                                  onChangeText={(value) => {
                                    const formattedValue = value.replace(/[^A-Za-z\s]/g, ''); // mantém só letras e espaço
                                    const parts = formattedValue.trim().split(' ');
                                    const localType = parts[0]?.toUpperCase() || '';
                                    const streetName = parts.slice(1).join(' ');
                                    setLocalType(localType);
                                    setStreet(streetName);
                                    setStreetComplete(formattedValue); // usado para exibir no campo
                                  }}
                                  backgroundColor="white"
                                  borderColor="lightgray"
                                  borderRadius={5}
                                  borderTopLeftRadius={0}
                                  borderBottomLeftRadius={0}
                                  value={streetComplete}
                                  focusStyle={{
                                    borderColor: '#049A63',
                                    borderWidth: 1,
                                  }}
                                  hoverStyle={{
                                    borderColor: '#049A63',
                                    borderWidth: 1,
                                  }}
                                />
                              </KeyboardAvoidingView>
                            </View>
                          </View>
                          <View
                            zIndex={-1}
                            height={70}
                            marginBottom={5}
                            paddingTop={10}
                            gap={10}
                            justifyContent="space-between"
                            style={{
                              flexDirection: Platform.OS === 'web' ? 'row' : 'column',
                            }}
                          >
                            <View flex={1}>
                              <KeyboardAvoidingView style={{ flex: 1 }}>
                                <Text paddingLeft={5} fontSize={12} color="gray">
                                  Nº <Text color="red"> *</Text>
                                </Text>
                                <Input
                                  height={43}
                                  fontSize={14}
                                  flex={1}
                                  backgroundColor="white"
                                  borderColor="lightgray"
                                  borderRadius={5}
                                  value={localNumber}
                                  keyboardType="numeric"
                                  onChangeText={(value) => {
                                    const formattedValue = value.replace(/[^0-9]/g, '');
                                    setLocalNumber(formattedValue);
                                  }}
                                  focusStyle={{
                                    borderColor: '#049A63',
                                    borderWidth: 1,
                                  }}
                                  hoverStyle={{
                                    borderColor: '#049A63',
                                    borderWidth: 1,
                                  }}
                                />
                              </KeyboardAvoidingView>
                            </View>

                            <View flex={1}>
                              <KeyboardAvoidingView style={{ flex: 1 }}>
                                <Text paddingLeft={5} fontSize={12} color="gray">
                                  Complemento
                                </Text>
                                <Input
                                  fontSize={14}
                                  flex={1}
                                  backgroundColor="white"
                                  borderColor="lightgray"
                                  borderRadius={5}
                                  value={complement}
                                  onChangeText={(value) => {
                                    setComplement(value);
                                  }}
                                  focusStyle={{
                                    borderColor: '#049A63',
                                    borderWidth: 1,
                                  }}
                                  hoverStyle={{
                                    borderColor: '#049A63',
                                    borderWidth: 1,
                                  }}
                                />
                              </KeyboardAvoidingView>
                            </View>
                          </View>
                          <View
                            zIndex={-1}
                            height={70}
                            paddingTop={10}
                            gap={10}
                            justifyContent="space-between"
                            flexDirection="row"
                          >
                            <View flex={1}>
                              <Text fontSize={12} color="gray">
                                Resp. recebimento <Text color="red"> *</Text>
                              </Text>
                              <KeyboardAvoidingView style={{ flex: 1 }}>
                                <Input
                                  fontSize={14}
                                  flex={1}
                                  backgroundColor="white"
                                  borderColor="lightgray"
                                  borderRadius={5}
                                  value={responsibleReceivingName}
                                  onChangeText={(value) => {
                                    const formattedValue = value.replace(/[^A-Za-z\s]/g, '');
                                    setResponsibleReceivingName(formattedValue);
                                  }}
                                  focusStyle={{
                                    borderColor: '#049A63',
                                    borderWidth: 1,
                                  }}
                                  hoverStyle={{
                                    borderColor: '#049A63',
                                    borderWidth: 1,
                                  }}
                                />
                              </KeyboardAvoidingView>
                            </View>
                            <View flex={1}>
                              <Text fontSize={12} color="gray">
                                Cel Resp. recebimento <Text color="red"> *</Text>
                              </Text>
                              <KeyboardAvoidingView style={{ flex: 1 }}>
                                <Input
                                  maxLength={15}
                                  fontSize={14}
                                  flex={1}
                                  backgroundColor="white"
                                  borderColor="lightgray"
                                  borderRadius={5}
                                  value={responsibleReceivingPhoneNumber}
                                  keyboardType="phone-pad"
                                  focusStyle={{
                                    borderColor: '#049A63',
                                    borderWidth: 1,
                                  }}
                                  hoverStyle={{
                                    borderColor: '#049A63',
                                    borderWidth: 1,
                                  }}
                                  onChangeText={(value) => {
                                    let onlyNums = value.replace(/\D/g, '');

                                    if (onlyNums.length > 10) {
                                      onlyNums = onlyNums.replace(
                                        /(\d{2})(\d{5})(\d{0,4})/,
                                        '($1) $2-$3',
                                      );
                                    } else if (onlyNums.length > 6) {
                                      onlyNums = onlyNums.replace(
                                        /(\d{2})(\d{4})(\d{0,4})/,
                                        '($1) $2-$3',
                                      );
                                    } else if (onlyNums.length > 2) {
                                      onlyNums = onlyNums.replace(/(\d{2})(\d{0,4})/, '($1) $2');
                                    } else if (onlyNums.length > 0) {
                                      onlyNums = onlyNums.replace(/(\d{0,2})/, '($1');
                                    }

                                    setResponsibleReceivingPhoneNumber(onlyNums);
                                  }}
                                />
                              </KeyboardAvoidingView>
                            </View>
                          </View>
                          <View
                            height={70}
                            paddingTop={10}
                            gap={5}
                            justifyContent="space-between"
                            flexDirection="row"
                          >
                            <View flex={1}>
                              <KeyboardAvoidingView style={{ flex: 1 }}>
                                <Text paddingLeft={5} fontSize={12} color="gray">
                                  Info de entrega
                                </Text>
                                <Input
                                  fontSize={14}
                                  flex={1}
                                  backgroundColor="white"
                                  borderColor="lightgray"
                                  borderRadius={5}
                                  value={deliveryInformation}
                                  onChangeText={(value) => {
                                    setDeliveryInformation(value);
                                  }}
                                  focusStyle={{
                                    borderColor: '#049A63',
                                    borderWidth: 1,
                                  }}
                                  hoverStyle={{
                                    borderColor: '#049A63',
                                    borderWidth: 1,
                                  }}
                                />
                              </KeyboardAvoidingView>
                            </View>
                          </View>
                        </>
                      ) : (
                        <>
                          <KeyboardAvoidingView style={{ flex: 1 }}>
                            <ScrollView keyboardShouldPersistTaps="handled">
                              <Text paddingLeft={5} fontSize={12} color="gray">
                                Restaurante
                              </Text>
                              {allRestaurants.length > 0 ? (
                                <DropDownPicker
                                  listMode="SCROLLVIEW"
                                  value={draftSelectedRestaurant?.name ?? selectedRestaurant?.name}
                                  style={{
                                    borderWidth: 1,
                                    borderColor: 'lightgray',
                                    borderRadius: 5,
                                    flex: 1,
                                    marginBottom: Platform.OS === 'web' ? 0 : 5,
                                  }}
                                  zIndex={5000}
                                  zIndexInverse={5000}
                                  setValue={() => {}}
                                  items={allRestaurants.map((item) => ({
                                    label: item?.name,
                                    value: item?.name,
                                  }))}
                                  multiple={false}
                                  open={restOpen}
                                  setOpen={setRestOpen}
                                  placeholder=""
                                  onSelectItem={(value) => {
                                    const rest = allRestaurants.find(
                                      (item) => item?.name === value.value,
                                    );
                                    if (rest) {
                                      if (rest.registrationReleasedNewApp === true) {
                                        setShowBlockedModal(true);
                                        return;
                                      }
                                      setDraftSelectedRestaurant(rest);
                                    }
                                  }}
                                ></DropDownPicker>
                              ) : (
                                <Text>Loading...</Text>
                              )}
                              <View
                                style={{
                                  paddingTop: 5,
                                  flexDirection: 'row',
                                  justifyContent: 'space-between',
                                }}
                              >
                                <View
                                  style={{
                                    flex: 1,
                                    marginRight: 5,
                                  }}
                                >
                                  <Text paddingLeft={5} fontSize={12} color="gray">
                                    Data de entrega
                                  </Text>
                                  <DropDownPicker
                                    value={deliveryDate}
                                    zIndex={2}
                                    disabled={!canChangeDeliveryDate}
                                    style={{
                                      borderWidth: 1,
                                      borderColor: 'lightgray',
                                      borderRadius: 5,
                                      flex: 1,
                                    }}
                                    textStyle={{ color: canChangeDeliveryDate ? 'black' : 'gray' }}
                                    setValue={setDropdownDeliveryDate}
                                    items={deliveryDatesDropdownOptions}
                                    multiple={false}
                                    open={deliveryDateOpen}
                                    setOpen={setDeliveryDateOpen}
                                    placeholder=""
                                    listMode="SCROLLVIEW"
                                    showArrowIcon={canChangeDeliveryDate}
                                  ></DropDownPicker>
                                </View>
                                <View
                                  style={{
                                    flex: 1,
                                    marginRight: 5,
                                  }}
                                >
                                  <Text
                                    style={{
                                      paddingLeft: 5,
                                      fontSize: 12,
                                      color: 'gray',
                                    }}
                                  >
                                    A partir de
                                  </Text>
                                  <DropDownPicker
                                    value={minHour}
                                    setValue={setMinHour}
                                    items={minhours.map((item) => ({
                                      label: item,
                                      value: item,
                                    }))}
                                    multiple={false}
                                    open={minHourOpen}
                                    setOpen={setMinHourOpen}
                                    onOpen={() => setMaxHourOpen(false)}
                                    listMode={Platform.OS === 'ios' ? 'MODAL' : 'SCROLLVIEW'}
                                    modalProps={{
                                      animationType: 'slide',
                                      transparent: false,
                                      presentationStyle: 'formSheet',
                                    }}
                                    modalContentContainerStyle={{
                                      backgroundColor: '#fff',
                                      padding: 20,
                                      borderRadius: 10,
                                      margin: 40,
                                    }}
                                    style={{
                                      borderWidth: 1,
                                      borderColor: 'lightgray',
                                      borderRadius: 5,
                                    }}
                                    zIndex={4000}
                                    zIndexInverse={4000}
                                  />
                                </View>

                                <View style={{ flex: 1, marginLeft: 5 }}>
                                  <Text
                                    style={{
                                      paddingLeft: 5,
                                      fontSize: 12,
                                      color: 'gray',
                                    }}
                                  >
                                    Até
                                  </Text>
                                  <DropDownPicker
                                    value={maxHour}
                                    setValue={setMaxHour}
                                    items={maxhours.map((item) => ({
                                      label: item,
                                      value: item,
                                    }))}
                                    multiple={false}
                                    open={maxHourOpen}
                                    setOpen={setMaxHourOpen}
                                    onOpen={() => setMinHourOpen(false)}
                                    placeholder=""
                                    listMode={Platform.OS === 'ios' ? 'MODAL' : 'SCROLLVIEW'}
                                    modalProps={{
                                      animationType: 'slide',
                                      transparent: false,
                                      presentationStyle: 'formSheet',
                                    }}
                                    modalContentContainerStyle={{
                                      backgroundColor: '#fff',
                                      padding: 20,
                                      borderRadius: 10,
                                      margin: 40,
                                    }}
                                    style={{
                                      borderWidth: 1,
                                      borderColor: 'lightgray',
                                      borderRadius: 5,
                                    }}
                                    zIndex={4000}
                                    zIndexInverse={4000}
                                  />
                                </View>
                              </View>

                              <View
                                style={{
                                  flexDirection: 'row',
                                  flexWrap: 'wrap',
                                }}
                                gap={10}
                              >
                                <View width={150}>
                                  <Text
                                    style={{
                                      paddingTop: 10,
                                      paddingLeft: 5,
                                      fontSize: 12,
                                      color: 'gray',
                                    }}
                                  >
                                    Cep <Text color="red"> *</Text>
                                  </Text>
                                  <Input
                                    maxLength={9}
                                    backgroundColor="white"
                                    borderColor="lightgray"
                                    borderRadius={5}
                                    focusStyle={{
                                      borderColor: '#049A63',
                                      borderWidth: 1,
                                    }}
                                    hoverStyle={{
                                      borderColor: '#049A63',
                                      borderWidth: 1,
                                    }}
                                    onChangeText={async (value) => {
                                      const cleaned = value.replace(/\D/g, '');
                                      const formatted = cleaned.replace(/(\d{5})(\d{3})/, '$1-$2');

                                      if (formatted.length === 9) {
                                        setLoading(true);
                                        const response = await fetch(
                                          `https://viacep.com.br/ws/${cleaned}/json/`,
                                        );
                                        const result = await response.json();
                                        if (response.ok && !result.erro) {
                                          const rawStreet = campoString(result.logradouro);
                                          const [streetType, ...streetNameParts] = rawStreet
                                            .trim()
                                            .split(' ');

                                          setCity(campoString(result.localidade));
                                          setNeighborhood(campoString(result.bairro));
                                          setLocalType(streetType?.toUpperCase() || '');
                                          setStreet(streetNameParts.join(' '));
                                          setStreetComplete(rawStreet);
                                          setLocalNumber('');
                                        }
                                        setLoading(false);
                                      }

                                      setZipCode(formatted);
                                    }}
                                    value={zipCode}
                                  />
                                </View>

                                <View style={{ flex: 1 }}>
                                  <Text paddingTop={10} paddingLeft={5} fontSize={12} color="gray">
                                    Cidade <Text color="red"> *</Text>
                                  </Text>
                                  <Input
                                    marginBottom={10}
                                    marginRight={1}
                                    color="gray"
                                    flex={1}
                                    disabled
                                    backgroundColor="white"
                                    borderColor="lightgray"
                                    borderWidth={1}
                                    borderRadius={5}
                                    value={city}
                                    focusStyle={{
                                      borderColor: '#049A63',
                                    }}
                                    hoverStyle={{
                                      borderColor: '#049A63',
                                    }}
                                  />
                                </View>
                              </View>

                              <View>
                                <Text paddingLeft={5} fontSize={12} color="gray">
                                  Bairro <Text color="red"> *</Text>
                                </Text>
                                <Input
                                  marginBottom={10}
                                  marginRight={1}
                                  color="gray"
                                  disabled
                                  backgroundColor="white"
                                  borderColor="lightgray"
                                  borderRadius={5}
                                  value={neighborhood}
                                  focusStyle={{
                                    borderColor: '#049A63',
                                    borderWidth: 1,
                                  }}
                                  hoverStyle={{
                                    borderColor: '#049A63',
                                    borderWidth: 1,
                                  }}
                                />
                              </View>
                              <View
                                style={{
                                  flexDirection: 'row',
                                  flexWrap: 'wrap',
                                  gap: 10,
                                  marginBottom: 5,
                                }}
                              >
                                <View flex={1}>
                                  <Text
                                    style={{
                                      paddingLeft: 5,
                                      fontSize: 12,
                                      color: 'gray',
                                    }}
                                  >
                                    Rua <Text color="red"> *</Text>
                                  </Text>
                                  <KeyboardAvoidingView>
                                    <Input
                                      onChangeText={(value) => {
                                        const formattedValue = value.replace(/[^A-Za-z\s]/g, ''); // mantém só letras e espaço
                                        const parts = formattedValue.trim().split(' ');
                                        const localType = parts[0]?.toUpperCase() || '';
                                        const streetName = parts.slice(1).join(' ');
                                        setLocalType(localType);
                                        setStreet(streetName);
                                        setStreetComplete(formattedValue); // usado para exibir no campo
                                      }}
                                      backgroundColor="white"
                                      marginRight={1}
                                      borderColor="lightgray"
                                      borderRadius={5}
                                      value={streetComplete}
                                      focusStyle={{
                                        borderColor: '#049A63',
                                        borderWidth: 1,
                                      }}
                                      hoverStyle={{
                                        borderColor: '#049A63',
                                        borderWidth: 1,
                                      }}
                                    />
                                  </KeyboardAvoidingView>
                                </View>
                              </View>

                              <View
                                zIndex={-1}
                                height={70}
                                paddingTop={10}
                                gap={10}
                                justifyContent="space-between"
                                flexDirection="row"
                              >
                                <View flex={1} position="relative">
                                  <Text paddingLeft={5} fontSize={12} color="gray">
                                    Nº <Text color="red"> *</Text>
                                  </Text>
                                  <Input
                                    fontSize={14}
                                    flex={1}
                                    backgroundColor="white"
                                    borderColor="lightgray"
                                    borderRadius={5}
                                    value={localNumber}
                                    keyboardType="numeric"
                                    onChangeText={(value) => {
                                      const formattedValue = value.replace(/[^0-9]/g, '');
                                      setLocalNumber(formattedValue);
                                    }}
                                    focusStyle={{
                                      borderColor: '#049A63',
                                      borderWidth: 1,
                                    }}
                                    hoverStyle={{
                                      borderColor: '#049A63',
                                      borderWidth: 1,
                                    }}
                                  />
                                </View>

                                <View flex={1} position="relative">
                                  <Text paddingLeft={5} fontSize={12} color="gray">
                                    Complemento
                                  </Text>
                                  <Input
                                    fontSize={14}
                                    flex={1}
                                    backgroundColor="white"
                                    borderColor="lightgray"
                                    borderRadius={5}
                                    value={complement}
                                    onChangeText={(value) => {
                                      setComplement(value);
                                    }}
                                    focusStyle={{
                                      borderColor: '#049A63',
                                      borderWidth: 1,
                                    }}
                                    hoverStyle={{
                                      borderColor: '#049A63',
                                      borderWidth: 1,
                                    }}
                                  />
                                </View>
                              </View>
                              <View
                                zIndex={-1}
                                height={70}
                                paddingTop={10}
                                gap={10}
                                justifyContent="space-between"
                                flexDirection="row"
                              >
                                <View flex={1}>
                                  <Text fontSize={12} color="gray">
                                    Resp. recebimento <Text color="red"> *</Text>
                                  </Text>
                                  <KeyboardAvoidingView style={{ flex: 1 }}>
                                    <Input
                                      fontSize={14}
                                      flex={1}
                                      backgroundColor="white"
                                      borderColor="lightgray"
                                      borderRadius={5}
                                      value={responsibleReceivingName}
                                      onChangeText={(value) => {
                                        const formattedValue = value.replace(/[^A-Za-z\s]/g, '');
                                        setResponsibleReceivingName(formattedValue);
                                      }}
                                      focusStyle={{
                                        borderColor: '#049A63',
                                        borderWidth: 1,
                                      }}
                                      hoverStyle={{
                                        borderColor: '#049A63',
                                        borderWidth: 1,
                                      }}
                                    />
                                  </KeyboardAvoidingView>
                                </View>
                                <View flex={1}>
                                  <Text fontSize={12} color="gray">
                                    Cel Resp. recebimento <Text color="red"> *</Text>
                                  </Text>
                                  <KeyboardAvoidingView style={{ flex: 1 }}>
                                    <Input
                                      maxLength={15}
                                      fontSize={14}
                                      flex={1}
                                      backgroundColor="white"
                                      borderColor="lightgray"
                                      borderRadius={5}
                                      value={responsibleReceivingPhoneNumber}
                                      keyboardType="phone-pad"
                                      focusStyle={{
                                        borderColor: '#049A63',
                                        borderWidth: 1,
                                      }}
                                      hoverStyle={{
                                        borderColor: '#049A63',
                                        borderWidth: 1,
                                      }}
                                      onChangeText={(value) => {
                                        let onlyNums = value.replace(/\D/g, '');

                                        if (onlyNums.length > 10) {
                                          // Formato moderno (celular): (XX) XXXXX-XXXX
                                          onlyNums = onlyNums.replace(
                                            /(\d{2})(\d{5})(\d{0,4})/,
                                            '($1) $2-$3',
                                          );
                                        } else if (onlyNums.length > 6) {
                                          // Formato convencional (fixo): (XX) XXXX-XXXX
                                          onlyNums = onlyNums.replace(
                                            /(\d{2})(\d{4})(\d{0,4})/,
                                            '($1) $2-$3',
                                          );
                                        } else if (onlyNums.length > 2) {
                                          // Formato parcial: (XX) XXXX
                                          onlyNums = onlyNums.replace(
                                            /(\d{2})(\d{0,4})/,
                                            '($1) $2',
                                          );
                                        } else if (onlyNums.length > 0) {
                                          // Formato parcial: (XX
                                          onlyNums = onlyNums.replace(/(\d{0,2})/, '($1');
                                        }

                                        setResponsibleReceivingPhoneNumber(onlyNums);
                                      }}
                                    />
                                  </KeyboardAvoidingView>
                                </View>
                              </View>
                              <View
                                height={70}
                                paddingTop={10}
                                gap={5}
                                justifyContent="space-between"
                                flexDirection="row"
                              >
                                <View flex={1}>
                                  <KeyboardAvoidingView style={{ flex: 1 }}>
                                    <Text paddingLeft={5} fontSize={12} color="gray">
                                      Info de entrega
                                    </Text>
                                    <Input
                                      fontSize={14}
                                      flex={1}
                                      backgroundColor="white"
                                      borderColor="lightgray"
                                      borderRadius={5}
                                      value={deliveryInformation}
                                      onChangeText={(value) => {
                                        setDeliveryInformation(value);
                                      }}
                                      focusStyle={{
                                        borderColor: '#049A63',
                                        borderWidth: 1,
                                      }}
                                      hoverStyle={{
                                        borderColor: '#049A63',
                                        borderWidth: 1,
                                      }}
                                    />
                                  </KeyboardAvoidingView>
                                </View>
                              </View>
                            </ScrollView>
                          </KeyboardAvoidingView>
                        </>
                      )}

                      <View
                        height={70}
                        paddingTop={15}
                        gap={5}
                        justifyContent="space-between"
                        flexDirection="row"
                      >
                        <Button
                          onPress={async () => {
                            try {
                              setLoading(true);
                              await loadPrices();
                              setEditInfos(false);
                              setDraftSelectedRestaurant(null);
                            } catch (err) {
                              console.error(err);
                            } finally {
                              setLoading(false);
                            }
                          }}
                          backgroundColor="#ff6d6d"
                          flex={1}
                        >
                          <Text paddingLeft={5} fontSize={12} color="white">
                            Cancelar
                          </Text>
                        </Button>
                        <Button
                          {...(zipCode?.length === 9 &&
                          localNumber?.length &&
                          street?.length &&
                          responsibleReceivingName?.length &&
                          responsibleReceivingPhoneNumber?.length &&
                          localType?.length &&
                          city?.length
                            ? {}
                            : { opacity: 0.4, disabled: true })}
                          onPress={async () => {
                            if (!validateFields()) return; // Valida os campos antes de prosseguir

                            const rest: SelectItem = JSON.parse(
                              JSON.stringify(draftSelectedRestaurant ?? selectedRestaurant),
                            );
                            const addressInfo = rest.addressInfos[0];

                            addressInfo.neighborhood = neighborhood;
                            addressInfo.city = city;
                            addressInfo.localType = localType;
                            addressInfo.localNumber = localNumber;
                            addressInfo.responsibleReceivingName = responsibleReceivingName;
                            addressInfo.responsibleReceivingPhoneNumber =
                              responsibleReceivingPhoneNumber;
                            addressInfo.zipCode = zipCode?.replaceAll(' ', '').replace('-', '');
                            addressInfo.address = street;
                            addressInfo.complement = complement;
                            addressInfo.deliveryInformation = deliveryInformation;
                            addressInfo.finalDeliveryTime = `1970-01-01T${maxHour}:00.000Z`;
                            addressInfo.initialDeliveryTime = `1970-01-01T${minHour}:00.000Z`;

                            setEditInfos(false);

                            await handleRestaurantChange(rest);

                            await Promise.all([
                              loadPrices(rest),
                              fetch(`${process.env.EXPO_PUBLIC_API_URL}/address/update`, {
                                body: JSON.stringify({
                                  ...rest,
                                }),
                                headers: {
                                  'Content-Type': 'application/json',
                                },
                                method: 'POST',
                              }),
                            ]);
                            try {
                              setLoading(true);
                              // await loadRestaurants();
                              await loadPrices();
                            } catch (err) {
                              console.error(err);
                            } finally {
                              setLoading(false);
                            }
                          }}
                          backgroundColor="#04BF7B"
                          flex={1}
                        >
                          <Text paddingLeft={5} fontSize={12} color="white">
                            Salvar
                          </Text>
                        </Button>
                      </View>
                    </View>
                  </View>
                </ScrollView>
                <CustomAlert
                  visible={isAlertVisible}
                  title="Campos obrigatórios"
                  message={`Por favor, preencha todos os campos obrigatórios:\n\n- ${missingFields.join('\n- ')}`}
                  onConfirm={() => setIsAlertVisible(false)}
                />
              </Modal>
            </View>
          )}
          <CustomAlert
            visible={isConectarAlertVisible}
            title="Conéctar+ indisponível!"
            message="Serviço do Conéctar+ está indisponível no momento, por favor, solicite uma cotação."
            onConfirm={() => setIsConectarAlertVisible(false)}
          />
          <DialogComercialInstance
            openModal={showBlockedModal}
            setOpenModal={setShowBlockedModal}
            setRegisterInvalid={setShowBlockedModal}
            rest={allRestaurants}
            messageText="Este restaurante não está liberado para fazer cotações. Entre em contato conosco ou selecione outro restaurante disponível."
            onSelectAvailable={async () => {
              try {
                // Encontrar um restaurante disponível
                const availableRestaurant = allRestaurants.find(
                  (r) => !r.registrationReleasedNewApp,
                );

                if (availableRestaurant) {
                  // 1. Fechar o modal
                  setShowBlockedModal(false);

                  handleRestaurantChange(availableRestaurant);
                  /*  // 2. Salvar o novo restaurante selecionado
                  await AsyncStorage.setItem(
                    'selectedRestaurant',
                    JSON.stringify({ restaurant: availableRestaurant }),
                  );

                  // 3. Atualizar o estado local
                  setSelectedRestaurant(availableRestaurant); */

                  // 4. Recarregar os preços para o novo restaurante
                  await loadPrices(availableRestaurant);

                  setDraftSelectedRestaurant(null);
                }
              } catch (error) {
                console.error('Erro ao trocar de restaurante:', error);
              }
            }}
          />
        </View>
        <CustomAlert
          visible={isAlertVisible}
          title="Campos obrigatórios"
          message={`Por favor, preencha todos os campos obrigatórios:\n\n- ${missingFields.join('\n- ')}`}
          onConfirm={() => setIsAlertVisible(false)}
        />
      </Stack>
    </PageContainer>
  );
}
