import axios from 'axios';
import { Favorites } from '../types/favoriteTypes';

const API_URL = process.env.EXPO_PUBLIC_API_URL

export const getFavorites = async (token: string, restaurantId: string): Promise<Favorites[]> => {
    try {
        const response = await axios.post(
            `${API_URL}/favorite/list`,
            { token, restaurantId },
            { headers: { 'Content-Type': 'application/json' } }
        )

        if (!response.data || !response.data.data) {
            console.warn('Falha ao carregar favoritos:', response.status);
            return [];
        }

        return response.data.data
    } catch (error) {
        console.error('Erro ao buscar favoritos:', error)
        throw error
    }
}
