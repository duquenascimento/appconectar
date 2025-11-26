import {
  View,
  Select,
  YStack,
  XStack,
  Text,
  Adapt,
  Sheet,
  Input,
  Button,
  Stack,
  ScrollView,
} from 'tamagui';
import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import Icons from '@expo/vector-icons/Ionicons';
import {
  ActivityIndicator,
  FlatList,
  Modal,
  Platform,
  TouchableOpacity,
  VirtualizedList,
} from 'react-native';
import ImageViewer from 'react-native-image-zoom-viewer';
import { MotiView } from 'moti';
import { Skeleton } from 'moti/skeleton';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect, useRouter } from 'expo-router';
import { clearStorage, deleteToken, getToken, setStorage } from '../src/utils/utils';
import { VersionInfo, SaveUserAppInfo, checkVersion } from '../src/utils/VersionApp';
import CustomFlatList from '../src/utils/FlatList_VirtualizeList/FlatList_Products';
import CustomVirtualizedList from '../src/utils/FlatList_VirtualizeList/VirtualizeList_Products';
import DialogComercialInstance from '../src/components/dialogComercialInstance';
import { saveProductObservations, loadProductObservations } from '../src/utils/productObservation';
import { CartButton } from '../src/components/cartButton';
import { useProductContext } from '../src/contexts/produtos.context';
import { useCart } from '../src/components/useCart';
import { loadFavorites } from '../src/utils/loadFavorite';
import {
  ProductCardBottomStyled,
  ProductCardObsUnitContainerStyled,
  ProductCardStyled,
} from '../src/components/card/productCard';
import { useRestaurantContext } from '../src/contexts/restaurant.context';
import { useBackHandler } from '../src/components/hooks/useBackHandler';
import PageContainer from '../src/components/box/PageContainer';
import { DropDownPickerRestaurant } from '../src/components/input/DropDownPickerRestaurant';
import { HeaderText } from '../src/components/text/HeaderText';
import { SearchProducts } from '../src/components/input/SearchProducts';
import { ProductsCategoriesList } from '../src/components/list/ProductsCategoriesList';
import { CustomImageBadge } from '../src/components/image/customImageBadge';
import { getSavedRestaurant } from '../src/utils/savedRestaurant';
import { UpdateAppModal } from '../src/components/UpdateAppModal';
import { DialogFinanceInstance } from '../src/components/dialogFinanceInstance';
import { useFavoritesContext } from '@/src/contexts/favoritos.context';
import { normalizeText } from '@/src/utils/stringUtils';

export type Product = {
  name: string;
  orderUnit: string;
  quotationUnit: string;
  convertedWeight: number;
  class: string;
  sku: string;
  id: string;
  active: true;
  createdBy: string;
  createdAt: string;
  changedBy: string;
  updatedAt: string;
  image: string[];
  favorite?: boolean;
  mediumWeight: number;
  firstUnit: number;
  secondUnit: number;
  thirdUnit: number;
  obs: string;
};

type Cart = {
  productId: string;
  amount: number;
  obs: string;
  addOrder: number;
};

type SelectItem = {
  name: string;
};

type ProductBoxProps = Product & {
  toggleFavorite: (productId: string) => void;
  favorites: Product[];
  saveCart: (cart: Cart, isCart: boolean) => Promise<void>;
  saveCartArray: (cart: Map<string, Cart>, exclude: Map<string, Cart>) => Promise<void>;
  cartToExclude: Map<string, Cart>;
  setLoading: (status: boolean) => void;
  cart: Map<string, Cart>;
  setImage: (imageString: string) => void;
  setModalVisible: (status: boolean) => void;
  mediumWeight: number;
  firstUnit: number;
  secondUnit: number;
  thirdUnit: number;
  currentClass: string;
  obs: string;
  addObservation: (productId: string, observation: string) => Promise<void | null | undefined>;
  onObsChange: (text: string) => void;
  productObservations: Map<string, string>;
  setProductObservations: React.Dispatch<React.SetStateAction<Map<string, string>>>;
  saveProductObservations?: (map: Map<string, string>) => Promise<void>;
  loadCart: () => Promise<Map<string, Cart>>;
};

const ProductBox = React.memo(
  ({
    id,
    name,
    image,
    firstUnit,
    secondUnit,
    thirdUnit,
    orderUnit,
    toggleFavorite,
    favorites,
    saveCart,
    saveCartArray,
    cart,
    setImage,
    setModalVisible,
    currentClass,
    obs: parentObs,
    addObservation,
    onObsChange,
    productObservations,
    setProductObservations,
    saveProductObservations,
  }: ProductBoxProps) => {
    const [quant, setQuant] = useState<number>(firstUnit || 1);
    const [valueQuant, setValueQuant] = useState(0);
    const [obs, setObs] = useState(parentObs);
    const [open, setOpen] = useState<boolean>(false);

    const obsRef = useRef('');
    const quantRef = useRef<number>(firstUnit);
    const previousCartRef = useRef<Map<string, Cart>>(new Map());
    const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

    const isFavorite = useMemo(
      () => favorites.some((favorite) => favorite.id === id),
      [favorites, id],
    );
    const isCart = useMemo(() => cart.has(id), [cart, id]);

    const toggleOpen = useCallback(() => setOpen((prev) => !prev), []);

    useEffect(() => {
      const latestObs = productObservations.get(id);

      if (latestObs) {
        setObs(latestObs);
        onObsChange(latestObs);
      } else {
        const cartProduct = cart.get(id);
        const favoriteProduct = favorites.find((f) => f.id === id);

        if (favoriteProduct?.obs) {
          setObs(favoriteProduct.obs);
          onObsChange(favoriteProduct.obs);
        } else if (cartProduct?.obs) {
          setObs(cartProduct.obs);
          onObsChange(cartProduct.obs);
        }
      }
    }, [favorites, cart.get(id)?.obs, productObservations]);

    useEffect(() => {
      const currentCartItem = cart.get(id);
      const previousCartItem = previousCartRef.current.get(id);
      if (
        (!currentCartItem && !previousCartItem) ||
        (currentCartItem &&
          previousCartItem &&
          currentCartItem.amount === previousCartItem.amount &&
          currentCartItem.obs === previousCartItem.obs)
      ) {
        return;
      }

      if (currentCartItem) {
        setValueQuant(Number(currentCartItem.amount));
        setObs(currentCartItem.obs || '');
        onObsChange(currentCartItem.obs || '');
      } else {
        setValueQuant(0);
        const storedObs = productObservations.get(id) || '';
        setObs(storedObs);
        onObsChange(storedObs);
      }

      previousCartRef.current = new Map(cart);
    }, [cart]);

    const handlePersistCart = useCallback(() => {
      const currentItem = { amount: valueQuant, productId: id, obs };
      const previousItem = previousCartRef.current.get(id);
      const shouldPersist =
        valueQuant > 0 ||
        (previousItem && valueQuant !== previousItem.amount) ||
        (previousItem && obs !== previousItem.obs);

      if (shouldPersist) {
        saveCart(currentItem, !!previousItem);
        previousCartRef.current.set(id, currentItem);
      }
    }, [valueQuant, obs, id, saveCart]);

    useEffect(() => {
      const timer = setTimeout(handlePersistCart, 1000);
      return () => clearTimeout(timer);
    }, [valueQuant, obs, handlePersistCart]);

    const handleQuantityChange = (newQuant: number) => {
      setQuant(newQuant);
      quantRef.current = newQuant;
    };

    const handleObsChange = (text: string) => {
      setObs(text);
      onObsChange(text);

      setProductObservations((prev) => {
        const updated = new Map(prev);
        updated.set(id, text);
        if (saveProductObservations) {
          saveProductObservations(updated);
        }
        return updated;
      });
    };

    const handleValueQuantChange = async (delta: number) => {
      const newAmount = Math.max(0, Number((valueQuant + delta).toFixed(3)));
      setValueQuant(newAmount);

      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }

      debounceTimerRef.current = setTimeout(async () => {
        const updatedItem = { productId: id, amount: newAmount, obs };
        const mapItem = new Map([[id, updatedItem]]);
        const mapToRemove = delta < 0 && newAmount === 0 ? mapItem : new Map();

        await saveCart(updatedItem, true);
        await saveCartArray(mapItem, mapToRemove);
      }, 500);
    };
    const handleBlur = useCallback(async () => {
      if (obsRef.current !== obs) {
        try {
          const updatedItem = { productId: id, amount: valueQuant, obs };
          const updatedMap = new Map([[id, updatedItem]]);
          const emptyMap = new Map();

          await saveCart(updatedItem, true);
          await saveCartArray(updatedMap, emptyMap);
          await addObservation(id, obs);
          obsRef.current = obs;
        } catch (error) {
          console.error('Failed to save observation:', error);
        }
      }
    }, [addObservation, id, obs]);
    return (
      <Stack
        onPress={toggleOpen}
        flex={1}
        minHeight={40}
        borderWidth={1}
        borderRadius={12}
        borderColor="#F0F2F6"
      >
        <ProductCardStyled
          selected={cart.get(id) ? true : false}
          resetBottomBorderRadius={
            open || isCart || (isFavorite && currentClass === 'Favoritos') ? true : false
          }
        >
          <View flexDirection="row" alignItems="center">
            <View
              paddingVertical={10}
              onPress={(e) => {
                e.stopPropagation();
                setImage(image[0]);
                setModalVisible(true);
              }}
            >
              <CustomImageBadge
                uri={image[0]}
                badgeText={orderUnit}
                badgeColor="#0BC07D"
                badgeTextSize={10}
              />
            </View>
            <View marginLeft={8} maxWidth={130}>
              <Text fontSize={12}>{name}</Text>
            </View>
          </View>
          <View marginRight={10} flexDirection="row" alignItems="center" gap={16} cursor="pointer">
            <Icons
              size={24}
              name={isFavorite ? 'heart' : 'heart-outline'}
              color="red"
              onPress={() => toggleFavorite(id)}
            />
            {(isFavorite && currentClass === 'Favoritos') || isCart ? (
              <></>
            ) : isCart ? (
              <View
                borderColor="#FFA500"
                borderWidth={1}
                borderRadius={50}
                gap={8}
                justifyContent="center"
                alignItems="center"
                padding={8}
                height={36}
                width={80}
                flexDirection="row"
              >
                <Text fontSize={12} fontWeight="800">
                  {valueQuant}
                  <Text fontSize={8} color="gray">
                    {orderUnit.replace('Unid', 'Un')}
                  </Text>
                </Text>
                <Icons name="pencil-sharp" color="#FFA500" size={15} />
              </View>
            ) : (
              <Icons name={open ? 'chevron-up' : 'chevron-down'} size={30} color="#0BC07D" />
            )}
          </View>
        </ProductCardStyled>
        {(open || isCart || (isFavorite && currentClass === 'Favoritos')) && (
          <ProductCardBottomStyled
            selected={cart.get(id) ? true : false}
            onPress={(e) => e.stopPropagation()}
          >
            <View flexDirection="row" alignItems="center">
              <ProductCardObsUnitContainerStyled>
                <View flex={1} width={'100%'}>
                  <View flex={1} width={'100%'}>
                    <XStack
                      backgroundColor="#F0F2F6"
                      borderWidth={0}
                      borderRadius={20}
                      alignItems="center"
                      flexDirection="row"
                      height={36}
                      flex={1}
                    >
                      <Input
                        focusVisibleStyle={{ outlineWidth: 0 }}
                        placeholder="Observação de entrega..."
                        backgroundColor="transparent"
                        borderWidth={0}
                        borderColor="transparent"
                        flex={1}
                        fontSize={10}
                        maxLength={999}
                        onPressIn={(e) => {
                          e.stopPropagation();
                        }}
                        onChangeText={handleObsChange}
                        onBlur={handleBlur}
                        value={obs}
                      />
                    </XStack>
                  </View>
                </View>

                <View flexDirection="row" alignItems="center" gap={16}>
                  <View flex={1} flexDirection="row" gap={8}>
                    <Button
                      onPress={(e) => {
                        e.stopPropagation();
                        handleQuantityChange(firstUnit || 1);
                      }}
                      backgroundColor={quant === (firstUnit || 1) ? '#0BC07D' : '#F0F2F6'}
                      height={30}
                      minWidth={42}
                      borderRadius={12}
                      hoverStyle={{ backgroundColor: 'none' }}
                    >
                      <Text color={quant === (firstUnit || 1) ? '#fff' : '#000'} fontSize={12}>
                        {firstUnit || 1}
                      </Text>
                    </Button>
                    <Button
                      onPress={(e) => {
                        e.stopPropagation();
                        handleQuantityChange(secondUnit || 5);
                      }}
                      backgroundColor={quant === (secondUnit || 5) ? '#0BC07D' : '#F0F2F6'}
                      color={quant === secondUnit ? '#fff' : '#000'}
                      height={30}
                      minWidth={48}
                      borderRadius={12}
                      hoverStyle={{ backgroundColor: 'none' }}
                    >
                      <Text color={quant === (secondUnit || 5) ? '#fff' : '#000'} fontSize={12}>
                        {secondUnit || 5}
                      </Text>
                    </Button>
                    <Button
                      onPress={(e) => {
                        e.stopPropagation();
                        handleQuantityChange(thirdUnit || 10);
                      }}
                      backgroundColor={quant === (thirdUnit || 10) ? '#0BC07D' : '#F0F2F6'}
                      height={30}
                      color={quant === thirdUnit ? '#fff' : '#000'}
                      minWidth={48}
                      borderRadius={12}
                      hoverStyle={{ backgroundColor: 'none' }}
                    >
                      <Text color={quant === (thirdUnit || 10) ? '#fff' : '#000'} fontSize={12}>
                        {thirdUnit || 10}
                      </Text>
                    </Button>
                  </View>
                  <View
                    alignItems="center"
                    borderColor="#F0F2F6"
                    borderWidth={1}
                    padding={4}
                    borderRadius={18}
                    flexDirection="row"
                    gap={10}
                    backgroundColor="white"
                  >
                    <Icons
                      name="remove"
                      color="#04BF7B"
                      size={24}
                      onPress={async (e) => {
                        e.stopPropagation();
                        handleValueQuantChange(-quant);
                      }}
                    />
                    <Text fontSize={14}>
                      {valueQuant} {orderUnit.replace('Unid', 'Un')}
                    </Text>
                    <Icons
                      name="add"
                      color="#04BF7B"
                      size={24}
                      onPress={async (e) => {
                        e.stopPropagation();
                        handleValueQuantChange(+quant);
                      }}
                    />
                  </View>
                </View>
              </ProductCardObsUnitContainerStyled>
            </View>
          </ProductCardBottomStyled>
        )}
      </Stack>
    );
  },
  (prevProps, nextProps) => {
    return (
      prevProps.id === nextProps.id &&
      prevProps.currentClass === nextProps.currentClass &&
      prevProps.favorites.length === nextProps.favorites.length &&
      prevProps.cart.size === nextProps.cart.size
    );
  },
);

ProductBox.displayName = 'ProductBox';

type CustomSelectProps = {
  items: SelectItem[];
  native?: boolean;
};

export const CustomSelect: React.FC<CustomSelectProps> = ({ items, ...props }) => {
  const [val, setVal] = useState('');

  const handleChange = async (value: string) => {
    setVal(value);
    await setStorage(
      'selectedRestaurant',
      JSON.stringify({
        restaurant: items.filter((item) => {
          if (typeof item.name !== 'undefined' ? item.name : value === '') return item;
        }),
      }),
    );
  };

  return (
    <Select
      value={val}
      onValueChange={(value) => {
        handleChange(value);
      }}
      disablePreventBodyScroll
      {...props}
    >
      <Select.Trigger
        backgroundColor="$colorTransparent"
        paddingRight={20}
        alignItems="flex-start"
        paddingLeft={0}
        paddingVertical={0}
        borderWidth={0}
        width={220}
        pressStyle={{ backgroundColor: 'transparent' }}
        iconAfter={<Icons name="chevron-down" />}
      >
        <Select.Value
          fontSize={16}
          fontWeight="900"
          placeholder={typeof items[0].name !== 'undefined' ? items[0].name : ''}
        />
      </Select.Trigger>

      <Adapt /* when="sm" */ platform="touch">
        <Sheet native={!!props.native} modal dismissOnSnapToBottom animation="bouncy">
          <Sheet.Overlay />
          <Sheet.Frame>
            <Sheet.ScrollView>
              <Adapt.Contents />
            </Sheet.ScrollView>
          </Sheet.Frame>
        </Sheet>
      </Adapt>

      <Select.Content zIndex={200_000}>
        <Select.ScrollUpButton
          alignItems="center"
          justifyContent="center"
          position="relative"
          width="100%"
          height={12}
        >
          <YStack zIndex={10}>
            <Icons name="chevron-up" size={20} />
          </YStack>
        </Select.ScrollUpButton>
        <Select.Viewport minWidth={200}>
          <Select.Group>
            <Select.Label>Restaurantes</Select.Label>
            {useMemo(
              () =>
                items.map((item, i) => (
                  <Select.Item
                    index={i}
                    key={typeof item.name !== 'undefined' ? item.name : ''}
                    value={typeof item.name !== 'undefined' ? item.name.toLowerCase() : ''}
                  >
                    <Select.ItemText>
                      {typeof item.name !== 'undefined' ? item.name : ''}
                    </Select.ItemText>
                    <Select.ItemIndicator marginLeft="auto">
                      <Icons name="checkmark" size={16} />
                    </Select.ItemIndicator>
                  </Select.Item>
                )),
              [items],
            )}
          </Select.Group>
          {props.native && (
            <YStack
              position="absolute"
              right={0}
              top={0}
              bottom={0}
              alignItems="center"
              justifyContent="center"
              width={16}
              pointerEvents="none"
            >
              <Icons name="chevron-down" />
            </YStack>
          )}
        </Select.Viewport>

        <Select.ScrollDownButton
          alignItems="center"
          justifyContent="center"
          position="relative"
          width="100%"
          height={12}
        >
          <YStack zIndex={10}>
            <Icons name="chevron-down" size={20} />
          </YStack>
        </Select.ScrollDownButton>
      </Select.Content>
    </Select>
  );
};

let classItems: { name: string }[] = [];

export interface Restaurant {
  externalId: any;
  id: string;
  name: string;
  registrationReleasedNewApp: boolean;
}

export default function Products() {
  const [currentClass, setCurrentClass] = useState('Favoritos');
  const [productsList, setProductsList] = useState<Product[] | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [displayedProducts, setDisplayedProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalVisible, setModalVisible] = useState(false);
  const [image, setImage] = useState<string>('');
  const [skeletonLoading, setSkeletonLoading] = useState<boolean>(false);
  const [showRegistrationReleasedNewApp, setShowRegistrationReleasedNewApp] = useState(false);
  const [showFinanceBlock, setShowFinanceBlock] = useState(false);
  const [updateRequired, setUpdateRequired] = useState(false);
  const [updateMessage, setUpdateMessage] = useState('');
  const { productsContext, isLoading } = useProductContext();
  const { selectedRestaurant, restaurants } = useRestaurantContext();
  const { favorites, setFavorites } = useFavoritesContext();
  const {
    cart,
    setCart,
    cartToExclude,
    productObservations,
    setProductObservations,
    displayedCartSize,
    setDisplayedCartSize,
    loadCart,
    saveCart,
    saveCartArray,
  } = useCart();
  const router = useRouter();

  useBackHandler(() => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/');
    }
    return true;
  });

  useEffect(() => {
    if (Platform.OS === 'web' || !selectedRestaurant) return;

    const runCheck = async () => {
      const result = await checkVersion();

      if (result?.result?.updateRequired) {
        setUpdateRequired(true);
        setUpdateMessage(result.result.message ?? '');
      } else {
        setUpdateRequired(false);
        setUpdateMessage('');
      }
    };
    runCheck();
  }, []);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setDisplayedCartSize(cart.size);
    }, 100);

    return () => clearTimeout(timeout);
  }, [cart.size]);

  const virtualizedListRef = useRef<VirtualizedList<Product>>(null);
  const flatListRef = useRef<FlatList<Product>>(null);

  useEffect(() => {
    if (!isLoading && productsContext.length > 0) {
      setProductsList(productsContext);
    }
  }, [isLoading, productsContext]);

  useFocusEffect(
    useCallback(() => {
      const loadInitialData = async () => {
        setLoading(true);
        try {
          if (restaurants.length === 0 || !restaurants) {
            return;
          }
          if (selectedRestaurant?.externalId) {
            await SaveUserAppInfo();
          }

          const verduraKg = restaurants?.filter((rest: any) => rest.verduraKg === true);
          // Extraindo categorias
          const categories = restaurants?.flatMap((rest: any) => rest.categories || []);
          if (verduraKg.length && categories.length === 0) {
            classItems = [
              { name: 'Favoritos' },
              { name: 'Fruta' },
              { name: 'Legumes' },
              { name: 'Verduras - KG' },
              { name: 'Especiarias' },
              { name: 'Granja' },
              { name: 'Cogumelos e trufas' },
              { name: 'Higienizados' },
            ];
          } else if (categories.length === 0) {
            classItems = [
              { name: 'Favoritos' },
              { name: 'Fruta' },
              { name: 'Legumes' },
              { name: 'Verduras' },
              { name: 'Especiarias' },
              { name: 'Granja' },
              { name: 'Cogumelos e trufas' },
              { name: 'Higienizados' },
            ];
          } else {
            classItems = [
              { name: 'Favoritos' },
              ...categories.map((category: any) => ({ name: category })),
            ];
          }

          const validRestaurants = Array.isArray(restaurants) ? restaurants : [];

          const availableRestaurants = validRestaurants.filter(
            (r) => !r.registrationReleasedNewApp,
          );
          const allRestaurantBlocked = availableRestaurants.length === 0;

          let initialRestaurant = selectedRestaurant;
          if (!allRestaurantBlocked) {
            initialRestaurant = restaurants[0];

            if (selectedRestaurant) {
              const found = availableRestaurants.find((r) => r.id === selectedRestaurant.id);
              if (found) {
                initialRestaurant = found;
              }
            }
            await setStorage(
              'selectedRestaurant',
              JSON.stringify({ restaurant: initialRestaurant }),
            );
          }

          const cartMap = await loadCart();

          const restFilteredComercial = initialRestaurant?.registrationReleasedNewApp === true;
          const restFilteredFinance = restaurants.filter((item: any) => item.financeBlock);
          if (restFilteredComercial || allRestaurantBlocked) {
            setShowRegistrationReleasedNewApp(true);
          }

          if (restFilteredFinance.length) {
            setShowFinanceBlock(true);
          }

          if (cartMap.size > 0) {
            setCart(cartMap);
          }
          const newObservations = new Map();
          cart.forEach((item) => {
            if (item.obs) newObservations.set(item.productId, item.obs);
          });
          setProductObservations(newObservations);
        } catch (error) {
          console.error('Erro ao carregar dados:', error);
        } finally {
          setLoading(false);
        }

        const storedObs = await loadProductObservations();
        setProductObservations(storedObs);
      };
      loadInitialData();
    }, [selectedRestaurant, restaurants]),
  );
  const addToFavorites = useCallback(
    async (productId: string, obs: string) => {
      try {
        const token = await getToken();
        const restaurant = await getSavedRestaurant();
        if (token == null || !restaurant) return;
        const productToAdd = productsList?.find((product) => product.id === productId);
        if (productToAdd) {
          setFavorites([...favorites, { ...productToAdd, obs }]);
        }
        const storedRestaurant = await getSavedRestaurant();

        const result = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/favorite/save`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            productId,
            restaurantId: storedRestaurant?.id,
            token,
            obs,
          }),
        });
        if (!result.ok) return null;
      } catch (error) {
        console.error('Erro ao adicionar aos favoritos:', error);
      }
    },
    [favorites, productsList],
  );

  const addObservation = useCallback(
    async (productId: string, observation: string): Promise<void | null | undefined> => {
      try {
        const token = await getToken();
        const restaurant = await getSavedRestaurant();
        if (token == null || !restaurant) return;
        const productToAdd = productsList?.find((product) => product.id === productId);
        const storedRestaurant = await getSavedRestaurant();

        const isFavorite = favorites.some((fav) => fav.id === productId);
        if (!isFavorite) {
          return;
        }

        const result = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/favorite/update`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            productId,
            restaurantId: storedRestaurant?.id,
            token,
            obs: observation,
          }),
        });
        if (!result.ok) return null;
      } catch (error) {
        console.error('Erro ao adicionar aos favoritos:', error);
      }
    },
    [favorites, productsList],
  );

  const removeFromFavorites = useCallback(
    async (productId: string) => {
      try {
        const token = await getToken();
        const restaurant = await getSavedRestaurant();
        setFavorites(favorites.filter((favorite) => favorite.id !== productId));
        if (token == null || !restaurant) return;
        const storedRestaurant = await getSavedRestaurant();

        const result = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/favorite/del`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            productId,
            restaurantId: storedRestaurant?.id,
            token,
          }),
        });
        if (!result.ok) return null;
      } catch (error) {
        console.error('Erro ao remover dos favoritos:', error);
      }
    },
    [favorites],
  );

  const toggleFavorite = useCallback(
    async (productId: string) => {
      const product = productsList?.find((p) => p.id === productId);
      const isCurrentlyFavorite = favorites.some((f) => f.id === productId);

      if (isCurrentlyFavorite) {
        await removeFromFavorites(productId);
      } else {
        // Adiciona a observação atual ao favoritar
        const currentObs = productObservations.get(productId) || '';
        await addToFavorites(productId, currentObs);

        // Se houver uma observação no carrinho, sincroniza com os favoritos
        const cartItem = cart.get(productId);
        if (cartItem?.obs && cartItem.obs !== currentObs) {
          await addObservation(productId, cartItem.obs);
          setProductObservations((prev) => new Map(prev).set(productId, cartItem.obs));
        }
      }
    },
    [favorites, productObservations, cart],
  );

  useEffect(() => {
    if (virtualizedListRef.current) {
      virtualizedListRef.current.scrollToOffset({ animated: true, offset: 0 });
    } else if (flatListRef.current) {
      flatListRef.current.scrollToOffset({ animated: true, offset: 0 });
    }
  }, [currentClass, searchQuery]);

  useEffect(() => {
    if (productsList) {
      productsList.sort((a, b) => a.name.toLowerCase().localeCompare(b.name.toLowerCase()));
    }
  }, [productsList]);

  const filteredProducts = useMemo(() => {
    let products = productsList || [];

    // Favoritos
    if (currentClass === 'Favoritos') {
      products = favorites;
    } else {
      products =
        productsList?.filter(
          (product) => product.class.toLowerCase() === currentClass.toLowerCase(),
        ) || [];
    }

    if (searchQuery) {
      const excludeClass = classItems[3].name === 'Verduras - KG' ? 'Verduras' : 'Verduras - KG';
      const normalizedQuery = normalizeText(searchQuery);
      const queryWords = normalizedQuery.split(' ').filter((word) => word !== '');

      products =
        productsList?.filter((product) => {
          const normalizedProductName = normalizeText(product.name);
          const productNameWords = normalizedProductName.split(' ');
          const isMatchingName = queryWords.every((queryWord) =>
            productNameWords.some((productWord) => productWord.includes(queryWord)),
          );
          const isNotExcludedClass = normalizeText(product.class) !== normalizeText(excludeClass);
          return isMatchingName && isNotExcludedClass;
        }) ?? [];
    }
    return products.sort((a, b) => a.name.toLowerCase().localeCompare(b.name.toLowerCase()));
  }, [currentClass, productsList, favorites, searchQuery]);

  useEffect(() => {
    setDisplayedProducts(filteredProducts);
    setSkeletonLoading(false);
  }, [filteredProducts]);

  const handlePress = useCallback(
    (name: string) => {
      setSearchQuery('');
      if (name !== currentClass) {
        setSkeletonLoading(true);
        setCurrentClass(name);
      }
    },
    [currentClass],
  );
  const renderClassItem = useCallback(
    ({ item }: { item: SelectItem }) => (
      <TouchableOpacity
        style={{
          padding: 8,
          ...(currentClass.toLowerCase() === item.name.toLowerCase()
            ? { borderBottomWidth: 1.5, borderBottomColor: '#04BF7B' }
            : {}),
          justifyContent: 'center',
        }}
        onPress={() => handlePress(item.name)}
      >
        <Text
          color={currentClass.toLowerCase() !== item.name.toLowerCase() ? '#aaa' : '#04BF7B'}
          fontSize={14}
          paddingHorizontal={8}
          maxWidth={120}
          textAlign="center"
        >
          {item.name}
        </Text>
      </TouchableOpacity>
    ),
    [currentClass, handlePress],
  );

  const handleSetImage = (imageString: string): void => {
    setImage(imageString);
  };

  const handleSetModalVisible = (status: boolean): void => {
    setModalVisible(status);
  };
  const renderProduct = useCallback(
    ({ item }: { item: Product }) => (
      <ProductBox
        currentClass={currentClass}
        setModalVisible={handleSetModalVisible}
        setImage={handleSetImage}
        key={item.id}
        toggleFavorite={toggleFavorite}
        {...item}
        favorites={favorites}
        saveCart={saveCart}
        setLoading={setLoading}
        saveCartArray={saveCartArray}
        cartToExclude={cartToExclude}
        cart={cart}
        obs={productObservations.get(item.id) || ''}
        onObsChange={(newObs: any) => {
          setProductObservations((prev) => {
            const newMap = new Map(prev);
            newMap.set(item.id, newObs);
            return newMap;
          });
        }}
        addObservation={addObservation}
        productObservations={productObservations}
        setProductObservations={setProductObservations}
        saveProductObservations={saveProductObservations}
      />
    ),
    [cart, currentClass, favorites, saveCart, toggleFavorite, productObservations, addObservation],
  );

  if (loading || !selectedRestaurant) {
    return (
      <PageContainer backgroundColor="white">
        <View flex={1} justifyContent="center" alignItems="center">
          <ActivityIndicator size="large" color="#04BF7B" />
        </View>
      </PageContainer>
    );
  }

  return (
    <PageContainer backgroundColor="white">
      <DialogComercialInstance
        openModal={showRegistrationReleasedNewApp}
        setOpenModal={setShowRegistrationReleasedNewApp}
        setRegisterInvalid={setShowRegistrationReleasedNewApp}
        rest={restaurants}
        messageText="Este restaurante não está liberado. Entre em contato conosco para concluir o processo."
        onSelectAvailable={() => {
          const availableRestaurant = restaurants.find((r) => !r.registrationReleasedNewApp);
          if (availableRestaurant) {
            AsyncStorage.setItem(
              'selectedRestaurant',
              JSON.stringify({ restaurant: availableRestaurant }),
            );
            setSelectedRestaurant(availableRestaurant.externalId);
            setShowRegistrationReleasedNewApp(false);
            loadFavorites();
            loadCart();
          }
        }}
      />
      <UpdateAppModal openModal={updateRequired} message={updateMessage} />
      <DialogFinanceInstance
        openModal={showFinanceBlock}
        setRegisterInvalid={setShowFinanceBlock}
        rest={restaurants}
      />
      <Modal visible={isModalVisible} transparent onRequestClose={() => setModalVisible(false)}>
        <TouchableOpacity
          style={{
            flex: 1,
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            justifyContent: 'center',
            alignItems: 'center',
          }}
          activeOpacity={1}
          onPress={() => setModalVisible(false)}
        >
          <View
            width="100%"
            height="80%"
            backgroundColor="white"
            borderRadius={10}
            overflow="hidden"
            justifyContent="center"
            alignItems="center"
          >
            <ImageViewer
              imageUrls={[{ url: image }]}
              enableSwipeDown
              onSwipeDown={() => setModalVisible(false)}
              style={{ width: '100%', height: '100%' }}
            />
            <TouchableOpacity
              style={{
                position: 'absolute',
                top: 30,
                right: 30,
                backgroundColor: 'rgba(0, 0, 0, 0.6)',
                borderRadius: 20,
                padding: 10,
                zIndex: 1,
              }}
              onPress={() => setModalVisible(false)}
            >
              <Text color="white" fontSize={20} fontWeight="bold">
                X
              </Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      <HeaderText>Meus Restaurantes</HeaderText>

      <DropDownPickerRestaurant />
      <View height={40} flex={1} paddingTop={8}>
        <SearchProducts searchQuery={searchQuery} setSearchQuery={setSearchQuery} />

        <ProductsCategoriesList
          dataItems={classItems}
          renderItemsFunction={renderClassItem}
          keyExtractorFunction={(item: any) => item.name}
        />

        <View
          backgroundColor="#F0F2F6"
          flex={1}
          width={'100%'}
          display="flex"
          justifyContent="center"
          alignSelf="center"
          paddingTop={5}
          borderTopColor="#aaa"
          borderTopWidth={0.5}
        >
          {currentClass === 'Favoritos' && favorites.length < 1 && !searchQuery ? (
            <View flex={1} paddingTop={50} alignItems="center">
              <Text
                paddingLeft={15}
                marginBottom={5}
                alignSelf="center"
                fontSize={14}
                color="#A9A9A9"
                textAlign="center"
              >
                Busque os produtos da sua culinária e clique no coração para favoritar.
                <Text> </Text>
              </Text>
              <Icons name="heart-outline" size={25} color="green" />
            </View>
          ) : !skeletonLoading ? (
            Platform.OS === 'android' ? (
              <CustomVirtualizedList
                key={currentClass}
                data={displayedProducts}
                renderItem={renderProduct}
                keyExtractor={(item) => item.id}
                listRef={virtualizedListRef}
                contentContainerStyle={{ paddingBottom: 90 }}
              />
            ) : (
              <CustomFlatList
                data={displayedProducts}
                renderItem={renderProduct}
                keyExtractor={(item) => item.id}
                listRef={flatListRef}
                contentContainerStyle={{ paddingBottom: 90 }}
              />
            )
          ) : (
            <ScrollView>
              <View flex={1} minHeight={40} borderWidth={1} borderRadius={12} borderColor="#F0F2F6">
                {[...Array(7)].map((_, index) => (
                  <View
                    key={index}
                    justifyContent="space-between"
                    alignItems="center"
                    marginTop={8}
                    paddingHorizontal={8}
                    flexDirection="row"
                    minHeight={80}
                    backgroundColor="white"
                    borderRadius={12}
                  >
                    <MotiView
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        marginLeft: Platform.OS === 'web' ? 10 : 0,
                      }}
                    >
                      <Skeleton colorMode="light" height={60} width={60} />
                      <View marginLeft={8} rowGap={5}>
                        <Skeleton colorMode="light" height={20} width={250} />
                        <Skeleton colorMode="light" height={10} width={50} />
                      </View>
                    </MotiView>
                  </View>
                ))}
              </View>
            </ScrollView>
          )}
        </View>
        <View
          justifyContent="center"
          alignItems="center"
          flexDirection="row"
          gap={15}
          height={50}
          borderTopWidth={0.4}
          borderTopColor="lightgray"
          backgroundColor={'white'}
        >
          <View
            onPress={() => router.push('/products')}
            padding={10}
            marginVertical={10}
            borderRadius={8}
            flexDirection="column"
            justifyContent="center"
            alignItems="center"
            width={60}
            height={70}
          >
            <Icons name="home" size={20} color="#04BF7B" />
            <Text fontSize={12} color="#04BF7B">
              Home
            </Text>
          </View>
          <View
            onPress={async () => {
              setLoading(true);
              saveCartArray(cart, cartToExclude).catch(console.error);
              setLoading(false);
              router.push('/ordersScreen');
            }}
            padding={10}
            marginVertical={10}
            borderRadius={8}
            flexWrap="nowrap"
            flexDirection="column"
            justifyContent="center"
            alignItems="center"
            width={120}
            height={70}
          >
            <Icons name="journal" size={20} color="gray" />
            <Text fontSize={12} color="gray">
              Meus Pedidos
            </Text>
          </View>
          <View
            onPress={async () => {
              setLoading(true);
              saveCartArray(cart, cartToExclude).catch(console.error);
              setLoading(false);
              router.push('/userInfo');
            }}
            padding={10}
            marginVertical={10}
            borderRadius={8}
            flexWrap="nowrap"
            flexDirection="column"
            justifyContent="center"
            alignItems="center"
            width={80}
            height={70}
          >
            <Icons name="person" size={20} color="gray" />
            <Text fontSize={12} color="gray">
              Perfil
            </Text>
          </View>
          <View
            onPress={async () => {
              setLoading(true);
              await saveCartArray(cart, cartToExclude);
              await Promise.all([clearStorage(), deleteToken()]);
              setLoading(false);
              router.dismissAll();
              router.replace('/');
            }}
            padding={10}
            marginVertical={10}
            borderRadius={8}
            flexWrap="nowrap"
            flexDirection="column"
            justifyContent="center"
            alignItems="center"
            width={50}
            height={70}
          >
            <Icons name="log-out" size={20} color="gray" />
            <Text fontSize={12} color="gray">
              Sair
            </Text>
          </View>
        </View>
      </View>
      <VersionInfo />

      <CartButton
        cartSize={displayedCartSize}
        selectedRestaurant={selectedRestaurant}
        onPress={async () => {
          setLoading(true);
          router.push('cart');
        }}
      />
    </PageContainer>
  );
}
