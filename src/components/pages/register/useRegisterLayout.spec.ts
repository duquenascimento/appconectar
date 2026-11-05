import { renderHook } from '@testing-library/react-native';
import { Platform } from 'react-native';
import { useRegisterLayout } from './useRegisterLayout';

const mockUseResponsiveness = jest.fn();

jest.mock('@/src/components/hooks/useResponsiveness', () => ({
  useResponsiveness: () => mockUseResponsiveness(),
}));

const originalOS = Platform.OS;

function setPlatform(os: 'web' | 'ios') {
  Object.defineProperty(Platform, 'OS', { get: () => os, configurable: true });
}

describe('useRegisterLayout', () => {
  afterEach(() => {
    setPlatform(originalOS as 'web' | 'ios');
  });

  it('não altera nada no app nativo', () => {
    setPlatform('ios');
    mockUseResponsiveness.mockReturnValue({ isLargeScreen: false, screenWidth: 390 });

    const { result } = renderHook(() => useRegisterLayout());

    expect(result.current.field).toEqual({});
    expect(result.current.dropdownText).toEqual({});
    expect(result.current.containerProps).toEqual({});
    expect(result.current.touchHeight).toBeUndefined();
    expect(result.current.pagePadding).toBe(20);
  });

  it('no navegador do celular usa 16 px, 48 px de altura e 16 px de margem lateral', () => {
    setPlatform('web');
    mockUseResponsiveness.mockReturnValue({ isLargeScreen: false, screenWidth: 390 });

    const { result } = renderHook(() => useRegisterLayout());

    expect(result.current.field).toEqual({ fontSize: 16, height: 48 });
    expect(result.current.touchHeight).toBe(48);
    expect(result.current.pagePadding).toBe(16);
    expect(result.current.containerProps.maxWidth).toBe(600);
  });

  it('no computador usa 44 px de altura e limita a coluna a 600 px', () => {
    setPlatform('web');
    mockUseResponsiveness.mockReturnValue({ isLargeScreen: true, screenWidth: 1280 });

    const { result } = renderHook(() => useRegisterLayout());

    expect(result.current.field).toEqual({ fontSize: 16, height: 44 });
    expect(result.current.containerProps).toMatchObject({ maxWidth: 600, alignSelf: 'center' });
  });
});
