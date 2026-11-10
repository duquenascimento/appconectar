import { useEffect, useMemo, useState } from 'react';

import { useAuthContext } from '../contexts/auth.context';
import { useRestaurantContext } from '../contexts/restaurant.context';
import { useMobilePushRegistration } from './useMobilePushRegistration';
import { useWebPushRegistration } from './useWebPushRegistration';

export function usePushRegistration(): void {
  const { getTokenPayload } = useAuthContext();
  const { restaurants } = useRestaurantContext();
  const [userId, setUserId] = useState<string | null>(null);

  const channelIds = useMemo(
    () => restaurants?.map((restaurant) => restaurant.id) ?? [],
    [restaurants],
  );

  useEffect(() => {
    let isMounted = true;

    async function loadUserId() {
      try {
        const tokenPayload = await getTokenPayload();

        if (!tokenPayload?.id) {
          console.log({
            code: 'TOKEN_PAYLOAD_NOT_FOUND',
            message: 'Não foi possível identificar o usuário logado.',
          });
          return;
        }

        if (isMounted) {
          setUserId(tokenPayload.id);
        }
      } catch (error) {
        console.log('Erro ao obter usuário para registrar push:', error);
      }
    }

    void loadUserId();

    return () => {
      isMounted = false;
    };
  }, [getTokenPayload]);

  const registrationEnabled = Boolean(userId) && channelIds.length > 0;

  useMobilePushRegistration({
    enabled: registrationEnabled,
    userType: 'restaurant',
    userId,
    channelType: 'restaurant',
    channelIds,
  });

  useWebPushRegistration({
    enabled: registrationEnabled,
    userType: 'restaurant',
    userId,
    channelType: 'restaurant',
    channelIds,
  });
}
