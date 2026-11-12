import { act, renderHook } from '@testing-library/react-native';
import { useRestaurantContext } from '../../contexts/restaurant.context';
import { getCartList } from '../../services/cartService';
import { getStorage, getToken } from '../../utils/utils';
import { useCart } from './useCart';

jest.mock('../../contexts/restaurant.context', () => ({
  useRestaurantContext: jest.fn(),
}));

jest.mock('../../services/cartService', () => ({
  getCartList: jest.fn(),
}));

jest.mock('../../utils/utils', () => ({
  getToken: jest.fn(),
  getStorage: jest.fn(),
  setStorage: jest.fn(),
  STORAGE_DEFAULT_KEYS: {},
}));

jest.mock('../../utils/restaurantUtils', () => ({
  getStorageRestaurant: jest.fn(),
}));

jest.mock('../../utils/productObservation', () => ({
  saveProductObservations: jest.fn(),
}));

const mockedUseRestaurantContext = useRestaurantContext as jest.Mock;
const mockedGetCartList = getCartList as jest.Mock;
const mockedGetToken = getToken as jest.Mock;
const mockedGetStorage = getStorage as jest.Mock;

const ipanema = { id: 'rest-ipanema', externalId: 'ext-ipanema' };
const barra = { id: 'rest-barra', externalId: 'ext-barra' };

describe('useCart — troca de unidade', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedGetToken.mockResolvedValue('token-123');
    mockedGetStorage.mockResolvedValue(null);
  });

  it('esvazia o carrinho ao trocar para uma unidade sem itens no carrinho', async () => {
    mockedUseRestaurantContext.mockReturnValue({ selectedRestaurant: ipanema });
    mockedGetCartList.mockResolvedValueOnce([
      { productId: 'banana', amount: 2, obs: '', addOrder: 1 },
    ]);

    const { result, rerender } = renderHook(() => useCart());

    await act(async () => {
      await result.current.loadCart();
    });
    expect(result.current.cart.size).toBe(1);

    mockedUseRestaurantContext.mockReturnValue({ selectedRestaurant: barra });
    mockedGetCartList.mockResolvedValueOnce([]);
    rerender({});

    await act(async () => {
      await result.current.loadCart();
    });

    expect(mockedGetCartList).toHaveBeenLastCalledWith('rest-barra');
    expect(result.current.cart.size).toBe(0);
    expect(result.current.displayedCartSize).toBe(0);
  });
});
