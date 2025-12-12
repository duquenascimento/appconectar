import { Supplier } from '@/app/prices'
import { ConectarPlusSupplier } from '@/app/quotationDetailsScreen'
import axios from 'axios'

const API_URL = process.env.EXPO_PUBLIC_API_URL

export const getOrders = async (
  page = 1,
  limit = 200,
  restaurantId: string
) => {
  try {
    const response = await axios.get(`${API_URL}/orders/filter`, {
      params: {
        restaurantId,
        page,
        limit
      }
    })

    return response.data.orders
  } catch (error) {
    console.error('Erro ao buscar pedidos:', error)
    throw error
  }
}

export const getOrder = async (orderId: string) => {
  try {
    if (!orderId) {
      throw new Error('Pedido selecionado não encontrado.')
    }

    const response = await axios.get(`${API_URL}/orders/${orderId}`)
    return response.data.data
  } catch (error) {
    console.error('Erro ao buscar pedido:', error)
    throw error
  }
}

export const cancelOrder = async (orderId: string) => {
  try {
    if (!orderId) {
      throw new Error('Pedido selecionado não encontrado.')
    }
    const response = await axios.put(`${API_URL}/orders/${orderId}/cancel`)
    return response.data
  } catch (error) {
    console.error('Erro ao cancelar pedido:', error)
    if ((error as { response: { data: { msg: string } } }).response.data.msg) {
      return 'too late'
    }
    throw error
  }
}

export interface ConfirmOrderRequestBody {
  token: string;
  supplier: Supplier;
  restaurant: any;
  deliveryDate: string;
}

export const confirmOrder = async (body: ConfirmOrderRequestBody) => {
  try {
    const response = await axios.post(
      `${API_URL}/confirm`,
      body,
      { headers: { 'Content-Type': 'application/json' } }
    );
    return response;
  } catch (error) {
    console.error('Erro ao confirmar pedido:', error);
    throw error;
  }
}

export interface ConfirmPremiumOrderRequestBody {
  token: string | null | undefined;
  selectedRestaurant: any;
  deliveryDate: string;
}

export const confirmPremiumOrder = async (body: ConfirmPremiumOrderRequestBody) => {
  try {
    const response = await axios.post(
      `${API_URL}/confirm/premium`,
      body,
      { headers: { 'Content-Type': 'application/json' } }
    );
    return response;
  } catch (error) {
    console.error('Erro ao confirmar pedido Premium:', error);
    throw error;
  }
}

export interface ConfirmConectarPlusOrderRequestBody {
  token: string;
  suppliers: ConectarPlusSupplier[];
  restaurant: any;
  deliveryDate: string;
}

export const confirmConectarPlusOrder = async (body: ConfirmConectarPlusOrderRequestBody) => {
  try {
    const response = await axios.post(
      `${API_URL}/confirm/conectar-plus`,
      body,
      { headers: { 'Content-Type': 'application/json' } }
    );
    return response
  } catch (error) {
    console.error('Erro ao confirmar pedido Conéctar+:', error);
    throw error;
  }
}