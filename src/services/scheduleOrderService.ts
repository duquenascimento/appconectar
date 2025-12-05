import axios, { Axios } from 'axios';
import {
  ScheduleOrderConfirmationBody,
  ScheduleOrderCreationBody,
  ScheduleOrderResponse,
} from '../types/scheduleOrderTypes';
import { getToken } from '../utils/utils';
import { handleHttpException } from '../utils/errorUtils';

const API_URL = process.env.EXPO_PUBLIC_API_URL;

export async function createScheduleOrder(
  body: ScheduleOrderCreationBody,
): Promise<ScheduleOrderResponse> {
  try {
    const response = await axios.post(`${API_URL}/schedule`, body, {
      headers: {
        Authorization: `Bearer ${await getToken()}`,
      },
    });

    return response.data.data;
  } catch (error) {
    throw handleHttpException(error);
  }
}

export async function getAllScheduleOrders(): Promise<ScheduleOrderResponse[]> {
  try {
    const response = await axios.get(`${API_URL}/schedule`, {
      headers: {
        Authorization: `Bearer ${await getToken()}`,
      },
    });
    return response.data.data;
  } catch (error) {
    throw handleHttpException(error);
  }
}

export async function getScheduleOrder(id: string): Promise<ScheduleOrderResponse> {
  try {
    const response = await axios.get(`${API_URL}/schedule/${id}`, {
      headers: {
        Authorization: `Bearer ${await getToken()}`,
      },
    });
    return response.data.data;
  } catch (error) {
    throw handleHttpException(error);
  }
}

export async function editScheduleOrder(
  id: string,
  body: Partial<Omit<ScheduleOrderCreationBody, 'restaurantId'>>,
) {
  try {
    const response = await axios.put(`${API_URL}/schedule/${id}`, body, {
      headers: {
        Authorization: `Bearer ${await getToken()}`,
      },
    });

    return response.data.data;
  } catch (error) {
    throw handleHttpException(error);
  }
}

export async function deleteScheduleOrder(id: string): Promise<any> {
  try {
    const response = await axios.delete(`${API_URL}/schedule/${id}`, {
      headers: {
        Authorization: `Bearer ${await getToken()}`,
      },
    });

    return response.data.data;
  } catch (error) {
    throw handleHttpException(error);
  }
}

export async function confirmScheduleOrder(id: string, body: ScheduleOrderConfirmationBody) {
  try {
    const response = await axios.post(`${API_URL}/schedule/${id}/confirm`, body, {
      headers: {
        Authorization: `Bearer ${await getToken()}`,
      },
    });

    return response.data.data;
  } catch (error) {
    throw handleHttpException(error);
  }
}
