import { detectDeviceStore } from './mobileBrowser';

const IPHONE =
  'Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Mobile/15E148 Safari/604.1';
const IPAD =
  'Mozilla/5.0 (iPad; CPU OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1';
const MAC =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Safari/605.1.15';
const ANDROID =
  'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Mobile Safari/537.36';
const WINDOWS =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36';

describe('detectDeviceStore', () => {
  it('iPhone -> ios', () => {
    expect(detectDeviceStore({ userAgent: IPHONE, maxTouchPoints: 5 })).toBe('ios');
  });

  it('iPad com user agent de iPad -> ios', () => {
    expect(detectDeviceStore({ userAgent: IPAD, maxTouchPoints: 5 })).toBe('ios');
  });

  it('iPadOS que se apresenta como Mac, com toque -> ios', () => {
    expect(detectDeviceStore({ userAgent: MAC, maxTouchPoints: 5 })).toBe('ios');
  });

  it('Mac sem toque -> null', () => {
    expect(detectDeviceStore({ userAgent: MAC, maxTouchPoints: 0 })).toBeNull();
    expect(detectDeviceStore({ userAgent: MAC })).toBeNull();
  });

  it('Android -> android', () => {
    expect(detectDeviceStore({ userAgent: ANDROID, maxTouchPoints: 5 })).toBe('android');
  });

  it('Windows -> null, mesmo com tela de toque', () => {
    expect(detectDeviceStore({ userAgent: WINDOWS, maxTouchPoints: 10 })).toBeNull();
  });

  it('user agent vazio -> null', () => {
    expect(detectDeviceStore({ userAgent: '' })).toBeNull();
  });
});
