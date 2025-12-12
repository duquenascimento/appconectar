import { SupplierData } from '../types/types';
import { handleHttpException } from '../utils/errorUtils';
import { getToken } from '../utils/utils';

const API_URL = process.env.EXPO_PUBLIC_API_URL;

export type SupplierPriceRequestBody = {
  deliveryDate: string;
  restaurant: {
    id: string;
    externalId: string;
    tax: number;
    addressInfos: {
      id: string;
      neighborhood: string;
      initialDeliveryTime: string;
      finalDeliveryTime: string;
    }[];
  };
};

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

export async function getSuppliersPrices(data: SupplierPriceRequestBody): Promise<SupplierData[]> {
  try {
    const token = await getToken();
    const result = await fetch(`${API_URL}/price/list`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        token,
        selectedRestaurant: {
          ...data.restaurant,
        },
        deliveryDate: data.deliveryDate,
      }),
    });

    const response = await result.json();
    return response.data;
  } catch (error) {
    throw handleHttpException(error);
  }
}

export async function getPricesBySupplierOrCombination(
  data: PricesBySupplierOrCombinationBody,
): Promise<SupplierData[]> {
  try {
    const result = await fetch(`${API_URL}/prices_by_suppliers`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${await getToken()}` },
      body: JSON.stringify(data),
    });
    const response = await result.json();
    if (result.status == 200) {
      return response.data;
    }
    throw Error(response?.msg ?? 'Ocorreu um erro ao buscar os preços');
  } catch (error) {
    throw handleHttpException(error);
  }
}
