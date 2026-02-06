import { Supplier } from '@/app/prices';
import { ConectarPlusSupplier } from '@/app/quotationDetailsScreen';
import axios, { HttpStatusCode } from 'axios';
import { CombinationMissingProducts } from '../types/combinationTypes';
import { CancelationOrderErrorKind, CancelOrderResult } from '../types/cancelOrderTypes';
import { getToken } from '../utils/utils';

const API_URL = process.env.EXPO_PUBLIC_API_URL;

export const getOrders = async (page = 1, limit = 200, restaurantId: string) => {
  try {
    const response = await axios.get(`${API_URL}/orders/filter`, {
      params: {
        restaurantId,
        page,
        limit,
      },
    });

    return response.data.orders;
  } catch (error) {
    console.error('Erro ao buscar pedidos:', error);
    throw error;
  }
};

export const getOrder = async (orderId: string) => {
  try {
    if (!orderId) {
      throw new Error('Pedido selecionado não encontrado.');
    }

    const response = await axios.get(`${API_URL}/orders/${orderId}`);
    return response.data;
  } catch (error) {
    console.error('Erro ao buscar pedido:', error);
    throw error;
  }
};

export const cancelOrder = async (orderId: string): Promise<CancelOrderResult> => {
  try {
    if (!orderId) {
      throw new Error('Pedido selecionado não encontrado.');
    }

    const token = await getToken();
    const headers = { authorization: `Bearer ${token}` };

    await axios.delete(`${API_URL}/orders/${orderId}/cancel`, { headers });

    return { success: true };
  } catch (error: any) {
    if (error.response) {
      const { status } = error.response;
      const message = error.response.data?.msg ?? 'Não foi possível cancelar o pedido.';

      if (status === HttpStatusCode.BadRequest) {
        return {
          success: false,
          kind: CancelationOrderErrorKind.BUSINESS,
          statusCode: status,
          message,
        };
      }

      if (status === HttpStatusCode.NotFound) {
        return {
          success: false,
          kind: CancelationOrderErrorKind.NOT_FOUND,
          statusCode: status,
          message,
        };
      }

      return {
        success: false,
        kind: CancelationOrderErrorKind.TECHNICAL,
        statusCode: status,
        message,
      };
    }

    return {
      success: false,
      kind: CancelationOrderErrorKind.TECHNICAL,
      message: 'Erro de conexão. Tente novamente mais tarde',
    };
  }
};

export interface ConfirmOrderRequestBody {
  token: string;
  supplier: Supplier;
  restaurant: any;
  appVersion: string;
  deliveryDate?: string | undefined | null;
}

export const confirmOrder = async (body: ConfirmOrderRequestBody) => {
  try {
    const response = await axios.post(`${API_URL}/confirm`, body, {
      headers: { 'Content-Type': 'application/json' },
    });
    return response;
  } catch (error) {
    console.error('Erro ao confirmar pedido:', error);
    throw error;
  }
};

export interface ConfirmPremiumOrderRequestBody {
  token: string | null | undefined;
  selectedRestaurant: any;
  deliveryDate?: string | undefined | null;
}

export const confirmPremiumOrder = async (body: ConfirmPremiumOrderRequestBody) => {
  try {
    const response = await axios.post(`${API_URL}/confirm/premium`, body, {
      headers: { 'Content-Type': 'application/json' },
    });
    return response;
  } catch (error) {
    console.error('Erro ao confirmar pedido Premium:', error);
    throw error;
  }
};

export interface ConfirmConectarPlusOrderRequestBody {
  token: string;
  suppliers: ConectarPlusSupplier[];
  restaurant: any;
  deliveryDate: string;
  appVersion: string;
  missingProducts: CombinationMissingProducts[];
}

export const confirmConectarPlusOrder = async (body: ConfirmConectarPlusOrderRequestBody) => {
  try {
    const response = await axios.post(`${API_URL}/confirm/conectar-plus`, body, {
      headers: { 'Content-Type': 'application/json' },
    });
    return response;
  } catch (error) {
    console.error('Erro ao confirmar pedido Conéctar+:', error);
    throw error;
  }
};
