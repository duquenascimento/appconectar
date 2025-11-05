import { useEffect } from 'react'
import { BackHandler } from 'react-native'
import { useRouter } from 'expo-router'

export const useBackHandler = (onBackPress?: () => boolean) => {
  const router = useRouter()

  useEffect(() => {
    const backAction = () => {
      if (onBackPress) {
        return onBackPress()
      }

      if (router.canGoBack()) {
        router.back()
        return true
      }

      return false
    }

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backAction
    )

    return () => backHandler.remove()
  }, [router, onBackPress])
}
