import { useEffect, useState } from 'react'
import { useRouter, useSegments } from 'expo-router'
import { getToken, deleteToken, getStorage } from '../../utils/utils'

export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const segments = useSegments()

  const checkAuth = async () => {
    try {
      setIsLoading(true)
      const token = await getToken()
      const authenticated = !!token
      setIsAuthenticated(authenticated)

      if (authenticated) {
        const role = await getStorage('role')

        if (isPublicRoute(segments)) {
          if (role === 'registered') {
            router.replace('/products')
          } else if (role === 'registering') {
            router.replace('/register')
          }
          return authenticated
        }

        if (isProtectedRoute(segments) && role === 'registering') {
          router.replace('/register')
          return authenticated
        }

      } else {
        if (isProtectedRoute(segments)) {
          router.replace('/')
        }
      }

      return authenticated
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

  const logout = async () => {
    await deleteToken()
    setIsAuthenticated(false)
    router.replace('/')
  }

  useEffect(() => {
    checkAuth()
  }, [segments])

  return {
    isAuthenticated,
    isLoading,
    checkAuth,
    logout
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
