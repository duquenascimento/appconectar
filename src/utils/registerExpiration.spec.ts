import { isRegistrationExpired } from './registerExpiration';

const DAY_IN_MS = 24 * 60 * 60 * 1000;

describe('isRegistrationExpired', () => {
  it('retorna false quando não há data de criação', () => {
    expect(isRegistrationExpired(undefined)).toBe(false);
    expect(isRegistrationExpired(null)).toBe(false);
  });

  it('retorna false quando a data é inválida', () => {
    expect(isRegistrationExpired('data-invalida')).toBe(false);
  });

  it('retorna false quando a conta foi criada há menos de 30 dias', () => {
    const createdAt = new Date(Date.now() - 10 * DAY_IN_MS).toISOString();
    expect(isRegistrationExpired(createdAt)).toBe(false);
  });

  it('retorna true quando a conta foi criada há mais de 30 dias', () => {
    const createdAt = new Date(Date.now() - 31 * DAY_IN_MS).toISOString();
    expect(isRegistrationExpired(createdAt)).toBe(true);
  });

  it('respeita um limite de dias customizado', () => {
    const createdAt = new Date(Date.now() - 5 * DAY_IN_MS).toISOString();
    expect(isRegistrationExpired(createdAt, 3)).toBe(true);
    expect(isRegistrationExpired(createdAt, 10)).toBe(false);
  });
});
