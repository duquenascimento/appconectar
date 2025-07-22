import React, { useEffect, useRef } from 'react'
import { Platform, TouchableOpacity } from 'react-native'
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated'
import { View, Text } from 'tamagui'
import { Product } from '@/app/screens/products'
import Icons from '@expo/vector-icons/Ionicons'

type Props = {
  cartSize: number
  isScrolling: boolean
  visibleProducts: Product[]
  onPress: () => void
}

export const CartButton: React.FC<Props> = ({ cartSize, isScrolling, visibleProducts, onPress }) => {
  const opacity = useSharedValue(0)
  const translateY = useSharedValue(50)
  const hideTimeout = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (cartSize <= 0) {
      opacity.value = withTiming(0, { duration: 250 })
      translateY.value = withTiming(50, { duration: 250 })
      return
    }

    if (visibleProducts.length < 4) {
      opacity.value = withTiming(1, { duration: 100 })
      translateY.value = withTiming(0, { duration: 100 })
      return
    }

    if (isScrolling) {
      if (hideTimeout.current) clearTimeout(hideTimeout.current)
      opacity.value = withTiming(1, { duration: 100 })
      translateY.value = withTiming(0, { duration: 100 })
    } else {
      hideTimeout.current = setTimeout(() => {
        opacity.value = withTiming(0, { duration: 200 })
        translateY.value = withTiming(50, { duration: 200 })
      }, 2000)
    }

    return () => {
      if (hideTimeout.current) clearTimeout(hideTimeout.current)
    }
  }, [cartSize, isScrolling, visibleProducts])

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
    pointerEvents: opacity.value === 1 ? 'auto' : 'none'
  }))

  if (Platform.OS === 'web') {
    return (
      <div style={{
        position: 'absolute',
        bottom: 65,
        left: 0,
        right: 0,
        display: cartSize <= 0 ? 'none' : 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 100,
        pointerEvents: 'none'
      }}>
        <button
          style={{
            border: 'none',
            background: 'none',
            cursor: 'pointer',
            pointerEvents: 'auto'
          }}
          onClick={cartSize > 0 ? onPress : undefined}
          disabled={cartSize <= 0}
        >
          <div style={{
            backgroundColor: '#FFA500',
            width: 160,
            height: 25,
            borderRadius: 24,
            padding: '8px 16px',
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <Icons size={25} color="white" name="cart" />
              <div style={{
                position: 'absolute',
                bottom: -1,
                right: -5,
                backgroundColor: 'white',
                borderRadius: 10,
                width: 15,
                height: 15,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1px solid #FFA500',
                fontSize: 9,
                color: '#FFA500'
              }}>
                {cartSize}
              </div>
            </div>
            <span style={{ color: '#fff', paddingLeft: 8 }}>Carrinho</span>
          </div>
        </button>
      </div>
    )
  }

  return (
    <Animated.View style={[{
      position: 'absolute',
      bottom: 65,
      left: 0,
      right: 0,
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 100
    }, animatedStyle]} pointerEvents="box-none">
      <TouchableOpacity activeOpacity={0.9} onPress={cartSize > 0 ? onPress : undefined} disabled={cartSize <= 0}>
        <View backgroundColor="#FFA500" width={160} height={45} borderRadius={24} paddingHorizontal={16} paddingVertical={8} flexDirection="row" alignItems="center" justifyContent="center" pointerEvents="auto">
          <View>
            <Icons size={25} color="white" name="cart" />
            <View position="absolute" bottom={-1} right={-5} backgroundColor="white" borderRadius={10} width={15} height={15} alignItems="center" justifyContent="center" borderColor="#FFA500" borderWidth={1}>
              <Text fontSize={9} color="#FFA500">{cartSize}</Text>
            </View>
          </View>
          <Text color="white" paddingLeft={8}>Carrinho</Text>
        </View>
      </TouchableOpacity>
    </Animated.View>
  )
}
