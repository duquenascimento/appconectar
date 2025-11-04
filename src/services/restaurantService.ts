import axios from 'axios';
import { getToken } from '../utils/utils';

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
    const response = await axios.get(`${API_URL}/restaurant/get-max-specific-suppliers/${externalId}`);
    return response.data.data
  } catch (error) {
    console.error('Erro ao buscar lista de fornecedores:', error)
    throw error
  }
}