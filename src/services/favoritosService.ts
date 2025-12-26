import axios, { HttpStatusCode } from 'axios';
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

export const addFavorite = async (
    token: string,
    productId: string,
    restaurantId: string,
    obs: string
): Promise<boolean> => {
    try {
        const response = await axios.post(
            `${API_URL}/favorite/save`,
            { productId, restaurantId, token, obs },
            { headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` } }
        )

        return response.status == HttpStatusCode.Ok;
    } catch (error) {
        console.error('Erro ao atualizar favoritos:', error)
        throw error
    }
}

export const updateFavorite = async (
    token: string,
    productId: string,
    restaurantId: string,
    obs: string
): Promise<boolean> => {
    try {
        const response = await axios.post(
            `${API_URL}/favorite/update`,
            { productId, restaurantId, token, obs },
            { headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` } }
        )

        return response.status == HttpStatusCode.Ok;
    } catch (error) {
        console.error('Erro ao atualizar favoritos:', error)
        throw error
    }
}

export const deleteFavorite = async (
    token: string,
    productId: string,
    restaurantId: string
): Promise<boolean> => {
    try {
        const response = await axios.post(
            `${API_URL}/favorite/del`,
            { productId, restaurantId, token },
            { headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` } }
        )

        return response.status == HttpStatusCode.Ok;
    } catch (error) {
        console.error('Erro ao excluir dos favoritos:', error)
        throw error
    }
}