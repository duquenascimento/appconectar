import { renderHook, waitFor } from '@testing-library/react-native';
import { useGlobalSearchParams, useRouter, useSegments } from 'expo-router';
import { Platform } from 'react-native';
import { capturePendingInviteCode, clearPendingInviteCode } from '../../utils/inviteCode';
import { getStorage, getToken } from '../../utils/utils';
import { isPublicRoute, useAuthGuard } from './useAuth';

jest.mock('expo-router', () => ({
  useGlobalSearchParams: jest.fn(),
  useRouter: jest.fn(),
  useSegments: jest.fn(),
}));

jest.mock('../../utils/inviteCode', () => ({
  capturePendingInviteCode: jest.fn(),
  clearPendingInviteCode: jest.fn(),
  shouldClearPendingInviteCode:
    jest.requireActual('../../utils/inviteCode').shouldClearPendingInviteCode,
}));

jest.mock('../../utils/utils', () => ({
  getToken: jest.fn(),
  getStorage: jest.fn(),
  STORAGE_DEFAULT_KEYS: { USER_ROLES: 'userRoles' },
}));

const mockedUseGlobalSearchParams = useGlobalSearchParams as jest.Mock;
const mockedUseRouter = useRouter as jest.Mock;
const mockedUseSegments = useSegments as jest.Mock;
const mockedCapturePendingInviteCode = capturePendingInviteCode as jest.Mock;
const mockedClearPendingInviteCode = clearPendingInviteCode as jest.Mock;
const mockedGetToken = getToken as jest.Mock;
const mockedGetStorage = getStorage as jest.Mock;

describe('isPublicRoute', () => {
  it('trata "cadastro" como rota pública', () => {
    expect(isPublicRoute(['cadastro'])).toBe(true);
  });
});

describe('useAuthGuard — captura de indicacao antes do redirecionamento', () => {
  const dismissTo = jest.fn();
  const replace = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockedUseRouter.mockReturnValue({ dismissTo, replace });
    mockedUseSegments.mockReturnValue(['cadastro']);
  });

  it('captura e aguarda o pendingInviteCode antes de redirecionar um usuário "registering"', async () => {
    const order: string[] = [];
    mockedUseGlobalSearchParams.mockReturnValue({ indicacao: 'ABC12' });
    mockedCapturePendingInviteCode.mockImplementation(async () => {
      order.push('capture');
    });
    mockedGetToken.mockImplementation(async () => {
      order.push('getToken');
      return 'token-123';
    });
    mockedGetStorage.mockResolvedValue('registering');
    dismissTo.mockImplementation((path: string) => order.push(`dismissTo:${path}`));

    renderHook(() => useAuthGuard());

    await waitFor(() => expect(dismissTo).toHaveBeenCalledWith('/register'));

    expect(mockedCapturePendingInviteCode).toHaveBeenCalledWith('ABC12');
    expect(order.indexOf('capture')).toBeLessThan(order.indexOf('dismissTo:/register'));
  });

  it('não chama capturePendingInviteCode quando não há indicacao na URL', async () => {
    mockedUseGlobalSearchParams.mockReturnValue({});
    mockedGetToken.mockResolvedValue(null);

    renderHook(() => useAuthGuard());

    await waitFor(() => expect(mockedGetToken).toHaveBeenCalled());

    expect(mockedCapturePendingInviteCode).not.toHaveBeenCalled();
  });

  it('não chama dismissTo quando o usuário "registering" já está em /register', async () => {
    mockedUseGlobalSearchParams.mockReturnValue({});
    mockedUseSegments.mockReturnValue(['register']);
    mockedGetToken.mockResolvedValue('token-123');
    mockedGetStorage.mockResolvedValue('registering');

    renderHook(() => useAuthGuard());

    await waitFor(() => expect(mockedGetStorage).toHaveBeenCalled());

    // Remontar a tela de /register faria o register.tsx perder o pendingInviteCode
    // já consumido na primeira passada — por isso não pode haver auto-redirect aqui.
    expect(dismissTo).not.toHaveBeenCalled();
  });
});

describe('useAuthGuard — limpeza do código guardado', () => {
  const dismissTo = jest.fn();
  const replace = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockedUseRouter.mockReturnValue({ dismissTo, replace });
    mockedUseGlobalSearchParams.mockReturnValue({});
    mockedGetToken.mockResolvedValue(null);
  });

  it('apaga o código guardado ao abrir "cadastro" sem indicacao', async () => {
    mockedUseSegments.mockReturnValue(['cadastro']);

    renderHook(() => useAuthGuard());

    await waitFor(() => expect(mockedClearPendingInviteCode).toHaveBeenCalledTimes(1));
    expect(mockedCapturePendingInviteCode).not.toHaveBeenCalled();
  });

  it('guarda o código e não apaga ao abrir "cadastro" com indicacao', async () => {
    mockedUseSegments.mockReturnValue(['cadastro']);
    mockedUseGlobalSearchParams.mockReturnValue({ indicacao: 'ABC12' });

    renderHook(() => useAuthGuard());

    await waitFor(() => expect(mockedGetToken).toHaveBeenCalled());
    expect(mockedCapturePendingInviteCode).toHaveBeenCalledWith('ABC12');
    expect(mockedClearPendingInviteCode).not.toHaveBeenCalled();
  });

  it.each([['register'], [''], ['products']])(
    'não apaga o código guardado na rota "%s" sem indicacao',
    async (route) => {
      mockedUseSegments.mockReturnValue(route ? [route] : []);

      renderHook(() => useAuthGuard());

      await waitFor(() => expect(mockedGetToken).toHaveBeenCalled());
      expect(mockedClearPendingInviteCode).not.toHaveBeenCalled();
    },
  );

  describe('na web, com o parâmetro ainda não refletido pelo router', () => {
    const originalOS = Platform.OS;
    const originalWindow = (global as { window?: unknown }).window;

    afterEach(() => {
      Platform.OS = originalOS;
      (global as { window?: unknown }).window = originalWindow;
    });

    it('não apaga quando a URL já traz indicacao', async () => {
      Platform.OS = 'web';
      (global as { window?: unknown }).window = { location: { search: '?indicacao=ABC12' } };
      mockedUseSegments.mockReturnValue(['cadastro']);

      renderHook(() => useAuthGuard());

      await waitFor(() => expect(mockedGetToken).toHaveBeenCalled());
      expect(mockedClearPendingInviteCode).not.toHaveBeenCalled();
    });

    it('apaga quando a URL não traz indicacao', async () => {
      Platform.OS = 'web';
      (global as { window?: unknown }).window = { location: { search: '' } };
      mockedUseSegments.mockReturnValue(['cadastro']);

      renderHook(() => useAuthGuard());

      await waitFor(() => expect(mockedClearPendingInviteCode).toHaveBeenCalledTimes(1));
    });
  });

  it('apaga antes de guardar quando o parâmetro chega um render depois da rota', async () => {
    mockedUseSegments.mockReturnValue(['cadastro']);
    let params: { indicacao?: string } = {};
    mockedUseGlobalSearchParams.mockImplementation(() => params);

    const { rerender } = renderHook(() => useAuthGuard());
    params = { indicacao: 'ABC12' };
    rerender({});

    await waitFor(() => expect(mockedCapturePendingInviteCode).toHaveBeenCalledWith('ABC12'));
    await waitFor(() => expect(mockedGetToken).toHaveBeenCalledTimes(2));

    const clearOrder = mockedClearPendingInviteCode.mock.invocationCallOrder;
    const captureOrder = mockedCapturePendingInviteCode.mock.invocationCallOrder;
    expect(clearOrder.every((c: number) => c < captureOrder[0])).toBe(true);
  });
});
