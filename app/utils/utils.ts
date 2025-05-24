import { Platform } from "react-native"
import { getItemAsync, setItemAsync, deleteItemAsync } from 'expo-secure-store';
import Cookies from 'js-cookie'
import AsyncStorage from '@react-native-async-storage/async-storage';

const platform = Platform.OS

export const getToken = async (): Promise<string | null | undefined> => {
    if (platform === 'web') return Cookies.get('token')
    return await getItemAsync('token')
}

export const setToken = async (token: string): Promise<void> => {
    if (platform === 'web') Cookies.set('token', token)
    else await setItemAsync('token', token)
}

export const deleteToken = async (): Promise<void> => {
    if (platform === 'web') Cookies.remove('token')
    else await deleteItemAsync('token')
}

/*export const setStorage = async (key: string, value: string): Promise<void> => {
    if (platform === 'web') localStorage.setItem(key, value)
    else await AsyncStorage.setItem(key, value)
}*/

export const setStorage = async (key: string, value: string): Promise<void> => {
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem(key, value);
    console.log('✅ Salvo no localStorage:', key);
  } else {
    await AsyncStorage.setItem(key, value);
    console.log('✅ Salvo no AsyncStorage:', key);
  }
};

export const clearStorage = async (): Promise<void> => {
    if (platform === 'web') localStorage.clear()
    else await AsyncStorage.clear()
}

export const deleteStorage = async (key: string): Promise<void> => {
    if (platform === 'web') localStorage.removeItem(key)
    else await AsyncStorage.removeItem(key)
}

export const deleteMultiStorage = async (keys: string[]): Promise<void> => {
    if (platform === 'web') keys.forEach(key => localStorage.removeItem(key))
    else await AsyncStorage.multiRemove(keys)
}

export const getStorage = async (key: string): Promise<string | null> => {
    if (platform === 'web') return localStorage.getItem(key)
    else return await AsyncStorage.getItem(key)
}