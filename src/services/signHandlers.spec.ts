import { authSignUp } from '@/src/services/authService';
import { capturePendingInviteCode, getPendingInviteCode } from '@/src/utils/inviteCode';
import { clearStorage } from '@/src/utils/utils';
import { handleRegister } from './signHandlers';

jest.mock('expo-router', () => ({ router: { replace: jest.fn() } }));

jest.mock('@/src/services/authService', () => ({
  authSignUp: jest.fn(),
}));

const mockedAuthSignUp = authSignUp as jest.Mock;

describe('handleRegister — preservação do código de indicação pendente', () => {
  const registerInvalid = jest.fn();
  const setLoading = jest.fn();
  const setErros = jest.fn();
  const saveLogin = jest.fn();

  beforeEach(async () => {
    jest.clearAllMocks();
    await clearStorage();
  });

  it('mantém o pendingInviteCode disponível mesmo após limpar o storage no cadastro', async () => {
    await capturePendingInviteCode('ABC12');

    mockedAuthSignUp.mockResolvedValue({
      data: { token: 'token-123', role: ['registering'] },
    });

    await handleRegister(
      'Nome Teste',
      'Gerente',
      '(21) 99999-9999',
      'teste@indicacao.com',
      'Senha@123',
      registerInvalid,
      setLoading,
      setErros,
      saveLogin,
    );

    // clearStoragesAndSaveCurrentVersion() roda de verdade dentro de handleRegister
    // (limpa localStorage/AsyncStorage) — o código pendente precisa sobreviver a isso
    // para que app/register.tsx consiga aplicá-lo ao formulário.
    await expect(getPendingInviteCode()).resolves.toBe('ABC12');
  });

  it('não falha quando não havia código pendente', async () => {
    mockedAuthSignUp.mockResolvedValue({
      data: { token: 'token-123', role: ['registering'] },
    });

    await handleRegister(
      'Nome Teste',
      'Gerente',
      '(21) 99999-9999',
      'teste2@indicacao.com',
      'Senha@123',
      registerInvalid,
      setLoading,
      setErros,
      saveLogin,
    );

    await expect(getPendingInviteCode()).resolves.toBeNull();
  });
});
