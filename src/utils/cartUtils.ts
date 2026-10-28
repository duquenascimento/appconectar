import { getCartList } from '../services/cartService';
import { TCart } from '../types/cartTypes';
import { getStorageRestaurant } from './restaurantUtils';
import { getStorage, getToken } from './utils';

// Retorna os produtos do carrinho
export async function loadCart(): Promise<Map<string, TCart>> {
  try {
    const token = await getToken();
    const restaurant = await getStorageRestaurant();
    if (!token || !restaurant) return new Map();

    const cart = await getCartList(restaurant.id);

    if (!cart || cart.length < 1) return new Map();

    const cartMap = new Map<string, TCart>(cart.map((item: TCart) => [item.productId, item]));

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
