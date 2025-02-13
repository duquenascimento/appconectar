import { getToken } from '../utils/utils';

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