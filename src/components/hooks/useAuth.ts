import { useEffect, useState } from 'react';
import { Platform } from 'react-native';
import { useGlobalSearchParams, useRouter, useSegments } from 'expo-router';
import {
  capturePendingInviteCode,
  clearPendingInviteCode,
  shouldClearPendingInviteCode,
} from '../../utils/inviteCode';
import { getToken, getStorage, STORAGE_DEFAULT_KEYS } from '../../utils/utils';

// Na web o parâmetro do router pode chegar um render depois da rota; a URL é a fonte
// de verdade para decidir apagar, para não descartar um código que acabou de chegar.
function getIndicacaoFromLocation(): string | null {
  if (Platform.OS !== 'web' || typeof window === 'undefined' || !window.location) {
    return null;
  }

  return new URLSearchParams(window.location.search).get('indicacao');
}

export function useAuthGuard() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const segments = useSegments();
  const { indicacao } = useGlobalSearchParams<{ indicacao?: string }>();

  const checkAuth = async () => {
    try {
      setIsLoading(true);

      if (indicacao) {
        await capturePendingInviteCode(indicacao);
      } else if (
        shouldClearPendingInviteCode(getCurrentRouteSegment(segments), getIndicacaoFromLocation())
      ) {
        await clearPendingInviteCode();
      }

      const token = await getToken();
      const authenticated = !!token;
      setIsAuthenticated(authenticated);

      if (authenticated) {
        const role = await getStorage(STORAGE_DEFAULT_KEYS.USER_ROLES);
        const currentRoute = getCurrentRouteSegment(segments);

        if (isPublicRoute(segments)) {
          if ((role?.includes('registered') || role?.includes('client')) && currentRoute !== 'products') {
            router.dismissTo('/products');
          } else if (role?.includes('registering') && currentRoute !== 'register') {
            router.dismissTo('/register');
          }
          return authenticated;
        }

        if (isProtectedRoute(segments) && role?.includes('registering')) {
          router.replace('/register');
          return authenticated;
        }
      } else if (isProtectedRoute(segments)) {
        router.replace('/');
      }

      return authenticated;
    } catch (error) {
      console.error('Auth check error:', error);
      setIsAuthenticated(false);
      if (isProtectedRoute(segments)) {
        router.replace('/');
      }
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, [segments, indicacao]);

  return {
    isAuthenticated,
    isLoading,
    checkAuth,
  };
}

function getCurrentRouteSegment(segments: string[]): string {
  const segment = segments.find((segment) => {
    return !segment.startsWith('(') && !segment.endsWith(')');
  });

  return segment ?? '';
}

export function isProtectedRoute(segments: string[]): boolean {
  const protectedRoutes = [
    'cart',
    'combination',
    'confirm',
    'finalConfirm',
    'orderConfirmedScreen',
    'orderDetailsScreen',
    'schedule',
    'ordersScreen',
    'preferencesScreen',
    'prices',
    'products',
    'quotationDetailsScreen',
  ];

  const currentRoute = getCurrentRouteSegment(segments);

  return protectedRoutes.includes(currentRoute);
}

export function isPublicRoute(segments: string[]): boolean {
  const publicRoutes = ['', 'cadastro', 'register', 'forgot-password', 'reset-password'];

  const currentRoute = getCurrentRouteSegment(segments);

  return publicRoutes.includes(currentRoute);
}
