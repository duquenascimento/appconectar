import axios from 'axios';
import { handleHttpException } from '../utils/errorUtils';
import { PixCharge, PixChargeCreateDto } from '../types/pixTypes';
import { getTokenHeader } from '../utils/requestUtils';

const API_URL = process.env.EXPO_PUBLIC_API_URL;

export async function createPixCharge(data: PixChargeCreateDto) {
  try {
    const response = await axios.post(`${API_URL}/pix/charge`, data, {
      headers: await getTokenHeader(),
    });
    return response.data;
  } catch (error) {
    console.error(error);
    const formattedError = handleHttpException(error);
    throw formattedError;
  }
}

export async function getQrCode(id: string): Promise<PixCharge> {
  try {
    const response = await axios.get(`${API_URL}/pix/${id}`, {
      headers: await getTokenHeader(),
    });
    return response.data;
  } catch (error) {
    console.error(error);
    const formattedError = handleHttpException(error);
    throw formattedError;
  }
}

export async function getPixChargeByOrderId(orderId: string): Promise<PixCharge> {
  try {
    const response = await axios.get(`${API_URL}/pix/order/${orderId}`, {
      headers: await getTokenHeader(),
    });
    return response.data;
  } catch (error) {
    console.error(error);
    const formattedError = handleHttpException(error);
    throw formattedError;
  }
}
