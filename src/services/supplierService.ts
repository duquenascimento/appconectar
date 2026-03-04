import axios from 'axios';
import { GetAllSuppliersParams, CombinationSupplier } from '../types/suppliersDataTypes';

const API_URL = process.env.EXPO_PUBLIC_API_DBCONECTAR_URL;

export const getAllSuppliers = async (params?: GetAllSuppliersParams): Promise<CombinationSupplier[]> => {
  try {
    const queryParams: GetAllSuppliersParams = {
      orderBy: params?.orderBy ?? 'nomefornecedor',
      order: params?.order ?? 'asc',
      routeFilters: params?.routeFilters,
    };
    const response = await axios.get(`${API_URL}/system/fornecedores`, { params: queryParams });
    return response.data.data as CombinationSupplier[];
  } catch (error) {
    console.error('Erro ao buscar fornecedores:', error);
    throw error;
  }
}
