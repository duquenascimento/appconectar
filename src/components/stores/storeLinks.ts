import { Linking } from 'react-native';
import type { DeviceStore } from '@/src/utils/mobileBrowser';

export const STORE_LINKS: Record<DeviceStore, string> = {
  ios: 'https://apps.apple.com/br/app/con%C3%A9ctar/id6471991824',
  android: 'https://play.google.com/store/apps/details?id=io.bubbleapps.app_conectar.twa',
};

export function openStore(store: DeviceStore): Promise<void> {
  return Linking.openURL(STORE_LINKS[store]).catch(() => console.error('Erro ao abrir loja'));
}
