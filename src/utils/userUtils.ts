import { getToken } from './utils';

export async function getUserData(): Promise<any> {
  try {
    const token = await getToken();

    const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/user`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();

    return data.data;
  } catch (error) {
    console.error('Falha ao buscar dados do usuáiro', error);
    throw error;
  }
}
