import axios from "axios";
import { QuotationResquestBody } from "../types/quotationTypes";
import { QuotationApiResponse } from "./combinationsService";
import { getToken } from "../utils/utils";
import { SuppliersQuotationDTO } from "../types/types";

const API_URL = process.env.EXPO_PUBLIC_API_URL

export const getQuotationsByCombination = async (body: QuotationResquestBody): Promise<QuotationApiResponse> => {
  try {
    const response = await axios.post(`${API_URL}/quote/combination`, body, { headers: { 'Authorization': `Bearer ${await getToken()}` } });
    return response.data.data;
  } catch (error: any) {
    // Handle specific admin-related errors
    if (error.response?.status === 403) {
      throw new Error('Acesso ao restaurante negado. Você não tem permissão para cotar este restaurante.');
    }
    
    // Handle empty results for retroactive dates
    if (error.response?.status === 404 || !error.response?.data?.data) {
      throw new Error('Nenhum dado histórico encontrado para a data selecionada.');
    }
    
    console.error('Erro ao obter cotações por combinação:', error);
    throw error;
  }
};

export const getQuotationsBySupplier = async (body: QuotationResquestBody): Promise<SuppliersQuotationDTO> => {
  try {
    const response = await axios.post(`${API_URL}/quote/supplier`, body, { headers: { 'Authorization': `Bearer ${await getToken()}` } });
    return response.data.data;
  } catch (error: any) {
    // Handle specific admin-related errors
    if (error.response?.status === 403) {
      throw new Error('Acesso ao restaurante negado. Você não tem permissão para cotar este restaurante.');
    }
    
    // Handle empty results for retroactive dates
    if (error.response?.status === 404 || !error.response?.data?.data) {
      throw new Error('Nenhum dado histórico encontrado para a data selecionada.');
    }
    
    console.error('Erro ao obter cotações por fornecedor:', error);
    throw error;
  }
};