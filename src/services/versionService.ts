import { Platform } from "react-native";
import { getStorageRestaurant } from "../utils/restaurantUtils";
import axios from "axios";
import { VersionCheck } from "../types/versionTypes";

export const saveUserAppInfo = async () => {
  try {
    const appVersionExpo = process.env.EXPO_PUBLIC_VERSION;
    const appOS = Platform.OS;
    const restaurant = await getStorageRestaurant();
    const externalId = restaurant?.externalId ?? null;
    const statusId = restaurant?.registrationReleasedNewApp ? 8 : 4;

    const userAppData = {
      externalId,
      version: appVersionExpo,
      OperationalSystem: appOS,
      statusId,
    };
    await axios.post(`${process.env.EXPO_PUBLIC_API_URL}/version/app`, userAppData);
  } catch (error) {
    console.error('Erro ao salvar dados do app:', error);
    throw error;
  }
};

export const checkVersion = async (): Promise<VersionCheck> => {
  try {
    const restaurant = await getStorageRestaurant();
    const externalId = restaurant?.externalId ?? null;

    const response = await axios.post(
        `${process.env.EXPO_PUBLIC_API_URL}/version/check`, 
        { externalId: externalId },
    );
    return response.data.result as VersionCheck;
  } catch (error) {
    console.error('Erro ao checar versão do app:', error);
    throw error;
  }
};
