import axios from 'axios';

const API_URL = process.env.EXPO_PUBLIC_API_URL;

export const getOrders = async (page = 1, limit = 200, restaurantId: string) => {
    try {
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


//--

export const getOrder = async (orderId: string) => {
    try {
        if (!orderId) {
            throw new Error('Pedido selecionado não encontrado.');
        }

        const response = await axios.get(`${API_URL}/orders/${orderId}`);
        return response.data.data;
    } catch (error) {
        console.error('Erro ao buscar pedido:', error);
        throw error;
    }
};

export const cancelOrder = async (orderId: string) => {
    try {
        if (!orderId) {
            throw new Error('Pedido selecionado não encontrado.');
        }
        const response = await axios.put(`${API_URL}/orders/${orderId}/cancel`);
        return response.data;
    } catch (error) {
        console.error('Erro ao cancelar pedido:', error);
        if ((error as { response: { data: { msg: string } } }).response.data.msg) {
            return 'too late';
        }
        throw error;
    }
};

