import { updateRestaurantDeliveryInfo } from './restaurantService';
import { Restaurant } from '../types/restaurantTypes';

// Mock completo de propósito: `requireActual` arrastaria expo-secure-store e js-cookie.
jest.mock('../utils/utils', () => ({
  getToken: jest.fn().mockResolvedValue('fake-token'),
  STORAGE_DEFAULT_KEYS: {},
}));

const data = { name: 'Restaurante Teste' } as Partial<Restaurant>;

const mockFetch = (response: Partial<Response>) => {
  global.fetch = jest.fn().mockResolvedValue(response) as jest.Mock;
};

describe('restaurantService - updateRestaurantDeliveryInfo', () => {
  const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterAll(() => {
    consoleError.mockRestore();
  });

  it('deve resolver quando o servidor aceita a gravação', async () => {
    mockFetch({ ok: true, status: 200, json: jest.fn().mockResolvedValue({}) });

    await expect(updateRestaurantDeliveryInfo('id-1', data)).resolves.toBeUndefined();
  });

  it('deve falhar quando o servidor recusa a gravação', async () => {
    mockFetch({
      ok: false,
      status: 500,
      json: jest.fn().mockResolvedValue({ msg: 'erro interno' }),
    });

    await expect(updateRestaurantDeliveryInfo('id-1', data)).rejects.toThrow(
      'Não foi possível salvar as informações de entrega. Tente novamente.',
    );
  });

  it('deve mostrar a mensagem do servidor quando ela é de validação', async () => {
    mockFetch({
      ok: false,
      status: 422,
      json: jest.fn().mockResolvedValue({ msg: 'O campo Rua deve ter no máximo 200 caracteres' }),
    });

    await expect(updateRestaurantDeliveryInfo('id-1', data)).rejects.toThrow(
      'O campo Rua deve ter no máximo 200 caracteres',
    );
  });

  it('deve falhar com texto em português quando a rede cai', async () => {
    global.fetch = jest
      .fn()
      .mockRejectedValue(new TypeError('Network request failed')) as jest.Mock;

    await expect(updateRestaurantDeliveryInfo('id-1', data)).rejects.toThrow(
      'Não foi possível salvar as informações de entrega. Tente novamente.',
    );
  });
});
