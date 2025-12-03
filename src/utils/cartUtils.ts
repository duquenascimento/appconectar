import { TCart } from '../types/cartTypes';
import { getStorageRestaurant } from './restaurantUtils';
import { getStorage, getToken } from './utils';

// Retorna os produtos do carrinho
export async function loadCart(): Promise<Map<string, TCart>> {
  try {
    const token = await getToken();
    const restaurant = await getStorageRestaurant();
    if (!token || !restaurant) return new Map();

    const result = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/cart/list`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ token, selectedRestaurant: { id: restaurant.id } }),
    });

    if (!result.ok) return new Map();

    const cart = await result.json();
    if (!cart.data || cart.data.length < 1) return new Map();

    const cartMap = new Map<string, TCart>(cart.data.map((item: TCart) => [item.productId, item]));

    const localCartString = await getStorage('cart');
    const localCart = localCartString
      ? new Map<string, TCart>(JSON.parse(localCartString))
      : new Map();
    localCart.forEach((value, key) => {
      cartMap.set(key, value);
    });

    return cartMap;
  } catch (error) {
    console.error('Erro ao carregar carrinho:', error);
    return new Map();
  }
}
