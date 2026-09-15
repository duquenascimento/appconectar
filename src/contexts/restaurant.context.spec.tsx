import React from 'react';
import { render, waitFor } from '@testing-library/react-native';
import { Text } from 'react-native';
import { RestaurantProvider, useRestaurantContext } from './restaurant.context';
import { getUserRestaurants } from '../services/restaurantService';
import { getStorageRestaurant, setStorageRestaurant } from '../utils/restaurantUtils';
import { useAuthContext } from './auth.context';
import { useDeliveryDate } from './deliveryDate.context';
import { Restaurant } from '../types/restaurantTypes';

jest.mock('../services/restaurantService');
jest.mock('../utils/restaurantUtils');
jest.mock('./auth.context');
jest.mock('./deliveryDate.context');

const mockGetUserRestaurants = getUserRestaurants as jest.MockedFunction<typeof getUserRestaurants>;
const mockGetStorageRestaurant = getStorageRestaurant as jest.MockedFunction<
  typeof getStorageRestaurant
>;
const mockSetStorageRestaurant = setStorageRestaurant as jest.MockedFunction<
  typeof setStorageRestaurant
>;
const mockUseAuthContext = useAuthContext as jest.MockedFunction<typeof useAuthContext>;
const mockUseDeliveryDate = useDeliveryDate as jest.MockedFunction<typeof useDeliveryDate>;

const buildRestaurant = (overrides: Partial<Restaurant>): Restaurant =>
  ({
    id: 'r1',
    externalId: 'ext-1',
    name: 'Restaurante Teste',
    allowEmergencyOrder: false,
    allowClosedSupplier: false,
    allowMinimumOrder: false,
    addressInfos: [{ responsibleReceivingPhoneNumber: '11999999999' }],
    ...overrides,
  }) as unknown as Restaurant;

let capturedContext: ReturnType<typeof useRestaurantContext> | undefined;

function TestConsumer() {
  capturedContext = useRestaurantContext();
  return <Text>{capturedContext.selectedRestaurant?.externalId ?? 'nenhum'}</Text>;
}

describe('RestaurantProvider - loadRestaurants', () => {
  beforeEach(() => {
    capturedContext = undefined;
    jest.clearAllMocks();
    mockUseAuthContext.mockReturnValue({
      authToken: 'token-123',
    } as unknown as ReturnType<typeof useAuthContext>);
    mockUseDeliveryDate.mockReturnValue({
      initializeDeliveryDates: jest.fn(),
    } as unknown as ReturnType<typeof useDeliveryDate>);
    mockSetStorageRestaurant.mockResolvedValue(undefined);
  });

  it('usa sempre o restaurante fresco da API, nunca os campos do storage desatualizado, mesmo para o mesmo externalId salvo', async () => {
    const staleFromStorage = buildRestaurant({
      allowEmergencyOrder: true,
      addressInfos: [{ responsibleReceivingPhoneNumber: '' }] as never,
    });
    const freshFromApi = buildRestaurant({ allowEmergencyOrder: false });

    mockGetStorageRestaurant.mockResolvedValue(staleFromStorage);
    mockGetUserRestaurants.mockResolvedValue([freshFromApi]);

    render(
      <RestaurantProvider>
        <TestConsumer />
      </RestaurantProvider>,
    );

    await waitFor(() => {
      expect(capturedContext?.selectedRestaurant).toEqual(freshFromApi);
    });

    expect(capturedContext?.selectedRestaurant?.allowEmergencyOrder).toBe(false);
  });

  it('cai para o primeiro restaurante da API quando o externalId salvo no storage não existe mais na lista', async () => {
    const staleFromStorage = buildRestaurant({ externalId: 'ext-desativado' });
    const freshFromApi = buildRestaurant({ externalId: 'ext-1' });

    mockGetStorageRestaurant.mockResolvedValue(staleFromStorage);
    mockGetUserRestaurants.mockResolvedValue([freshFromApi]);

    render(
      <RestaurantProvider>
        <TestConsumer />
      </RestaurantProvider>,
    );

    await waitFor(() => {
      expect(capturedContext?.selectedRestaurant).toEqual(freshFromApi);
    });
  });
});
