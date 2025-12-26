import axios, { HttpStatusCode } from 'axios';
import { SupplierData, SuppliersQuotationDTO } from '../types/types';
import { handleHttpException } from '../utils/errorUtils';
import { getToken } from '../utils/utils';
import { Restaurant } from '../types/restaurantTypes';

const API_URL = process.env.EXPO_PUBLIC_API_URL;

export type SupplierPriceRequestBody = {
  deliveryDate: string;
  selectedRestaurant: Restaurant;
};

export const getSuppliersPrices = async (data: SupplierPriceRequestBody): Promise<SuppliersQuotationDTO> => {
  try {
    const token = await getToken();
    if (!token) throw new Error('Token not found');

    const body = {
      token,
      selectedRestaurant: data.selectedRestaurant,
      deliveryDate: data.deliveryDate,
    };

    const response = await axios.post(
      `${API_URL}/price/list`,
      body,
      { headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` } }
    );

    console.log('Response getSuppliersPrices:', response);

    if (response.status == HttpStatusCode.Ok) {
      const quotationData = response.data.data as SuppliersQuotationDTO;
      return quotationData;
    }

    throw Error(response?.data?.msg ?? 'Ocorreu um erro ao buscar os preços');
  } catch (error) {
    throw handleHttpException(error);
  }
}

export type PricesBySupplierOrCombinationBody = {
  restaurantId: string;
  supplierExternalId?: string;
  combinationId?: string;
  deliveryDate: string;
  products: {
    id: string;
    sku: string;
    amount: number;
    obs?: string | null;
  }[];
};

export async function getPricesBySupplierOrCombination(
  data: PricesBySupplierOrCombinationBody,
): Promise<SupplierData[]> {
  try {
    const token = await getToken();
    if (!token) throw new Error('Token not found');

    const response = await axios.post(
      `${API_URL}/prices_by_suppliers`,
      data,
      { headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` } }
    );

    if (response.status == HttpStatusCode.Ok) {
      return response.data.data;
    }

    throw Error(response?.data?.msg ?? 'Ocorreu um erro ao buscar os preços');
  } catch (error) {
    throw handleHttpException(error);
  }
}
