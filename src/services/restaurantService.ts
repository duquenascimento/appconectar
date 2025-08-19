import { getToken } from '../../app/utils/utils';

const API_URL = process.env.EXPO_PUBLIC_API_URL;

   export const loadRestaurants = async () => {
        try {
            const token = await getToken();
            if (token == null) return [];
            const result = await fetch(`${API_URL}/restaurant/list`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    token
                })
            });
            if (!result.ok) return []
            const restaurants = await result.json();
            if (restaurants.data.length < 1) return []
            return restaurants.data
        } catch (error) {
            console.error('Erro ao carregar restaurantes:', error);
            return [];
        }
    };

    export const loadPermissionConectarPlus = async (externalId: string) => {
        try {
            const token = await getToken();
            if (token == null) return [];
            const result = await fetch(`${API_URL}/restaurant/premium-access/${externalId}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                }
            });
            if (!result.ok) return []
            const hasConectarPlus = await result.json();
            
            if (hasConectarPlus.length < 1) return []
            return hasConectarPlus
        } catch (error) {
            console.error('Erro ao carregar permissão:', error);
            return [];
        }
    };    