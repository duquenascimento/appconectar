import axios from 'axios';
import { QuotationResquestBody } from '../types/quotationTypes';
import { SuppliersQuotationDTO } from '../types/types';
import { getToken } from '../utils/utils';
import { QuotationApiResponse } from './combinationsService';

const API_URL = process.env.EXPO_PUBLIC_API_URL;

export const getQuotationsByCombination = async (
  body: QuotationResquestBody,
): Promise<QuotationApiResponse> => {
  try {
    const response = await axios.post(`${API_URL}/quote/combination`, body, {
      headers: { Authorization: `Bearer ${await getToken()}` },
    });
    return response.data.data;
  } catch (error) {
    console.error('Erro ao obter cotações por combinação:', error);
    throw error;
  }
};

export const getQuotationsBySupplier = async (
  body: QuotationResquestBody,
): Promise<SuppliersQuotationDTO> => {
  try {
    const response = await axios.post(`${API_URL}/quote/supplier`, body, {
      headers: { Authorization: `Bearer ${await getToken()}` },
    });
    return response.data.data ?? { availableSuppliers: [], combinations: [] };
  } catch (error) {
    console.error('Erro ao obter cotações por fornecedor:', error);
    throw error;
  }
};
