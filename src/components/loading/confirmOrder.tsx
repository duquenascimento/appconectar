import { useEffect, useState } from 'react'
import { View, Image, Text } from 'tamagui'

interface LoadingConfirmProps {
  loading: boolean
}

export function LoadingConfirm({ loading }: LoadingConfirmProps) {
  const [dots, setDots] = useState('')

  useEffect(() => {
    if (loading) {
      const interval = setInterval(() => {
        setDots(prev => prev.length < 3 ? prev + '.' : '')
      }, 1000)
      return () => clearInterval(interval)
    }
  }, [loading])

  if (!loading) {
    return null
  }

  return (
    <View
      position="absolute"
      top={0}
      bottom={0}
      left={0}
      right={0}
      backgroundColor="#e3e6e7"
      justifyContent="center"
      alignItems="center"
      zIndex={9999}
    >
      <Image width={300} height={300} source={require('../../../assets/images/korzina.gif')} />
      <Text fontWeight="800" pt={20}>
        Estamos confirmando o seu pedido{dots}
      </Text>
    </View>
  )
}