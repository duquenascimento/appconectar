import axios from 'axios';

const API_URL = process.env.EXPO_PUBLIC_API_URL;

export type PromoterLookup =
  | { status: 'found'; name: string }
  | { status: 'not_found' }
  | { status: 'unconfirmed' };

export async function getPromoterNameByCode(code: string): Promise<PromoterLookup> {
  if (!code) return { status: 'not_found' };

  try {
    const response = await axios.get(`${API_URL}/register/promoter-name`, {
      params: { code },
    });
    const name = response.data?.data?.name;

    if (name === null) return { status: 'not_found' };
    if (typeof name === 'string' && name.trim()) return { status: 'found', name };
    return { status: 'unconfirmed' };
  } catch (error) {
    console.error('Erro ao buscar nome do promotor pelo código de indicação', error);
    return { status: 'unconfirmed' };
  }
}
