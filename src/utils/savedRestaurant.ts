import { getStorage } from './utils';

interface Restaurant {
  externalId: any;
  id: string;
  name: string;
  premium: boolean;
  registrationReleasedNewApp: boolean;
}

export const getSavedRestaurant = async (): Promise<Restaurant | null | undefined> => {
  try {
    const data = await getStorage('selectedRestaurant');
    if (!data) return null;

    const parsedData = JSON.parse(data);

    if (parsedData?.restaurant) {
      return parsedData.restaurant;
    }

    if (parsedData?.id && parsedData?.name) {
      return parsedData;
    }

    // return parsedData.restaurant;
  } catch (error) {
    console.error('Erro ao parsear dados:', error);
    return null;
  }
};
