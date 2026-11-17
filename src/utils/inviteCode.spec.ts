import {
  capturePendingInviteCode,
  clearPendingInviteCode,
  getPendingInviteCode,
  shouldClearPendingInviteCode,
  shouldResetForNewInvite,
} from './inviteCode';

describe('shouldClearPendingInviteCode', () => {
  it('cadastro sem indicacao -> apaga', () => {
    expect(shouldClearPendingInviteCode('cadastro', undefined)).toBe(true);
    expect(shouldClearPendingInviteCode('cadastro', null)).toBe(true);
    expect(shouldClearPendingInviteCode('cadastro', '')).toBe(true);
  });

  it('cadastro com indicacao -> não apaga', () => {
    expect(shouldClearPendingInviteCode('cadastro', 'ABC12')).toBe(false);
  });

  it.each(['', 'register', 'products', 'forgot-password'])(
    'rota "%s" sem indicacao -> não apaga',
    (route) => {
      expect(shouldClearPendingInviteCode(route, undefined)).toBe(false);
    },
  );
});

describe('shouldResetForNewInvite', () => {
  it('sem código antes e sem código novo -> não reseta', () => {
    expect(shouldResetForNewInvite(undefined, undefined)).toBe(false);
  });

  it('sem código antes e com código novo -> reseta', () => {
    expect(shouldResetForNewInvite(undefined, 'ABC12')).toBe(true);
  });

  it('com código antes e sem código novo -> não reseta', () => {
    expect(shouldResetForNewInvite('ABC12', undefined)).toBe(false);
  });

  it('com código antes e código novo igual -> não reseta', () => {
    expect(shouldResetForNewInvite('ABC12', 'ABC12')).toBe(false);
  });

  it('com código antes e código novo diferente -> reseta', () => {
    expect(shouldResetForNewInvite('ABC12', 'XYZ99')).toBe(true);
  });
});

describe('capturePendingInviteCode / getPendingInviteCode / clearPendingInviteCode', () => {
  it('persiste, lê e limpa o código pendente', async () => {
    await capturePendingInviteCode('ABC12');
    await expect(getPendingInviteCode()).resolves.toBe('ABC12');

    await clearPendingInviteCode();
    await expect(getPendingInviteCode()).resolves.toBeNull();
  });
});
