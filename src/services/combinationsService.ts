import axios from 'axios';
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

export interface QuotationApiResponse {
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
        cart:[
          {
            productId: string;
            amount: number;
            value: number;
            valueWithoutFee: number;
            unitValue: number;
            unitValueWithoutFee: number;
          }
        ]
      }
    ]
    status: string;
    terminationCondition: string;
  };
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
  const response = await axios.get(`${API_URL}/getCombination/${restaurantId}`);
  return response.data;
};

export const getAllQuotationByRestaurant = async (body: QuotationApiRequest) => {
  try {
    const response = await axios.post(
      `${process.env.EXPO_PUBLIC_API_URL}/calcQuotation`,
      body
    );
    return response.data;
  } catch (error) {
    console.error('Erro ao obter cotações por restaurante:', error);
    throw error;
  }
};

export const getAllCombinationsByRestaurant = async (restaurantId: string) => {
  const response = await axios.post(`${process.env.EXPO_PUBLIC_API_URL}/getQuotation`);
  return response.data;
};