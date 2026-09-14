import axios from 'axios';

const API_URL = process.env.EXPO_PUBLIC_API_URL;

export async function getPromoterNameByCode(code: string): Promise<string | undefined> {
  if (!code) return undefined;

  try {
    const response = await axios.get(`${API_URL}/register/promoter-name`, {
      params: { code },
    });
    return response.data?.data?.name ?? undefined;
  } catch (error) {
    console.error('Erro ao buscar nome do promotor pelo código de indicação', error);
    return undefined;
  }
}
