import {
  clearAllStoragesData,
  clearStorage,
  getStorage,
  PENDING_INVITE_CODE_KEY,
  setStorage,
} from './utils';

describe('clearAllStoragesData — preservação do pendingInviteCode', () => {
  beforeEach(async () => {
    await clearStorage();
  });

  it('mantém o pendingInviteCode disponível mesmo após uma limpeza total de storage', async () => {
    await setStorage(PENDING_INVITE_CODE_KEY, 'CODIGOB');
    await setStorage('outraChaveQualquer', 'deve sumir');

    await clearAllStoragesData();

    await expect(getStorage(PENDING_INVITE_CODE_KEY)).resolves.toBe('CODIGOB');
    await expect(getStorage('outraChaveQualquer')).resolves.toBeNull();
  });

  it('não falha quando não havia pendingInviteCode antes da limpeza', async () => {
    await expect(clearAllStoragesData()).resolves.toBeUndefined();
    await expect(getStorage(PENDING_INVITE_CODE_KEY)).resolves.toBeNull();
  });
});
