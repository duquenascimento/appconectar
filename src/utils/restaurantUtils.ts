import { Restaurant } from "../types/restaurantTypes";
import { getStorage, setStorage, STORAGE_DEFAULT_KEYS } from "./utils";

export const getStorageRestaurant = async (): Promise<Restaurant | null> => {
    try {
        const data = await getStorage(STORAGE_DEFAULT_KEYS.SELECTED_RESTAURANT);
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
        await setStorage(STORAGE_DEFAULT_KEYS.SELECTED_RESTAURANT, data);
    } catch (error) {
        console.error('Erro ao salvar restaurante no armazenamento:', error);
    }
}

const buildAddressInfoTime = (timeString: string): string => {
    return `${timeString.substring(11, 19)}`
}

export const resolveMinMaxTimeForRoute = (
    initialDeliveryTime: string,
    finalDeliveryTime: string,
): { minimumTime: string; maximumTime: string } => {
    const minimumTime = buildAddressInfoTime(initialDeliveryTime)
    const maximumTime = buildAddressInfoTime(finalDeliveryTime)

    return { minimumTime, maximumTime }
}
