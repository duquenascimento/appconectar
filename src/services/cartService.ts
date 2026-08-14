import axios from 'axios';
import { CartProduct, TCart } from '../types/cartTypes';
import { getToken } from '../utils/utils';

const API_URL = process.env.EXPO_PUBLIC_API_URL;

export async function getCartProducts(restaurantId: string): Promise<CartProduct[]> {
  const token = await getToken();
  try {
    const result = await axios.post<{ data: CartProduct[] }>(
      `${API_URL}/cart/full-list`,
      {
        token,
        selectedRestaurant: { id: restaurantId },
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      },
    );

    return result.data.data;
  } catch (error) {
    console.error('Erro ao buscar produtos do carrinho:', error);
    return [];
  }
}

export async function getCartList(restaurantId: string): Promise<TCart[]> {
  const token = await getToken();
  try {
    const result = await axios.post(
      `${process.env.EXPO_PUBLIC_API_URL}/cart/list`,

      { token, selectedRestaurant: { id: restaurantId } },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      },
    );

    return result.data.data;
  } catch (error) {
    console.error('Erro ao buscar produtos do carrinho:', error);
    return [];
  }
}

