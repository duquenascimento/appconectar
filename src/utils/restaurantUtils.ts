import { Restaurant } from "../types/restaurantTypes";
import { getStorage, setStorage } from "./utils";

const RESTAURANT_STORAGE_KEY = 'selectedRestaurant';

export const getStorageRestaurant = async (): Promise<Restaurant | null> => {
    try {
        const data = await getStorage(RESTAURANT_STORAGE_KEY);
        if (!data) return null;
        return JSON.parse(data) as Restaurant;
    } catch (error) {
        console.error('Erro ao obter restaurante do armazenamento:', error);
        return null;
    }
}

export const setStorageRestaurant = async (restaurant: Restaurant): Promise<void> => {
    try {
        const data = JSON.stringify(restaurant);
        await setStorage(RESTAURANT_STORAGE_KEY, data);
    } catch (error) {
        console.error('Erro ao salvar restaurante no armazenamento:', error);
    }
}