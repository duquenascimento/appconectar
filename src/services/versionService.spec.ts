import { capturePendingInviteCode, getPendingInviteCode } from '../utils/inviteCode';
import { clearStorage, getStorage, setStorage, STORAGE_DEFAULT_KEYS } from '../utils/utils';
import { checkLocalVersionAndClearData } from './versionService';

describe('checkLocalVersionAndClearData — preservação do código de indicação no primeiro acesso', () => {
  beforeEach(async () => {
    await clearStorage();
  });

  it('preserva o pendingInviteCode capturado da URL mesmo quando limpa o storage no primeiro acesso', async () => {
    // Simula o useAuthGuard já tendo capturado ?indicacao=ABC12 antes deste efeito rodar,
    // e nenhuma versão do app salva ainda (cenário de primeiro acesso via link de indicação).
    await capturePendingInviteCode('ABC12');

    const result = await checkLocalVersionAndClearData();

    expect(result.cleared).toBe(true);
    await expect(getPendingInviteCode()).resolves.toBe('ABC12');
  });

  it('não falha e não recria o código quando não havia nenhum pendente', async () => {
    const result = await checkLocalVersionAndClearData();

    expect(result.cleared).toBe(true);
    await expect(getPendingInviteCode()).resolves.toBeNull();
  });

  it('não limpa o storage quando a versão já está salva (não é primeiro acesso)', async () => {
    await capturePendingInviteCode('ABC12');
    const versionKey = STORAGE_DEFAULT_KEYS.EXPO_APP_VERSION;
    await setStorage(versionKey, '1.0.0');

    const result = await checkLocalVersionAndClearData();

    expect(result.cleared).toBe(false);
    await expect(getStorage(versionKey)).resolves.toBe('1.0.0');
    await expect(getPendingInviteCode()).resolves.toBe('ABC12');
  });
});
