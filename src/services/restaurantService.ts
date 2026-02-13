import axios from 'axios';
import { getToken } from '../utils/utils';
import { Restaurant } from '../types/restaurantTypes';

const API_URL = process.env.EXPO_PUBLIC_API_URL;

export const loadPermissionConectarPlus = async (externalId: string) => {
  try {
    const token = await getToken();
    if (!token) {
      return { authorized: false };
    }
    const response = await fetch(`${API_URL}/restaurant/conectar-plus/${externalId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${await getToken()}`,
      },
    });
    if (!response.ok) {
      console.warn('Falha na resposta da API:', response.status);
      return { authorized: false };
    }
    const data = await response.json();
    return { authorized: Boolean(data?.data?.authorized) };
  } catch (error) {
    console.error('Erro ao carregar permissão:', error);
    return { authorized: false };
  }
};

export const getMaxSpecificSuppliersNumber = async (externalId: string) => {
  try {
    const response = await axios.get(
      `${API_URL}/restaurant/get-max-specific-suppliers/${externalId}`,
      {
        headers: { Authorization: `Bearer ${await getToken()}` },
      }
    );
    return response.data.data;
  } catch (error) {
    console.error('Erro ao buscar lista de fornecedores:', error);
    throw error;
  }
};

export async function getUserRestaurants(): Promise<Restaurant[]> {
  try {
    const token = await getToken();
    const response = await axios.post(`${API_URL}/restaurant/list`, JSON.stringify({ token }), {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return response.data.data;
  } catch (error) {
    console.error('Erro ao buscar restaurantes:', error);
    throw error;
  }
}

export const updateRestaurantDeliveryInfo = async (
  restaurantId: string,
  data: Partial<Restaurant>,
) => {
  try {
    await fetch(`${API_URL}/address/update`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        restaurantId,
        ...data,
      }),
    });
  } catch (error) {
    console.error('Falha ao atualizar dados de restaurante', error);
  }
};
