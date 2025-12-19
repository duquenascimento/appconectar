import { CartProduct } from '../types/cartTypes';
import { getToken } from '../utils/utils';

const API_URL = process.env.EXPO_PUBLIC_API_URL;

export async function getCartProducts(restaurantId: string): Promise<CartProduct[]> {
  const token = await getToken();
  const result = await fetch(`${API_URL}/cart/full-list`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      token,
      selectedRestaurant: { id: restaurantId },
    }),
  });
  if (!result.ok) return [];
  const cart = await result.json();
  return cart.data;
}
