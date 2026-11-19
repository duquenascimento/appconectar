import { renderHook } from '@testing-library/react-native';
import { Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAndroidBottomInset } from './useAndroidBottomInset';

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: jest.fn(),
}));

const mockUseSafeAreaInsets = useSafeAreaInsets as jest.Mock;

describe('useAndroidBottomInset', () => {
  const originalOS = Platform.OS;

  beforeEach(() => {
    mockUseSafeAreaInsets.mockReturnValue({ top: 24, right: 0, bottom: 48, left: 0 });
  });

  afterEach(() => {
    Object.defineProperty(Platform, 'OS', { value: originalOS, configurable: true });
  });

  it('retorna o recuo inferior da barra de navegação no Android', () => {
    Object.defineProperty(Platform, 'OS', { value: 'android', configurable: true });

    const { result } = renderHook(() => useAndroidBottomInset());

    expect(result.current).toBe(48);
  });

  it('retorna 0 no Android quando o sistema já reserva o espaço da barra', () => {
    Object.defineProperty(Platform, 'OS', { value: 'android', configurable: true });
    mockUseSafeAreaInsets.mockReturnValue({ top: 0, right: 0, bottom: 0, left: 0 });

    const { result } = renderHook(() => useAndroidBottomInset());

    expect(result.current).toBe(0);
  });

  it('retorna 0 no iOS, onde o SafeAreaView já aplica o recuo', () => {
    Object.defineProperty(Platform, 'OS', { value: 'ios', configurable: true });

    const { result } = renderHook(() => useAndroidBottomInset());

    expect(result.current).toBe(0);
  });
});
