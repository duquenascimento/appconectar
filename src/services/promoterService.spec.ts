import axios from 'axios';
import { getPromoterNameByCode } from './promoterService';

jest.mock('axios');

const mockedAxiosGet = axios.get as jest.Mock;

describe('getPromoterNameByCode', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('retorna "found" com o nome quando a API encontra o código', async () => {
    mockedAxiosGet.mockResolvedValue({ data: { status: 200, data: { name: 'Fulano de Tal' } } });

    const result = await getPromoterNameByCode('ABC12');

    expect(mockedAxiosGet).toHaveBeenCalledWith(
      expect.stringContaining('/register/promoter-name'),
      expect.objectContaining({ params: { code: 'ABC12' } }),
    );
    expect(result).toEqual({ status: 'found', name: 'Fulano de Tal' });
  });

  it('retorna "not_found" quando a API responde 200 com name nulo', async () => {
    mockedAxiosGet.mockResolvedValue({ data: { status: 200, data: { name: null } } });

    await expect(getPromoterNameByCode('ZZZZZ')).resolves.toEqual({ status: 'not_found' });
  });

  it('retorna "unconfirmed" em erro de rede, sem lançar', async () => {
    mockedAxiosGet.mockRejectedValue(new Error('network error'));

    await expect(getPromoterNameByCode('ABC12')).resolves.toEqual({ status: 'unconfirmed' });
  });

  it('retorna "unconfirmed" quando a API responde 5xx', async () => {
    mockedAxiosGet.mockRejectedValue({
      isAxiosError: true,
      response: { status: 500, data: { status: 500, msg: 'Algo de errado aconteceu.', ref: 'x' } },
    });

    await expect(getPromoterNameByCode('ABC12')).resolves.toEqual({ status: 'unconfirmed' });
  });

  it('retorna "unconfirmed" quando a resposta vem sem o campo name', async () => {
    mockedAxiosGet.mockResolvedValue({ data: { status: 200, data: {} } });

    await expect(getPromoterNameByCode('ABC12')).resolves.toEqual({ status: 'unconfirmed' });
  });

  it('retorna "not_found" sem chamar a API quando o código é vazio', async () => {
    const result = await getPromoterNameByCode('');

    expect(mockedAxiosGet).not.toHaveBeenCalled();
    expect(result).toEqual({ status: 'not_found' });
  });
});
