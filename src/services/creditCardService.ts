import axios from "axios";
import { getToken } from "../utils/utils";
import { CreateCreditCardDto, CreditCard } from "../types/creditCardTypes";
import { ApiException } from "../utils/errorUtils";

const API_URL = process.env.EXPO_PUBLIC_API_URL;

export const createCreditCard = async (creditCard: CreateCreditCardDto): Promise<CreditCard> => {
  try {
    const response = await axios.post<{status: number, data: CreditCard}>(
      `${API_URL}/payments/credit-card`,
      creditCard,
      { headers: { 'Authorization': `Bearer ${await getToken()}` } }
    );
    return response.data.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      throw new ApiException(error.response.data.msg || 'Erro ao criar cartão de crédito', error.response.status);
    }

    throw error;
  }
};

export const getCreditCards = async (restaurantId: String): Promise<CreditCard[]> => {
  try {
    const response = await axios.get<{status: number, data: CreditCard[]}>(
      `${API_URL}/payments/credit-card/${restaurantId}`,
      { headers: { 'Authorization': `Bearer ${await getToken()}` } }
    );
    return response.data.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(error.response.data.msg || 'Erro ao consultar cartões de crédito disponíveis', { cause: error });
    }

    throw error;
  }
};
