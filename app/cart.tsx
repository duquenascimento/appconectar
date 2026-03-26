import { View, Text, Stack, Button, XStack, Input, debounce } from 'tamagui';
import Icons from '@expo/vector-icons/Ionicons';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  Platform,
  TouchableOpacity,
  useWindowDimensions,
  VirtualizedList,
} from 'react-native';
import { useRouter } from 'expo-router';
import { deleteStorage, getStorage, getToken, setStorage } from '../src/utils/utils';
import DialogInstanceNotification from '../src/components/modais/DialogInstanceNotification';
import { filterCarts } from '../src/utils/filterCarts';
import { CustomImageBadge } from '../src/components/image/customImageBadge';
import { useBackHandler } from '../src/components/hooks/useBackHandler';
import PageContainer from '../src/components/box/PageContainer';
import { getStorageRestaurant } from '@/src/utils/restaurantUtils';
import { useCart } from '@/src/components/hooks/useCart';

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
  obs?: string;
  amount?: number;
  mediumWeight: number;
  firstUnit: number;
  secondUnit: number;
  thirdUnit: number;
  addOrder: number;
};

type TCart = {
  productId: string;
  amount: number;
  obs: string;
};

type ProductBoxProps = Product & {
  saveCart: (cart: TCart, isCart: boolean) => Promise<void>;
  cart: Map<string, TCart>;
  cartInside: Map<string, TCart>;
  setConfirmDeleteItem: (cart: TCart) => void;
};

const ProductBox = React.memo((produto: ProductBoxProps) => {
  const [open, setOpen] = useState(false);
  const [quant, setQuant] = useState(produto.firstUnit ? produto.firstUnit : 1);
  const [valueQuant, setValueQuant] = useState(Number(produto.amount) || 0);
  const [obsC, setObs] = useState(produto.obs);

  const obsRef = useRef('');
  const quantRef = useRef(produto.firstUnit ? produto.firstUnit : 1);
  const handleObsChange = (text: string) => {
    setObs(text);
    setObs(text);
  };

  const isCart = useMemo(() => {
    return produto.cart.has(produto.id);
  }, [produto.cart, produto.id]);

  useEffect(() => {
    const cartProduct = produto.cart.get(produto.id);
    if (cartProduct) {
      obsRef.current = cartProduct.obs;
      setObs(cartProduct.obs);
      setValueQuant(Number(cartProduct.amount));
    }
  }, [produto.cart, produto.id]);

  const handleValueQuantChange = (delta: number) => {
    setValueQuant((prevValue) => {
      const newValue = Number((prevValue + delta).toFixed(3));
      if (newValue > 0) {
        return newValue;
      }
      produto.setConfirmDeleteItem({
        amount: valueQuant,
        productId: produto.id,
        obs: obsRef.current,
      });
      return prevValue;
    });
  };

  const toggleOpen = useCallback(() => setOpen((prev) => !prev), []);

  const prevAmountRef = useRef<number>(valueQuant);
  const prevObsRef = useRef<string | undefined>(obsC);
  const debouncedSaveCart = useMemo(() => debounce(produto.saveCart, 300), [produto.saveCart]);

  useEffect(() => {
    if (isCart && (prevAmountRef.current !== valueQuant || prevObsRef.current !== obsC)) {
      prevAmountRef.current = valueQuant;
      prevObsRef.current = obsC;

      debouncedSaveCart({ amount: valueQuant, productId: produto.id, obs: obsC ?? '' }, isCart);
    }
    return () => {
      debouncedSaveCart.cancel?.();
    };
  }, [valueQuant, obsC, isCart]);

  const handleQuantityChange = (newQuant: number) => {
    setQuant(newQuant);
    quantRef.current = newQuant;
  };

  return (
    <View flex={1} minHeight={40} borderWidth={1} borderRadius={12} borderColor="#F0F2F6">
      <View
        onPress={toggleOpen}
        flex={1}
        justifyContent="space-between"
        alignItems="center"
        paddingHorizontal={8}
        flexDirection="row"
        minHeight={40}
        backgroundColor="white"
        marginVertical={5}
        borderRadius={12}
        borderBottomLeftRadius={open ? 0 : 12}
        borderBottomRightRadius={open ? 0 : 12}
        style={{
          width: Platform.OS === 'web' ? '70%' : '100%',
          alignSelf: 'center',
        }}
      >
        <View flexDirection="row" alignItems="center">
          <View padding={Platform.OS === 'web' ? 10 : 5}>
            <CustomImageBadge
              uri={produto.image[0]}
              badgeText={produto.orderUnit}
              badgeTextSize={10}
              badgeColor="#0BC07D"
            />
            <View
              marginLeft={Platform.OS === 'web' ? 10 : 5}
              onPress={() => {
                produto.setConfirmDeleteItem({
                  amount: valueQuant,
                  productId: produto.id,
                  obs: obsRef.current,
                });
              }}
              backgroundColor="black"
              borderRadius={10}
              width={25}
              height={25}
              alignItems="center"
              justifyContent="center"
              borderColor="white"
              borderWidth={1}
              cursor="pointer"
              position="absolute"
              bottom={3}
              left={0}
            >
              <Icons name="trash-bin" color="white" size={15} />
            </View>
          </View>
          <View marginLeft={8} maxWidth={162}>
            <Text fontSize={12}>{produto.name}</Text>
            <Text color="#aaa" fontSize={10}>
              Obs.: {obsC || '--'}
            </Text>
          </View>
        </View>
        <View
          marginRight={Platform.OS === 'web' ? 10 : 5}
          gap={Platform.OS === 'web' ? 15 : 0}
          flexDirection="row"
          alignItems="center"
        >
          <Text fontWeight="800">
            {valueQuant} {produto.orderUnit.replace('Unid', 'Un')}
          </Text>
          <Icons
            name={open ? 'chevron-up' : 'chevron-down'}
            paddingLeft={10}
            size={25}
            color="lightgray"
          />
        </View>
      </View>
      {open && (
        <View
          borderTopColor="#ccc"
          borderTopWidth={1}
          minHeight={Platform.OS === 'web' ? 50 : 85}
          width={Platform.OS === 'web' ? '70%' : '92%'}
          alignSelf="center"
          gap={8}
          borderBottomWidth={0}
          borderBottomLeftRadius={12}
          borderBottomRightRadius={12}
          backgroundColor="white"
          justifyContent="center"
        >
          <View
            paddingHorizontal={Platform.OS === 'web' ? 10 : 5}
            flexDirection="row"
            alignItems="center"
            marginTop={Platform.OS === 'web' ? 0 : 10}
          >
            <View
              justifyContent={Platform.OS === 'web' ? 'flex-end' : 'flex-start'}
              flex={1}
              alignItems="center"
              marginRight={Platform.OS === 'web' ? 35 : 0}
              flexDirection="row"
              gap={8}
            >
              {Platform.OS === 'web' && (
                <View alignSelf="flex-start" flex={1}>
                  <XStack
                    backgroundColor="#F0F2F6"
                    paddingRight={14}
                    borderWidth={0}
                    borderRadius={20}
                    alignItems="center"
                    flexDirection="row"
                    zIndex={20}
                    height={36}
                  >
                    <Input
                      focusVisibleStyle={{ outlineWidth: 0 }}
                      placeholder="Observação para entrega..."
                      backgroundColor="transparent"
                      borderWidth={0}
                      borderColor="transparent"
                      flex={1}
                      fontSize={10}
                      maxLength={999}
                      onChangeText={handleObsChange}
                      value={obsC}
                    />
                  </XStack>
                </View>
              )}
              <Button
                onPress={() => handleQuantityChange(produto.firstUnit ? produto.firstUnit : 1)}
                backgroundColor={
                  quant === (produto.firstUnit ? produto.firstUnit : 1) ? '#0BC07D' : '#F0F2F6'
                }
                height={30}
                minWidth={48}
                borderRadius={12}
              >
                <Text
                  color={quant === (produto.firstUnit ? produto.firstUnit : 1) ? '#fff' : '#000'}
                >
                  {produto.firstUnit ? produto.firstUnit : 1}
                </Text>
              </Button>
              <Button
                onPress={() => handleQuantityChange(produto.secondUnit ? produto.secondUnit : 5)}
                backgroundColor={
                  quant === (produto.secondUnit ? produto.secondUnit : 5) ? '#0BC07D' : '#F0F2F6'
                }
                height={30}
                minWidth={48}
                borderRadius={12}
              >
                <Text
                  color={quant === (produto.secondUnit ? produto.secondUnit : 5) ? '#fff' : '#000'}
                >
                  {produto.secondUnit ? produto.secondUnit : 5}
                </Text>
              </Button>
              <Button
                onPress={() => handleQuantityChange(produto.thirdUnit ? produto.thirdUnit : 10)}
                backgroundColor={
                  quant === (produto.thirdUnit ? produto.thirdUnit : 10) ? '#0BC07D' : '#F0F2F6'
                }
                height={30}
                minWidth={48}
                borderRadius={12}
              >
                <Text
                  color={quant === (produto.thirdUnit ? produto.thirdUnit : 10) ? '#fff' : '#000'}
                >
                  {produto.thirdUnit ? produto.thirdUnit : 10}
                </Text>
              </Button>
            </View>
            <View
              borderColor="#F0F2F6"
              borderWidth={1}
              padding={3}
              borderRadius={18}
              flexDirection="row"
              justifyContent="flex-end"
              gap={16}
            >
              <Icons
                name="remove"
                color="#04BF7B"
                size={24}
                onPress={() => handleValueQuantChange(-quant)}
              />
              <Text>{valueQuant}</Text>
              <Icons
                name="add"
                color="#04BF7B"
                size={24}
                onPress={() => handleValueQuantChange(quant)}
              />
            </View>
          </View>
          {Platform.OS !== 'web' && (
            <View>
              <XStack
                backgroundColor="#F0F2F6"
                paddingRight={14}
                borderWidth={0}
                borderRadius={20}
                alignItems="center"
                flexDirection="row"
                height={36}
                marginBottom={5}
              >
                <Input
                  focusVisibleStyle={{ outlineWidth: 0 }}
                  placeholder="Observação para entrega..."
                  backgroundColor="transparent"
                  borderWidth={0}
                  borderColor="transparent"
                  flex={1}
                  fontSize={10}
                  maxLength={999}
                  onChangeText={handleObsChange}
                  value={obsC}
                />
              </XStack>
            </View>
          )}
        </View>
      )}
    </View>
  );
});

ProductBox.displayName = 'ProductBox';

export default React.memo(function Cart() {
  const [loading, setLoading] = useState<boolean>(true);
  const [displayedProducts, setDisplayedProducts] = useState<Product[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [cartInside, setCartInside] = useState<Map<string, TCart>>(new Map());
  const [confirmDelte, setConfirmDelete] = useState<boolean>(false);
  const [confirmDeleteItem, setConfirmDeleteItem] = useState<boolean>(false);
  const [itemToDelete, setItemToDelete] = useState<TCart>();
  const [alertItems, setAlertItems] = useState<Product[]>([]);
  const [showNotification, setShowNotification] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [modalSubtitle, setModalSubtitle] = useState('');
  const [modalDescription, setModalDescription] = useState('');
  const [modalButtonText, setModalButtonText] = useState('Ok');
  const [modalOnConfirm, setModalOnConfirm] = useState<() => void>(() => {});
  const router = useRouter();
  const { cart, setCart, cartToExclude, setCartToExclude, loadCart, saveCart, saveCartArray } =
    useCart();

  useEffect(() => {
    const fetchRestaurant = async () => {
      const restaurant = await getStorageRestaurant();
      setStorage(
        `cart_${restaurant?.externalId}`,
        JSON.stringify(Array.from(cart.entries())),
      ).then();
    };
    fetchRestaurant();
  }, [cart]);

  useBackHandler(() => {
    setLoading(true);
    saveCartArray(cart, cartToExclude).then(() => {
      router.back();
    });
    return true;
  });

  useEffect(() => {
    // Garantir que o modal esteja fechado ao montar o componente
    setConfirmDelete(false);
    setConfirmDeleteItem(false);
  }, []);

  const flatListRef = useRef<VirtualizedList<Product>>(null);

  const deleteItemFromCart = debounce(async (cartToDelete: TCart) => {
    const token = await getToken();
    const restaurant = await getStorageRestaurant();

    if (!token || !restaurant) return;

    setCart((prevCart) => {
      const newCart = new Map(prevCart);

      newCart.delete(cartToDelete.productId);

      setCartToExclude((prevCartToExclude) => {
        const newCartToExclude = new Map(prevCartToExclude);
        newCartToExclude.set(cartToDelete.productId, cartToDelete);
        return newCartToExclude;
      });

      setStorage(`cart_${restaurant?.externalId}`, JSON.stringify(Array.from(newCart.entries())));

      setProducts((prevProducts) => {
        return prevProducts.filter((item) => item.id !== cartToDelete.productId);
      });

      fetch(`${process.env.EXPO_PUBLIC_API_URL}/cart/delete-item`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token,
          productId: cartToDelete.productId,
          selectedRestaurant: { id: restaurant.id },
        }),
      })
        .then((res) => res)
        .then((result) => {
          if (result.ok) {
            if (newCart.size < 1) {
              deleteStorage(`cart_${restaurant?.externalId}`).then();
              router.push('products');
            }
          }
        })
        .finally(() => {
          setLoading(false);
          setConfirmDeleteItem(false);
        });
      return newCart;
    });
  }, 300);

  const loadProducts = useCallback(async () => {
    try {
      const token = await getToken();
      const restaurant = await getStorageRestaurant();
      if (!token || !restaurant) return [];

      const result = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/cart/full-list`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token,
          selectedRestaurant: { id: restaurant.id },
        }),
      });
      if (!result.ok) return [];
      const cart = await result.json();
      if (cart.data.length < 1) return [];

      const alertItems = cart.data.filter(
        (item: Product) =>
          item.name.toLowerCase().includes('caixa') || item.name.toLowerCase().includes('saca'),
      );

      setAlertItems(alertItems);

      return cart.data;
    } catch (error) {
      console.error('Erro ao carregar favoritos:', error);
      return [];
    }
  }, []);

  const checkAlertItems = (products: Product[]) => {
    products.filter(
      (item: Product) =>
        item.name.toLowerCase().includes('caixa') || item.name.toLowerCase().includes('saca'),
    );
  };

  useEffect(() => {
    if (alertItems.length > 0) {
      checkAlertItems(alertItems);
    }
  }, [alertItems]);

  const handleTrashItemState = (cart: TCart) => {
    setItemToDelete(cart);
    setConfirmDeleteItem(true);
  };

  useEffect(() => {
    const loadInitialData = async () => {
      setLoading(true);
      try {
        const cartitem = await loadCart();
        if (cartitem.size > 0) {
          setCart(cartitem);
          const products = await loadProducts();
          if (products.length > 0) setProducts(products);
        } else {
          // setCart(new Map());
          setProducts([]);
        }
        if (products.length > 0) setProducts(products);
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
      } finally {
        setLoading(false);
      }
    };
    loadInitialData();
  }, [loadCart, loadProducts]);

  useEffect(() => {
    if (!products || products.length === 0) return;
    const orderedProducts = [...products].sort((a, b) => (a.addOrder ?? 0) - (b.addOrder ?? 0));
    setDisplayedProducts(orderedProducts);
    const orderCart = orderedProducts.map((item: any) => ({
      sku: item.sku,
      addOrder: item.addOrder,
    }));
    setStorage('cartOrder', JSON.stringify(orderCart));
  }, [products, cart, cartInside]);

  const renderProduct = useCallback(
    ({ item }: { item: Product }) => (
      <ProductBox
        key={item.id}
        {...item}
        saveCart={saveCart}
        cart={cart}
        cartInside={cartInside}
        setConfirmDeleteItem={handleTrashItemState}
      />
    ),
    [saveCart, cart, cartInside],
  );

  const MemoizedProductBox = React.memo(ProductBox);

  if (loading) {
    return (
      <PageContainer backgroundColor="white">
        <View flex={1} justifyContent="center" alignItems="center">
          <ActivityIndicator size="large" color="#04BF7B" />
        </View>
      </PageContainer>
    );
  }

  return (
    <PageContainer backgroundColor="gray">
      <Stack backgroundColor="#F0F2F6" height="100%" position="relative">
        <View height={50} flex={1}>
          <View
            alignItems="center"
            flexDirection="row"
            paddingVertical="$2"
            gap="$4"
            style={{ width: Platform.OS === 'web' ? '70%' : '92%' }}
            marginHorizontal="auto"
          >
            <Icons
              onPress={async () => {
                setLoading(true);
                await saveCartArray(cart, cartToExclude);
                router.push('/products');
              }}
              size={30}
              name="chevron-back"
            />
            <Text flex={1} fontSize={16}>
              Meu carrinho
            </Text>
          </View>

          <View backgroundColor="#F0F2F6" flex={1} padding={16}>
            <VirtualizedList
              ref={flatListRef}
              style={{ flex: 1 }}
              data={MemoizedProductBox}
              getItemCount={() => displayedProducts.length}
              getItem={(data, index) => displayedProducts[index]}
              keyExtractor={(item) => item.id}
              renderItem={renderProduct}
              ItemSeparatorComponent={() => <View height={8} />}
              initialNumToRender={10}
              windowSize={4}
            />
          </View>
          {/* {cart.size > 0 && !isLargeScreen && (
            <View justifyContent="center" alignItems="center" paddingHorizontal={20}>
              <View width={Platform.OS === 'web' ? '70%' : '92%'}>
                <Button
                  borderRadius={10}
                  onPress={() => {
                    router.push('/schedule');
                  }}
                  width="100%"
                  justifyContent="center"
                  alignItems="center"
                  backgroundColor="orange"
                  hoverStyle={{
                    backgroundColor: '$orange9',
                  }}
                  flex={1}
                >
                  <Text fontSize={16} color="white">
                    Agendar entrega
                  </Text>
                  <Icons size={18} paddingLeft={10} color="white" name="time" />
                </Button>
              </View>
            </View>
          )} */}

          <View
            backgroundColor="#F0F2F6"
            display={confirmDelte ? 'none' : 'flex'}
            paddingHorizontal={20}
            justifyContent="center"
            alignItems="center"
            flexDirection="row"
            gap={20}
            height={70}
          >
            <View
              backgroundColor="#F0F2F6"
              {...(Platform.OS === 'web'
                ? {
                    minWidth: '50%',
                    width: Platform.OS === 'web' ? '70%' : '92%',
                  }
                : {})}
              flexDirection="row"
              justifyContent="center"
              gap={5}
            >
              <View justifyContent="center" alignItems="center">
                {cart.size > 0 && (
                  <Button
                    backgroundColor="black"
                    onPress={async () => {
                      console.log('Botão de lixo pressionado, setConfirmDelete(true)');
                      setConfirmDelete(true);
                    }}
                  >
                    <Icons name="trash" color="white" size={20} />
                  </Button>
                )}
              </View>
              {/* {cart.size > 0 && isLargeScreen && (
                <View justifyContent="center" alignItems="center">
                  <Button
                    backgroundColor="orange"
                    hoverStyle={{
                      backgroundColor: '$orange9',
                    }}
                    onPress={() => {
                      router.push('/schedule');
                    }}
                  >
                    <Text fontSize={16} color="white">
                      Agendar entrega
                    </Text>
                    <Icons name="time" color="white" size={20} />
                  </Button>
                </View>
              )} */}
              <Button
                borderRadius={10}
                onPress={() => {
                  setLoading(true);
                  checkAlertItems(products);
                  saveCartArray(cart, cartToExclude).then(() => {
                    router.push('prices');
                  });
                }}
                justifyContent="center"
                alignItems="center"
                backgroundColor="#04BF7B"
                flex={1}
              >
                <Text fontSize={16} color="white">
                  Ver cotações
                </Text>
                <Icons size={18} style={{ paddingLeft: 10 }} color="white" name="arrow-forward" />
              </Button>
            </View>
            <DialogInstanceNotification
              openModal={showNotification}
              setOpenModal={setShowNotification}
              title={modalTitle}
              subtitle={modalSubtitle}
              description={modalDescription}
              buttonText={modalButtonText}
              onConfirm={modalOnConfirm}
            />
          </View>

          {confirmDelte && (
            <View flex={1} justifyContent="center" alignItems="center" backgroundColor="white">
              {console.log('Modal de apagar carrinho sendo renderizado')}
              <Modal transparent>
                <View
                  flex={1}
                  justifyContent="center"
                  alignItems="center"
                  backgroundColor="rgba(0, 0, 0, 0.9)"
                >
                  <View
                    maxWidth={400}
                    width="90%"
                    backgroundColor="white"
                    padding={20}
                    borderRadius={10}
                    alignItems="center"
                    justifyContent="center"
                  >
                    <View
                      flexDirection="row"
                      marginBottom={15}
                      alignItems="flex-start"
                      justifyContent="flex-start"
                      width="100%"
                    >
                      <View flex={1}>
                        <Text fontSize={22}>Apagar carrinho</Text>
                      </View>
                    </View>
                    <View marginBottom={20} width="100%">
                      <Text fontSize={16} marginBottom={5}>
                        Deseja apagar o carrinho e remover todos os produtos adicionados?
                      </Text>
                      <Text fontSize={10} color="gray" textAlign="left">
                        Esta ação não poderá ser desfeita
                      </Text>
                    </View>
                    <View
                      gap={5}
                      flexDirection="row"
                      justifyContent="space-between"
                      width="100%"
                      alignItems="center"
                    >
                      <TouchableOpacity style={{ flex: 1 }}>
                        <Button backgroundColor="#04BF7B" onPress={() => setConfirmDelete(false)}>
                          <Text color="white" textAlign="center">
                            Cancelar
                          </Text>
                        </Button>
                      </TouchableOpacity>
                      <TouchableOpacity style={{ flex: 1 }}>
                        <Button
                          backgroundColor="black"
                          onPress={async () => {
                            setLoading(true);
                            const token = await getToken();
                            const restaurant = await getStorageRestaurant();
                            if (!token || !restaurant) return [];
                            await fetch(`${process.env.EXPO_PUBLIC_API_URL}/cart/delete-by-id`, {
                              method: 'POST',
                              headers: {
                                'Content-Type': 'application/json',
                              },
                              body: JSON.stringify({
                                token,
                                selectedRestaurant: { id: restaurant.id },
                              }),
                            });
                            deleteStorage(`cart_${restaurant?.externalId}`);
                            setConfirmDelete(false); // Adicionar para garantir que o modal seja fechado
                            router.push('products');
                          }}
                        >
                          <Text color="white" textAlign="center">
                            Apagar
                          </Text>
                        </Button>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              </Modal>
            </View>
          )}
          {confirmDeleteItem && (
            <View flex={1} justifyContent="center" alignItems="center" backgroundColor="white">
              <Modal transparent>
                <View
                  flex={1}
                  justifyContent="center"
                  alignItems="center"
                  backgroundColor="rgba(0, 0, 0, 0.9)"
                >
                  <View
                    maxWidth={400}
                    width="90%"
                    backgroundColor="white"
                    padding={20}
                    borderRadius={10}
                    alignItems="center"
                    justifyContent="center"
                  >
                    <View
                      flexDirection="row"
                      marginBottom={15}
                      alignItems="flex-start"
                      justifyContent="flex-start"
                      width="100%"
                    >
                      <Text flex={1} fontSize={22}>
                        Remover item
                      </Text>
                    </View>
                    <View marginBottom={20} width="100%">
                      <Text fontSize={16} marginBottom={5}>
                        Deseja remover o item do carrinho?
                      </Text>
                      <Text fontSize={10} color="gray" textAlign="left">
                        Esta ação não poderá ser desfeita
                      </Text>
                    </View>
                    <View gap={5} flexDirection="row" justifyContent="space-between" width="100%">
                      <TouchableOpacity style={{ flex: 1 }}>
                        <Button
                          backgroundColor="#04BF7B"
                          onPress={() => setConfirmDeleteItem(false)}
                        >
                          <Text color="white" textAlign="center">
                            Cancelar
                          </Text>
                        </Button>
                      </TouchableOpacity>
                      <TouchableOpacity style={{ flex: 1 }}>
                        <Button
                          backgroundColor="black"
                          onPress={async () => {
                            setLoading(true);
                            if (itemToDelete != null) deleteItemFromCart(itemToDelete);
                          }}
                        >
                          <Text color="white" textAlign="center">
                            Remover
                          </Text>
                        </Button>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              </Modal>
            </View>
          )}
        </View>
      </Stack>
    </PageContainer>
  );
});
