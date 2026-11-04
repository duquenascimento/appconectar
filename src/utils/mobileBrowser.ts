export type DeviceStore = 'ios' | 'android';

interface DeviceInfo {
  userAgent: string;
  maxTouchPoints?: number;
}

export function detectDeviceStore({
  userAgent,
  maxTouchPoints = 0,
}: DeviceInfo): DeviceStore | null {
  if (/iPhone|iPad|iPod/i.test(userAgent)) return 'ios';
  if (/Android/i.test(userAgent)) return 'android';
  // iPadOS 13+ se apresenta como Mac; só o toque o distingue de um Mac de verdade
  if (/Macintosh/i.test(userAgent) && maxTouchPoints > 1) return 'ios';
  return null;
}
