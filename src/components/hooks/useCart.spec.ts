import { act, renderHook, waitFor } from '@testing-library/react-native';
import { useRestaurantContext } from '../../contexts/restaurant.context';
import { getCartList } from '../../services/cartService';
import { saveProductObservations } from '../../utils/productObservation';
import { getStorageRestaurant } from '../../utils/restaurantUtils';
import { getStorage, getToken, setStorage } from '../../utils/utils';
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
const mockedSetStorage = setStorage as jest.Mock;
const mockedGetStorageRestaurant = getStorageRestaurant as jest.Mock;

const ipanema = { id: 'rest-ipanema', externalId: 'ext-ipanema' };
const barra = { id: 'rest-barra', externalId: 'ext-barra' };

const item = (productId: string, obs = '') => ({ productId, amount: 1, obs, addOrder: 1 });

function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((r) => {
    resolve = r;
  });
  return { promise, resolve };
}

function renderOn(restaurant: typeof ipanema) {
  mockedUseRestaurantContext.mockReturnValue({ selectedRestaurant: restaurant });
  return renderHook(() => useCart());
}

function switchTo(rerender: (props: object) => void, restaurant: typeof ipanema) {
  mockedUseRestaurantContext.mockReturnValue({ selectedRestaurant: restaurant });
  rerender({});
}

async function loadIpanemaWithOneItem() {
  mockedGetCartList.mockResolvedValueOnce([item('banana')]);
  const hook = renderOn(ipanema);
  await act(async () => {
    await hook.result.current.loadCart();
  });
  expect(hook.result.current.cart.size).toBe(1);
  return hook;
}

describe('useCart — troca de unidade', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    (saveProductObservations as jest.Mock).mockResolvedValue(undefined);
    mockedGetToken.mockResolvedValue('token-123');
    mockedGetStorage.mockResolvedValue(null);
    mockedSetStorage.mockResolvedValue(undefined);
  });

  it('esvazia o carrinho ao trocar para uma unidade sem itens no carrinho', async () => {
    const { result, rerender } = await loadIpanemaWithOneItem();

    switchTo(rerender, barra);
    mockedGetCartList.mockResolvedValueOnce([]);
    await act(async () => {
      await result.current.loadCart();
    });

    expect(mockedGetCartList).toHaveBeenLastCalledWith('rest-barra');
    expect(result.current.cart.size).toBe(0);
    expect(result.current.displayedCartSize).toBe(0);
  });

  it('substitui pelos itens da nova unidade, sem misturar com os da anterior', async () => {
    const { result, rerender } = await loadIpanemaWithOneItem();

    switchTo(rerender, barra);
    mockedGetCartList.mockResolvedValueOnce([item('tomate')]);
    await act(async () => {
      await result.current.loadCart();
    });

    expect(Array.from(result.current.cart.keys())).toEqual(['tomate']);
  });

  it('esvazia o carrinho da unidade anterior mesmo quando a carga da nova falha', async () => {
    const { result, rerender } = await loadIpanemaWithOneItem();

    switchTo(rerender, barra);
    mockedGetCartList.mockRejectedValueOnce(new Error('falha de rede'));
    await act(async () => {
      await result.current.loadCart();
    });

    expect(result.current.cart.size).toBe(0);
  });

  it('esvazia o carrinho da unidade anterior mesmo sem token', async () => {
    const { result, rerender } = await loadIpanemaWithOneItem();

    switchTo(rerender, barra);
    mockedGetToken.mockResolvedValueOnce(null);
    await act(async () => {
      await result.current.loadCart();
    });

    expect(mockedGetCartList).toHaveBeenCalledTimes(1);
    expect(result.current.cart.size).toBe(0);
  });

  it('mantém o carrinho quando a carga da mesma unidade falha', async () => {
    const { result } = await loadIpanemaWithOneItem();

    mockedGetCartList.mockRejectedValueOnce(new Error('falha de rede'));
    await act(async () => {
      await result.current.loadCart();
    });

    expect(result.current.cart.size).toBe(1);
  });

  it('descarta os itens marcados para exclusão na unidade anterior', async () => {
    const { result, rerender } = await loadIpanemaWithOneItem();

    mockedGetStorageRestaurant.mockResolvedValue(ipanema);
    await act(async () => {
      await result.current.saveCart({ ...item('banana'), amount: 0 }, true);
    });
    expect(result.current.cartToExclude.has('banana')).toBe(true);

    switchTo(rerender, barra);
    mockedGetCartList.mockResolvedValueOnce([item('banana')]);
    await act(async () => {
      await result.current.loadCart();
    });

    expect(result.current.cartToExclude.size).toBe(0);
  });

  it('ignora a resposta atrasada de uma carga anterior', async () => {
    const ipanemaResponse = deferred<ReturnType<typeof item>[]>();
    mockedGetCartList.mockReturnValueOnce(ipanemaResponse.promise);
    const { result, rerender } = renderOn(ipanema);

    let ipanemaLoad!: Promise<unknown>;
    act(() => {
      ipanemaLoad = result.current.loadCart();
    });
    await waitFor(() => expect(mockedGetCartList).toHaveBeenCalledWith('rest-ipanema'));

    switchTo(rerender, barra);
    mockedGetCartList.mockResolvedValueOnce([]);
    await act(async () => {
      await result.current.loadCart();
    });

    await act(async () => {
      ipanemaResponse.resolve([item('banana')]);
      await ipanemaLoad;
    });

    expect(result.current.cart.size).toBe(0);
    expect(mockedSetStorage).not.toHaveBeenCalledWith('cart_ext-ipanema', expect.anything());
  });

  it('preserva as observações locais mesmo se a chave for sobrescrita durante a carga', async () => {
    const { result, rerender } = await loadIpanemaWithOneItem();

    switchTo(rerender, barra);
    mockedGetStorage.mockResolvedValueOnce(
      JSON.stringify([['tomate', item('tomate', 'bem maduro')]]),
    );
    mockedGetCartList.mockImplementationOnce(async () => {
      mockedGetStorage.mockReset();
      mockedGetStorage.mockResolvedValue('[]');
      return [item('tomate')];
    });
    await act(async () => {
      await result.current.loadCart();
    });

    expect(result.current.cart.get('tomate')?.obs).toBe('bem maduro');
  });
});
