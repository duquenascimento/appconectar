import axios from 'axios';
import { SameDayOrder } from '../types/types';

const API_URL = process.env.EXPO_PUBLIC_API_URL;

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

export interface QuotationApiResponseData {
  id: string;
  nome: string;
  resultadoCotacao: {
    totalOrderValue: number;
    supplier: [
      {
        id: string;
        name: string;
        orderValue: number;
        orderValueWithoutFee: number;
        feeUsed: number;
        discountUsed: number;
        cart: [
          {
            productId: string;
            amount: number;
            value: number;
            valueWithoutFee: number;
            unitValue: number;
            unitValueWithoutFee: number;
          },
        ],
        sameDayOrders: SameDayOrder[];
      },
    ];
    missingProducts: string[];
    status: string;
    terminationCondition: string;
  };
}

export interface QuotationApiResponse {
  availableCombinations: QuotationApiResponseData[]
  unavailableCombinations: QuotationApiResponseData[]
}

export interface QuotationApiRequest {
  token?: string | null;
  selectedRestaurant: {
    externalId: string;
    id: string;
    addressInfos: any[];
  };
  cart: any[];
  prices: any[];
}

export const getCombinationsByRestaurant = async (restaurantId: string) => {
  const response = await axios.get(`${API_URL}/combination/${restaurantId}`);
  return response.data;
};

export const getAllQuotationByRestaurant = async (body: QuotationApiRequest): Promise<QuotationApiResponse> => {
  try {
    const response = await axios.post(`${process.env.EXPO_PUBLIC_API_URL}/cotacao/calcular`, body);
    return response.data.data;
  } catch (error) {
    console.error('Erro ao obter cotações por restaurante:', error);
    throw error;
  }
};

export const getAllCombinationsByRestaurant = async (restaurantId: string) => {
  const response = await axios.get(
    `${process.env.EXPO_PUBLIC_API_URL}/combination/${restaurantId}`,
  );
  return response.data;
};
