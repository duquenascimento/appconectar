import axios from 'axios';
import { CheckDocumentResult, RestaurantRegisterPayload } from '../types/registerTypes';
import { getToken } from '../utils/utils';

const API_URL = process.env.EXPO_PUBLIC_API_URL;

export async function saveRegisterProgress(step: number, values: any): Promise<void> {
  try {
    const token = await getToken();
    if (!token) {
      throw new Error('Token not found');
    }

    await axios.post(
      `${API_URL}/register/save-progress`,
      { step, values },
      { headers: { Authorization: `Bearer ${token}` } }
    );
  } catch (error: any) {
    throw error;
  }
}

export async function getRegisterProgress(): Promise<any> {
  try {
    const token = await getToken();
    if (!token) {
      throw new Error('Token not found');
    }

    const response = await axios.get(
      `${API_URL}/register/progress`,
      {
        headers: { Authorization: `Bearer ${token}` },
        validateStatus: (status) => status === 200 || status === 204,
      },
    );

    if (response.status === 204) {
      return { statusCode: 204 };
    }

    return response.data;
  } catch (error: any) {
    throw error;
  }
}

export async function sendFullRegister(data: RestaurantRegisterPayload): Promise<void> {
  try {
    const token = await getToken();
    if (!token) {
      throw new Error('Token not found');
    }

    await axios.post(
      `${API_URL}/register/full-register`,
      { ...data, token },
      { headers: { Authorization: `Bearer ${token}` } }
    );
  } catch (error: any) {
    throw error;
  }
}

export async function checkDocument(document: string): Promise<CheckDocumentResult> {
  try {
    const response = await axios.post<CheckDocumentResult>(
      `${API_URL}/register/checkDocument`,
      { document }
    );
    return response.data;
  } catch (error: any) {
    throw error;
  }
}
