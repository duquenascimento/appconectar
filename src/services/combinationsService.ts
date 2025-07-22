import axios from 'axios';
const API_URL = process.env.EXPO_PUBLIC_API_DBCONECTAR_URL;

export const getCombinationsByRestaurant = async (restaurantId: string) => {
  const response = await axios.get(`${API_URL}/system/combinacao/${restaurantId}`);
  return response.data;
};

export interface CombinationApiResponse {
  id: string;
  nome: string;
  restaurant_id: string;
  created_at: string;
  updated_at: string;
  bloquear_fornecedores: boolean;
  dividir_em_maximo: number;
  preferencia_fornecedor_tipo: string[];
  definir_preferencia_produto: boolean;
  preferencias_hard: boolean;
}