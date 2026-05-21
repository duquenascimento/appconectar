import axios from 'axios';
import { Combinacao } from '../types/combinationTypes';
import { SameDayOrder } from '../types/types';
import { getToken } from '../utils/utils';

const API_URL = process.env.EXPO_PUBLIC_API_URL;
const API_DBCONECTAR_URL = process.env.EXPO_PUBLIC_API_DBCONECTAR_URL;

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
        ];
        sameDayOrders: SameDayOrder[];
      },
    ];
    missingProducts: string[];
    status: string;
    terminationCondition: string;
  };
}

export interface QuotationApiResponse {
  availableCombinations: QuotationApiResponseData[];
  unavailableCombinations: QuotationApiResponseData[];
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
  deliveryDate: string;
}

export const getCombinationsByRestaurant = async (restaurantId: string) => {
  const response = await axios.get(`${API_URL}/combination/${restaurantId}`, {
    headers: { Authorization: `Bearer ${await getToken()}` },
  });
  return response.data;
};

export const getAllQuotationByRestaurant = async (
  body: QuotationApiRequest,
): Promise<QuotationApiResponse> => {
  try {
    const response = await axios.post(`${API_URL}/cotacao/calcular`, body, {
      headers: { Authorization: `Bearer ${await getToken()}` },
    });
    return response.data.data;
  } catch (error) {
    console.error('Erro ao obter cotações por restaurante:', error);
    throw error;
  }
};

export const getAllCombinationsByRestaurant = async (restaurantId: string) => {
  const response = await axios.get(`${API_URL}/combination/${restaurantId}`, {
    headers: { Authorization: `Bearer ${await getToken()}` },
  });
  return response.data;
};

export interface GetCombinationSuppliersRequestDTO {
  city: string;
  neighborhood: string;
  blockedBySuppliers: string[];
}

export interface CombinationSupplierDTO {
  id: string;
  externalId: string;
  name: string;
  rating: string;
  isAvailable: boolean;
  openingTime: string;
}

export interface GetCombinationSuppliersResponseDTO {
  success: boolean;
  data: CombinationSupplierDTO[];
}

export const getCombinationSuppliers = async (
  dto: GetCombinationSuppliersRequestDTO
): Promise<CombinationSupplierDTO[]> => {
  const response = await axios.get<GetCombinationSuppliersResponseDTO>(
    `${API_DBCONECTAR_URL}/system/combinacao/fornecedores`,
    {
      params: dto,
      headers: { Authorization: `Bearer ${await getToken()}` }
    },
  );
  return response.data.data;
};

export const getDefaultCombinations = async (): Promise<Combinacao[]> => {
  const response = await axios.get(`${API_URL}/combination_default`, {
    headers: { Authorization: `Bearer ${await getToken()}` },
  });
  return response.data.data;
};
