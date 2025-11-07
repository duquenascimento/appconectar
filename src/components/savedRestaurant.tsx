import { getStorage } from '../utils/utils';

interface Restaurant {
  externalId: any;
  id: string;
  name: string;
  registrationReleasedNewApp: boolean;
}

export const getSavedRestaurant = async (): Promise<Restaurant | null> => {
  try {
    const data = await getStorage('selectedRestaurant');
    if (!data) return null;

    const parsedData = JSON.parse(data);

    if (!parsedData?.restaurant) {
      console.error('Formato inválido:', parsedData);
      return null;
    }

    return parsedData.restaurant;
  } catch (error) {
    console.error('Erro ao parsear dados:', error);
    return null;
  }
};
