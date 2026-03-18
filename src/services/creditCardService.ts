import axios from "axios";
import { getToken } from "../utils/utils";
import { CreateCreditCardDto, CreditCard } from "../types/paymentTypes";

const API_URL = process.env.EXPO_PUBLIC_API_URL;

export const createCreditCard = async (creditCard: CreateCreditCardDto): Promise<string[]> => {
  try {
    const response = await axios.post(
      `${API_URL}/payments/credit-card`,
      creditCard,
      { headers: { 'Authorization': `Bearer ${await getToken()}` } }
    );
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(error.response.data.msg || 'Erro ao obter datas de entrega disponíveis');
    }

    throw error;
  }
};

export const getCreditCards = async (restaurantId: String): Promise<CreditCard[]> => {
  try {
    const response = await axios.get(
      `${API_URL}/payments/credit-card/${restaurantId}`,
      { headers: { 'Authorization': `Bearer ${await getToken()}` } }
    );
    return response.data.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(error.response.data.msg || 'Erro ao obter datas de entrega disponíveis');
    }

    throw error;
  }
};
