import { getToken } from './utils';
import { getSavedRestaurant } from './savedRestaurant';
import { Favorites } from '../types/favoriteTypes';

/**
 * Carrega a lista de favoritos do usuário para um restaurante específico.
 * @returns {Promise<any[]>} Lista de produtos favoritos ou array vazio em caso de erro.
 */
export const loadFavorites = async (): Promise<Favorites[]> => {
  try {
    const token = await getToken();
    const restaurant = await getSavedRestaurant();
    if (!token || !restaurant) {
      return [];
    }

    const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/favorite/list`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        token,
        restaurantId: restaurant.id,
      }),
    });

    if (!response.ok) {
      console.warn('Falha ao carregar favoritos:', response.status);
      return [];
    }

    const data = await response.json();

    return Array.isArray(data.data) ? data.data : [];
  } catch (error) {
    console.error('Erro ao carregar favoritos:', error);
    return [];
  }
};
