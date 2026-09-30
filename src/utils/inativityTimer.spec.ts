import { act, renderHook } from '@testing-library/react-native';
import { AppState } from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import { useInactivityRedirect } from './inativityTimer';

jest.mock('expo-router', () => ({
  useRouter: jest.fn(),
  usePathname: jest.fn(),
}));

const mockUseRouter = useRouter as jest.MockedFunction<typeof useRouter>;
const mockUsePathname = usePathname as jest.MockedFunction<typeof usePathname>;

describe('useInactivityRedirect', () => {
  const push = jest.fn();

  beforeEach(() => {
    jest.useFakeTimers();
    push.mockClear();
    mockUseRouter.mockReturnValue({ push } as unknown as ReturnType<typeof useRouter>);
    mockUsePathname.mockReturnValue('/confirm');
    (AppState as unknown as { currentState: string }).currentState = 'active';
    jest
      .spyOn(AppState, 'addEventListener')
      .mockReturnValue({ remove: jest.fn() } as unknown as ReturnType<
        typeof AppState.addEventListener
      >);
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  it('não redireciona quando enabled é false, mesmo após o tempo limite', () => {
    renderHook(() =>
      useInactivityRedirect({ timeout: 120000, redirectPath: '/prices', enabled: false }),
    );

    act(() => {
      jest.advanceTimersByTime(200000);
    });

    expect(push).not.toHaveBeenCalled();
  });

  it('redireciona após o tempo limite quando enabled é true', () => {
    const { rerender } = renderHook(
      ({ enabled }: { enabled: boolean }) =>
        useInactivityRedirect({ timeout: 120000, redirectPath: '/prices', enabled }),
      { initialProps: { enabled: false } },
    );

    // habilita depois do mount, como ocorre em app/confirm.tsx quando loadingToConfirm
    // deixa de estar ativo (`enabled: pathname === '/confirm' && !loadingToConfirm`)
    rerender({ enabled: true });

    act(() => {
      jest.advanceTimersByTime(120000);
    });

    expect(push).toHaveBeenCalledWith('/prices');
  });

  it('cancela um timer em andamento ao desabilitar, mesmo após o tempo limite original', () => {
    const { rerender } = renderHook(
      ({ enabled }: { enabled: boolean }) =>
        useInactivityRedirect({ timeout: 120000, redirectPath: '/prices', enabled }),
      { initialProps: { enabled: false } },
    );

    // estabelece um timer real (ver teste acima sobre habilitar após o mount)
    rerender({ enabled: true });

    act(() => {
      jest.advanceTimersByTime(60000);
    });

    // ex.: setLoadingToConfirm(true) desabilita o hook no meio da contagem
    rerender({ enabled: false });

    act(() => {
      jest.advanceTimersByTime(120000);
    });

    expect(push).not.toHaveBeenCalled();
  });

  it('reinicia a contagem do zero ao alternar enabled de false para true, em vez de continuar de onde parou', () => {
    const { rerender } = renderHook(
      ({ enabled }: { enabled: boolean }) =>
        useInactivityRedirect({ timeout: 120000, redirectPath: '/prices', enabled }),
      { initialProps: { enabled: true } },
    );

    act(() => {
      // simula o usuário quase no limite de inatividade
      jest.advanceTimersByTime(100000);
    });

    // ex.: setLoadingToConfirm(true) desabilita o hook durante o envio do pedido
    rerender({ enabled: false });
    // ex.: o envio termina (sucesso ou erro) e o hook é reabilitado
    rerender({ enabled: true });

    act(() => {
      // se a contagem tivesse continuado de onde parou (100000 + 100000 = 200000 > 120000),
      // o redirect já teria disparado aqui
      jest.advanceTimersByTime(100000);
    });

    expect(push).not.toHaveBeenCalled();

    act(() => {
      // completa os 120000ms do novo ciclo, iniciado do zero na reabilitação
      jest.advanceTimersByTime(20000);
    });

    expect(push).toHaveBeenCalledWith('/prices');
  });
});
