import AsyncStorage from '@react-native-async-storage/async-storage';
import { deleteItemAsync, getItemAsync, setItemAsync } from 'expo-secure-store';
import Cookies from 'js-cookie';
import { Platform } from "react-native";

const platform = Platform.OS;
const isWebPlatform = platform === 'web';

enum SECURE_STORE_KEYS {
    TOKEN = 'token',
}

export enum STORAGE_DEFAULT_KEYS {
    ROLE = 'role',
    USER_ROLES = 'userRoles',
    SELECTED_RESTAURANT = 'selectedRestaurant',
    EXPO_APP_VERSION = 'expoAppVersion',
    AVAILABLE_SUPPLIERS = 'availableSuppliers',
    UNAVAILABLE_SUPPLIERS = 'unavailableSuppliers',
    MY_COMBINATIONS = 'myCombinations',
    CONECTAR_COMBINATIONS = 'conectarCombinations',
    UNAVAILABLE_COMBINATIONS = 'unavailableCombinations',
    COMBINATION_DATA = 'combinationData',
}

export const getToken = async (): Promise<string | null | undefined> => {
    if (isWebPlatform) return Cookies.get(SECURE_STORE_KEYS.TOKEN);
    return await getItemAsync(SECURE_STORE_KEYS.TOKEN);
}

export const setToken = async (token: string): Promise<void> => {
    if (isWebPlatform) Cookies.set(SECURE_STORE_KEYS.TOKEN, token);
    else await setItemAsync(SECURE_STORE_KEYS.TOKEN, token);
}

export const deleteToken = async (): Promise<void> => {
    if (isWebPlatform) Cookies.remove(SECURE_STORE_KEYS.TOKEN);
    else await deleteItemAsync(SECURE_STORE_KEYS.TOKEN);
}

// Clear all secure storage data based on the platform and the defined enum keys
// If adding new keys to SECURE_STORE_KEYS, they will be automatically cleared here
const clearSecureStorage = async (): Promise<void> => {
    const secureStoreKeys = Object.values(SECURE_STORE_KEYS);

    if (isWebPlatform) {
        secureStoreKeys.forEach(key => Cookies.remove(key));
    } else {
        await Promise.all(secureStoreKeys.map(key => deleteItemAsync(key)));
    }
};

export const setStorage = async (key: string, value: string): Promise<void> => {
    if (isWebPlatform) localStorage.setItem(key, value);
    else await AsyncStorage.setItem(key, value);
}

export const deleteStorage = async (key: string): Promise<void> => {
    if (isWebPlatform) localStorage.removeItem(key);
    else await AsyncStorage.removeItem(key);
}

export const deleteMultiStorage = async (keys: string[]): Promise<void> => {
    if (isWebPlatform) keys.forEach(key => localStorage.removeItem(key));
    else await AsyncStorage.multiRemove(keys);
}

export const getStorage = async (key: string): Promise<string | null> => {
    if (isWebPlatform) return localStorage.getItem(key);
    else return await AsyncStorage.getItem(key);
}

export const clearStorage = async (): Promise<void> => {
    if (isWebPlatform) localStorage.clear();
    else await AsyncStorage.clear();
}

export const clearAllStoragesData = async (): Promise<void> => {
    await Promise
        .all([clearStorage(), clearSecureStorage()])
        .catch(async () => { });
}
