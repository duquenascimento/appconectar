import axios from "axios";
import { GetAvailableDeliveryDatesResponseDTO } from "../types/deliveryDateTypes";
import { getToken } from "../utils/utils";

const API_URL = process.env.EXPO_PUBLIC_API_URL

export const getAvailableDeliveryDatesByRestaurant = async (restaurantId: string): Promise<string[]> => {
  try {
    const response = await axios.get(
      `${API_URL}/available-delivery-dates/${restaurantId}`,
      { headers: { 'Authorization': `Bearer ${await getToken()}` } }
    );

    const deliveryDatesResponse: GetAvailableDeliveryDatesResponseDTO = response.data;

    return deliveryDatesResponse.data.availableDates;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(error.response.data.msg || 'Erro ao obter datas de entrega disponíveis');
    }

    throw error;
  }
};
