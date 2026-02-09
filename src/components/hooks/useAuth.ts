import { useRouter, useSegments } from 'expo-router';
import { useEffect, useState } from 'react';
import { getStorage, getToken, STORAGE_DEFAULT_KEYS } from '../../utils/utils';

export function useAuthGuard() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const segments = useSegments();

  const checkAuth = async () => {
    try {
      setIsLoading(true)
      const token = await getToken()
      const authenticated = !!token
      setIsAuthenticated(authenticated)

      if (authenticated) {
        const role = await getStorage(STORAGE_DEFAULT_KEYS.USER_ROLES);

        if (isPublicRoute(segments)) {
          if (role?.includes('registered')) {
            router.replace('/products');
          } else if (role?.includes('registering')) {
            router.replace('/register');
          }
          return authenticated;
        }

        if (isProtectedRoute(segments) && role?.includes('registering')) {
          router.replace('/register');
          return authenticated;
        }

      } else {
        if (isProtectedRoute(segments)) {
          router.replace('/');
        }
      }

      return authenticated;
    } catch (error) {
      console.error('Auth check error:', error)
      setIsAuthenticated(false)
      if (isProtectedRoute(segments)) {
        router.replace('/')
      }
      return false
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    checkAuth()
  }, [segments])

  return {
    isAuthenticated,
    isLoading,
    checkAuth,
  }
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
    'quotationDetailsScreen'
  ]
  return protectedRoutes.includes(segments[0])
}

export function isPublicRoute(segments: string[]): boolean {
  const publicRoutes = ['', 'register', 'forgot-password', 'reset-password']
  return publicRoutes.includes(segments[0])
}
