import axios from 'axios';
import { getStorage } from '../utils/utils'; 

const API_URL = 'http://127.0.0.1:3333';

export const getOrders = async (page = 1, limit = 10) => {
    try {
        const selectedRestaurant = await getStorage('selectedRestaurant');

        if (!selectedRestaurant) {
            throw new Error('Restaurante selecionado não encontrado.');
        }

        const restaurantData = JSON.parse(selectedRestaurant);

        const restaurantId = restaurantData.restaurant.externalId;

        const response = await axios.get(`${API_URL}/orders/filter`, {
            params: {
                restaurantId,
                page,
                limit,
            },
        });

        return response.data.orders;
    } catch (error) {
        console.error('Erro ao buscar pedidos:', error);
        throw error;
    }
};