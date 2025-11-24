import { useState, useCallback, useEffect } from 'react';
import { Alert } from 'react-native';
import { getToken, getStorage, setStorage, deleteStorage } from '../utils/utils';
import { saveProductObservations } from '../utils/productObservation';
import { useRestaurantContext } from '../contexts/restaurant.context';

type Cart = {
  productId: string;
  amount: number;
  obs: string;
  addOrder: number;
};

export function useCart() {
  const [cart, setCart] = useState<Map<string, Cart>>(new Map());
  const [cartToExclude, setCartToExclude] = useState<Map<string, Cart>>(new Map());
  const [productObservations, setProductObservations] = useState(new Map<string, string>());
  const [displayedCartSize, setDisplayedCartSize] = useState(cart.size);
  const { selectedRestaurant } = useRestaurantContext();
  useEffect(() => {
    const timeout = setTimeout(() => {
      setDisplayedCartSize(cart.size);
    }, 100);

    return () => clearTimeout(timeout);
  }, [cart.size]);

  const loadCart = useCallback(async (): Promise<Map<string, Cart>> => {
    try {
      const token = await getToken();
      // const restaurant = await getSavedRestaurant();

      if (!token || !selectedRestaurant) return new Map();

      const result = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/cart/list`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, selectedRestaurant: { id: selectedRestaurant.id } }),
      });

      if (!result.ok) return new Map();

      const cart = await result.json();
      const cartMap = new Map<string, Cart>(cart.data.map((item: Cart) => [item.productId, item]));

      const localCartString = await getStorage(`cart_${selectedRestaurant?.externalId}`);
      const localCart = localCartString
        ? new Map<string, Cart>(JSON.parse(localCartString))
        : new Map();

      localCart.forEach((value, key) => {
        const serverItem = cartMap.get(key);
        if (serverItem && value.obs) {
          serverItem.obs = value.obs;
          cartMap.set(key, serverItem);
        }
      });

      await deleteStorage('cart-inside');
      await setStorage(
        `cart_${selectedRestaurant?.externalId}`,
        JSON.stringify(Array.from(cartMap.entries())),
      );
      setCart(cartMap);
      setDisplayedCartSize(cartMap.size);
      return cartMap;
    } catch (error) {
      console.error('Erro ao carregar carrinho:', error);
      return new Map();
    }
  }, [selectedRestaurant]);

  const saveCart = useCallback(async (cart: Cart, isCart: boolean) => {
    try {
      let newCart = new Map();
      // const restaurant = await getSavedRestaurant();
      if (!selectedRestaurant?.externalId) {
        console.warn('Restaurante não encontrado no storage.');
        return;
      }

      const attCart = async (): Promise<void> => {
        setCart((prevCart) => {
          newCart = new Map(prevCart);

          if (cart.amount === 0) {
            if (isCart) {
              newCart.delete(cart.productId);
              setCartToExclude((prevCartToExclude) => {
                const newCartToExclude = new Map(prevCartToExclude);
                newCartToExclude.set(cart.productId, cart);
                return newCartToExclude;
              });
            }
          } else {
            if (!newCart.has(cart.productId)) {
              const items = [...newCart].sort((a, b) => a[1].addOrder - b[1].addOrder);
              if (items.length === 0) {
                cart.addOrder = 1;
              } else {
                const lastItem = items[items.length - 1];
                cart.addOrder = lastItem[1].addOrder + 1;
              }
            } else {
              cart.addOrder = newCart.get(cart.productId)!.addOrder;
            }
            newCart.set(cart.productId, cart);
            setCartToExclude((prevCartToExclude) => {
              const newCartToExclude = new Map(prevCartToExclude);
              newCartToExclude.delete(cart.productId);
              return newCartToExclude;
            });
          }

          if (cart.obs) {
            setProductObservations((prev) => {
              const updated = new Map(prev);
              const latestObs = prev.get(cart.productId) ?? cart.obs;
              updated.set(cart.productId, latestObs);
              saveProductObservations(updated).catch((err) =>
                console.error('Erro ao salvar observações no AsyncStorage:', err),
              );
              return updated;
            });
          }

          return newCart;
        });
      };
      await attCart();

      if (cart.amount > 0) {
        await setStorage(
          `cart_${selectedRestaurant?.externalId}`,
          JSON.stringify(Array.from(newCart.entries())),
        );
      }
    } catch (err) {
      console.error('Erro ao salvar item no carrinho local:', err);
      Alert.alert('Erro', 'Não foi possível atualizar o carrinho localmente.');
    }
  }, []);

  const saveCartArray = useCallback(
    async (carts: Map<string, Cart>, cartsToExclude: Map<string, Cart>) => {
      try {
        const token = await getToken();
        // const restaurant = await getSavedRestaurant();
        if (!token || !selectedRestaurant) return;

        const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/cart/add`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            token,
            carts: Array.from(carts.values()),
            cartToExclude: Array.from(cartsToExclude.values()),
            selectedRestaurant: { id: selectedRestaurant.id },
          }),
        });

        if (!response.ok) {
          const errorBody = await response.json();
          console.error('Erro ao salvar carrinho em lote:', errorBody.msg);
        }

        setCartToExclude(new Map());
      } catch (err) {
        console.error('Erro inesperado em saveCartArray:', err);
      }
    },
    [],
  );

  return {
    cart,
    setCart,
    cartToExclude,
    setCartToExclude,
    productObservations,
    setProductObservations,
    loadCart,
    saveCart,
    saveCartArray,
    displayedCartSize,
    setDisplayedCartSize,
  };
}
