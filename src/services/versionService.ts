import axios from "axios";
import { Platform } from "react-native";
import { ClearedVersionCheck, VersionCheck } from "../types/versionTypes";
import { getStorageRestaurant } from "../utils/restaurantUtils";
import { clearAllStoragesData, getStorage, getToken, setStorage, STORAGE_DEFAULT_KEYS } from "../utils/utils";

const API_URL = process.env.EXPO_PUBLIC_API_URL;
const EXPO_APP_VERSION = process.env.EXPO_PUBLIC_VERSION || '1.0.0';

export const saveUserAppInfo = async (): Promise<void> => {
    try {
        const appOS = Platform.OS;
        const restaurant = await getStorageRestaurant();
        const externalId = restaurant?.externalId ?? null;
        const statusId = restaurant?.registrationReleasedNewApp ? 8 : 4;

        const userAppData = {
            externalId,
            version: EXPO_APP_VERSION,
            OperationalSystem: appOS,
            statusId,
        };

        await axios.post(`${API_URL}/version/app`, userAppData);

        await setStorage(STORAGE_DEFAULT_KEYS.EXPO_APP_VERSION, EXPO_APP_VERSION);
    } catch (error) {
        console.error('Erro ao salvar dados do app:', error);
    }
};

export const checkVersion = async (): Promise<VersionCheck | null> => {
    try {
        const restaurant = await getStorageRestaurant();
        const externalId = restaurant?.externalId ?? null;

        const response = await axios.post(
            `${API_URL}/version/check`,
            { externalId: externalId },
        );
        return response.data.result as VersionCheck;
    } catch (error) {
        console.error('Erro ao checar versão do app:', error);
        return null;
    }
};

export const checkLocalVersionAndClearData = async (): Promise<ClearedVersionCheck> => {
    const defaultResult: ClearedVersionCheck = {
        cleared: false,
        oldVersion: null,
        newVersion: EXPO_APP_VERSION
    };

    if (Platform.OS === 'web') return defaultResult;

    try {
        const savedVersion = await getStorage(STORAGE_DEFAULT_KEYS.EXPO_APP_VERSION);

        if (!savedVersion) {
            await clearAllStoragesData();
            await setStorage(STORAGE_DEFAULT_KEYS.EXPO_APP_VERSION, EXPO_APP_VERSION);

            return { ...defaultResult, cleared: true };
        }

        return { ...defaultResult, oldVersion: savedVersion };
    } catch (error) {
        console.error('Error checking version:', error);
        return defaultResult;
    }
};

export const clearStoragesAndSaveCurrentVersion = async (): Promise<void> => {
    try {
        await clearAllStoragesData();
        await setStorage(STORAGE_DEFAULT_KEYS.EXPO_APP_VERSION, EXPO_APP_VERSION);
    } catch (error) {
        console.error('Error clearing storages and saving current version:', error);
    }
}
