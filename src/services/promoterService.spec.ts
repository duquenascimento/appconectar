import axios from 'axios';
import { getPromoterNameByCode } from './promoterService';

jest.mock('axios');

const mockedAxiosGet = axios.get as jest.Mock;

describe('getPromoterNameByCode', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('retorna o nome do promotor quando a API encontra o código', async () => {
    mockedAxiosGet.mockResolvedValue({ data: { status: 200, data: { name: 'Fulano de Tal' } } });

    const result = await getPromoterNameByCode('ABC12');

    expect(mockedAxiosGet).toHaveBeenCalledWith(
      expect.stringContaining('/register/promoter-name'),
      expect.objectContaining({ params: { code: 'ABC12' } }),
    );
    expect(result).toBe('Fulano de Tal');
  });

  it('retorna undefined quando a API responde sem nome (código não encontrado)', async () => {
    mockedAxiosGet.mockResolvedValue({ data: { status: 200, data: { name: null } } });

    await expect(getPromoterNameByCode('CODIGO_INEXISTENTE')).resolves.toBeUndefined();
  });

  it('resolve sem lançar erro quando a chamada falha (não bloqueia a exibição da tela)', async () => {
    mockedAxiosGet.mockRejectedValue(new Error('network error'));

    await expect(getPromoterNameByCode('ABC12')).resolves.toBeUndefined();
  });

  it('retorna undefined sem chamar a API quando o código é vazio', async () => {
    const result = await getPromoterNameByCode('');

    expect(mockedAxiosGet).not.toHaveBeenCalled();
    expect(result).toBeUndefined();
  });
});
