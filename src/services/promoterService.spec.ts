import { getPromoterNameByCode } from './promoterService';

describe('getPromoterNameByCode', () => {
  it('resolve sem lançar erro (stub aguardando endpoint da CH-754)', async () => {
    await expect(getPromoterNameByCode('ABC12')).resolves.toBeUndefined();
  });
});
