import { View, Select, Image, YStack, XStack, Text, Adapt, Sheet, Input, Button, Stack, ScrollView, Dialog } from 'tamagui'
import { useState, useMemo, useCallback, useEffect, useRef } from 'react'
import Icons from '@expo/vector-icons/Ionicons'
import { ActivityIndicator, FlatList, Modal, Platform, TextInput, TouchableOpacity, VirtualizedList } from 'react-native'
import React from 'react'
import { type NativeStackNavigationProp } from '@react-navigation/native-stack'
import ImageViewer from 'react-native-image-zoom-viewer'
import { MotiView } from 'moti'
import { Skeleton } from 'moti/skeleton'
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated'
import { clearStorage, deleteStorage, deleteToken, getStorage, getToken, setStorage } from '../utils/utils'
import * as Linking from 'expo-linking'
import DropDownPicker from 'react-native-dropdown-picker'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { VersionInfo, SaveUserAppInfo } from '../utils/VersionApp'
import CustomFlatList from '../utils/FlatList_VirtualizeList/FlatList_Products'
import CustomVirtualizedList from '../utils/FlatList_VirtualizeList/VirtualizeList_Products'
import DialogComercialInstance from '@/src/components/dialogComercialInstance'

type Product = {
  name: string
  orderUnit: string
  quotationUnit: string
  convertedWeight: number
  class: string
  sku: string
  id: string
  active: true
  createdBy: string
  createdAt: string
  changedBy: string
  updatedAt: string
  image: string[]
  favorite?: boolean
  mediumWeight: number
  firstUnit: number
  secondUnit: number
  thirdUnit: number
  obs: string
}

type HomeScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Home'>
}

type RootStackParamList = {
  Home: undefined
  Products: undefined
  Cart: undefined
  Sign: undefined
  Orders: undefined
}

type Cart = {
  productId: string
  amount: number
  obs: string
}

type SelectItem = {
  name: string
}

type ProductBoxProps = Product & {
  toggleFavorite: (productId: string) => void
  favorites: Product[]
  saveCart: (cart: Cart, isCart: boolean) => Promise<void>
  saveCartArray: (cart: Map<string, Cart>, exclude: Map<string, Cart>) => Promise<void>
  cartToExclude: Map<string, Cart>
  setLoading: (status: boolean) => void
  cart: Map<string, Cart>
  setImage: (imageString: string) => void
  setModalVisible: (status: boolean) => void
  mediumWeight: number
  firstUnit: number
  secondUnit: number
  thirdUnit: number
  currentClass: string
  obs: string
  addObservation: (productId: string, observation: string) => Promise<void | null | undefined>
  onObsChange: (text: string) => void
}

const CartButton = ({ cartSize, isScrolling, onPress }: any) => {
  const opacity = useSharedValue(0)
  const translateY = useSharedValue(50)

  const hideTimeout = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (cartSize <= 0) {
      opacity.value = withTiming(0, { duration: 250 })
      translateY.value = withTiming(50, { duration: 250 })
      return
    }

    if (isScrolling) {
      if (hideTimeout.current) {
        clearTimeout(hideTimeout.current)
        hideTimeout.current = null
      }
      opacity.value = withTiming(1, { duration: 100 })
      translateY.value = withTiming(0, { duration: 100 })
    } else {
      hideTimeout.current = setTimeout(() => {
        opacity.value = withTiming(0, { duration: 200 })
        translateY.value = withTiming(50, { duration: 200 })
      }, 2000)
    }

    return () => {
      if (hideTimeout.current) {
        clearTimeout(hideTimeout.current)
      }
    }
  }, [cartSize, isScrolling, opacity, translateY])

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
    pointerEvents: opacity.value === 1 ? 'auto' : 'none'
  }))

  if (Platform.OS === 'web') {
    return (
      <div
        style={{
          position: 'absolute',
          bottom: 65,
          left: 0,
          right: 0,
          display: cartSize <= 0 ? 'none' : 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 100,
          pointerEvents: 'none'
        }}
      >
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
          <div
            style={{
              backgroundColor: '#FFA500',
              width: 160,
              height: 25,
              borderRadius: 24,
              padding: '8px 16px',
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <div
              style={{
                position: 'relative',
                display: 'flex',
                alignItems: 'center'
              }}
            >
              <Icons size={25} color="white" name="cart" />
              <div
                style={{
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
                }}
              >
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
    <Animated.View
      style={[
        {
          position: 'absolute',
          bottom: 65,
          left: 0,
          right: 0,
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 100
        },
        animatedStyle
      ]}
      pointerEvents="box-none"
    >
      <TouchableOpacity activeOpacity={0.9} onPress={cartSize > 0 ? onPress : undefined} disabled={cartSize <= 0}>
        <View backgroundColor="#FFA500" width={160} height={45} borderRadius={24} paddingHorizontal={16} paddingVertical={8} flexDirection="row" alignItems="center" justifyContent="center" pointerEvents="auto">
          <View>
            <Icons size={25} color="white" name="cart" />
            <View position="absolute" bottom={-1} right={-5} backgroundColor="white" borderRadius={10} width={15} height={15} alignItems="center" justifyContent="center" borderColor="#FFA500" borderWidth={1}>
              <Text fontSize={9} color="#FFA500">
                {cartSize}
              </Text>
            </View>
          </View>
          <Text color="white" paddingLeft={8}>
            Carrinho
          </Text>
        </View>
      </TouchableOpacity>
    </Animated.View>
  )
}

export function DialogFinanceInstance(props: { openModal: boolean; setRegisterInvalid: Function; rest: any }) {
  return (
    <Dialog modal open={props.openModal}>
      <Adapt when="sm" platform="touch">
        <Sheet
          animationConfig={{
            type: 'spring',
            damping: 20,
            mass: 0.5,
            stiffness: 200
          }}
          animation="medium"
          zIndex={200000}
          modal
          dismissOnSnapToBottom
          snapPointsMode="fit"
        >
          <Sheet.Frame padding="$4" gap="$4">
            <Adapt.Contents />
          </Sheet.Frame>
          <Sheet.Overlay animation="quickest" enterStyle={{ opacity: 0 }} exitStyle={{ opacity: 0 }} />
        </Sheet>
      </Adapt>

      <Dialog.Portal>
        <Dialog.Overlay key="overlay" animation="quick" opacity={0.5} enterStyle={{ opacity: 0 }} exitStyle={{ opacity: 0 }} />

        <Dialog.Content
          bordered
          elevate
          key="content"
          animateOnly={['transform', 'opacity']}
          animation={[
            'quicker',
            {
              opacity: {
                overshootClamping: true
              }
            }
          ]}
          enterStyle={{ x: 0, y: -20, opacity: 0, scale: 0.9 }}
          exitStyle={{ x: 0, y: 10, opacity: 0, scale: 0.95 }}
          gap="$4"
        >
          <Dialog.Title mx="auto">Conta bloqueada</Dialog.Title>
          <Dialog.Description>Informamos que sua conta está bloqueada devido a pendências com a plataforma. Por favor, entre em contato agora para desbloquear a sua conta</Dialog.Description>

          <XStack alignSelf="center" gap="$4">
            <Dialog.Close displayWhenAdapted asChild>
              <Button
                width="$20"
                theme="active"
                aria-label="Close"
                backgroundColor="$red9"
                color="$white1"
                onPress={async () => {
                  const text = encodeURIComponent(`Olá! Estou com pendências em minha conta, represento os seguintes restaurantes:
${props.rest.map(
  (item: any) => `
- ${item.name}`
)}

Consegue me ajudar?`)
                    .replace('!', '%21')
                    .replace("'", '%27')
                    .replace('(', '%28')
                    .replace(')', '%29')
                    .replace('*', '%2A')
                  await Linking.openURL(`https://wa.me/5521999954372?text=${text}`)
                }}
              >
                Entre em contato
              </Button>
            </Dialog.Close>
          </XStack>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog>
  )
}

const ProductBox = React.memo(
  ({ id, name, image, mediumWeight, firstUnit, secondUnit, thirdUnit, orderUnit, toggleFavorite, favorites, saveCart, saveCartArray, cartToExclude, cart, setImage, setModalVisible, currentClass, obs: parentObs, addObservation, onObsChange }: ProductBoxProps) => {
    const [quant, setQuant] = useState<number>(firstUnit ? firstUnit : 1)
    const [valueQuant, setValueQuant] = useState(0)
    const [obs, setObs] = useState(parentObs)
    const [open, setOpen] = useState<boolean>(false)

    const obsRef = useRef('')
    const quantRef = useRef<number>(firstUnit)
    const previousCartRef = useRef<Map<string, Cart>>(new Map())
    const debounceTimerRef = useRef<NodeJS.Timeout | null>(null)

    const isFavorite = useMemo(() => favorites.some((favorite) => favorite.id === id), [favorites, id])
    const isCart = useMemo(() => cart.has(id), [cart, id])

    const toggleOpen = useCallback(() => setOpen((prev) => !prev), [])

    useEffect(() => {
      const cartProduct = cart.get(id)
      const favoriteProduct = favorites.find((f) => f.id === id)
      if (favoriteProduct?.obs) {
        setObs(favoriteProduct.obs)
        onObsChange(favoriteProduct.obs)
      } else if (cartProduct?.obs) {
        setObs(cartProduct.obs)
        onObsChange(cartProduct.obs)
      }
    }, [favorites, cart.get(id)?.obs])

    useEffect(() => {
      const currentCartItem = cart.get(id)
      const previousCartItem = previousCartRef.current.get(id)

      if ((!currentCartItem && !previousCartItem) || (currentCartItem && previousCartItem && currentCartItem.amount === previousCartItem.amount && currentCartItem.obs === previousCartItem.obs)) {
        return
      }

      if (currentCartItem) {
        setValueQuant(Number(currentCartItem.amount))
        setObs(currentCartItem.obs || '')
        onObsChange(currentCartItem.obs || '')
      } else {
        setValueQuant(0)
        setObs('')
        onObsChange('')
      }

      previousCartRef.current = new Map(cart)
    }, [cart])

    const handlePersistCart = useCallback(() => {
      const currentItem = { amount: valueQuant, productId: id, obs }
      const previousItem = previousCartRef.current.get(id)

      const shouldPersist = valueQuant > 0 || (previousItem && valueQuant !== previousItem.amount) || (previousItem && obs !== previousItem.obs)

      if (shouldPersist) {
        saveCart(currentItem, !!previousItem)
        previousCartRef.current.set(id, currentItem)
      }
    }, [valueQuant, obs, id, saveCart])

    useEffect(() => {
      const timer = setTimeout(handlePersistCart, 1000)
      return () => clearTimeout(timer)
    }, [valueQuant, obs, handlePersistCart])

    const handleQuantityChange = (newQuant: number) => {
      setQuant(newQuant)
      quantRef.current = newQuant
    }

    const handleObsChange = (text: string) => {
      setObs(text)
      onObsChange(text)
      if (isFavorite) {
        addObservation(id, text)
      }
    }

    const handleValueQuantChange = async (delta: number) => {
      const newAmount = Math.max(0, Number((valueQuant + delta).toFixed(3)))
      setValueQuant(newAmount)

      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current)
      }

      debounceTimerRef.current = setTimeout(async () => {
        const updatedItem = { productId: id, amount: newAmount, obs }
        const mapItem = new Map([[id, updatedItem]])
        const mapToRemove = delta < 0 && newAmount === 0 ? mapItem : new Map()

        await saveCart(updatedItem, true)
        await saveCartArray(mapItem, mapToRemove)
      }, 500)
    }

    const handleBlur = useCallback(async () => {
      if (obsRef.current !== obs) {
        try {
          await addObservation(id, obs)
          obsRef.current = obs
        } catch (error) {
          console.error('Failed to save observation:', error)
        }
      }
    }, [addObservation, id, obs])

    return (
      <Stack onPress={toggleOpen} flex={1} minHeight={40} borderWidth={1} borderRadius={12} borderColor="#F0F2F6">
        <View style={{ width: Platform.OS === 'web' ? '70%' : '', alignSelf: 'center' }} flex={1} justifyContent="space-between" alignItems="center" paddingHorizontal={8} flexDirection="row" minHeight={40} backgroundColor="white" borderRadius={12} borderBottomLeftRadius={open || isCart || (isFavorite && currentClass === 'Favoritos') ? 0 : 12} borderBottomRightRadius={open || isCart || (isFavorite && currentClass === 'Favoritos') ? 0 : 12}>
          <View flexDirection="row" alignItems="center">
            <View
              p={Platform.OS === 'web' ? 10 : 0}
              onPress={(e) => {
                e.stopPropagation()
                setImage(image[0])
                setModalVisible(true)
              }}
            >
              <Image source={{ uri: image[0] }} width={60} height={60} />
            </View>
            <View marginLeft={8} maxWidth={Platform.OS === 'web' ? 130 : 130}>
              <Text fontSize={12}>{name}</Text>
            </View>
          </View>
          <View mr={10} flexDirection="row" alignItems="center" gap={16} cursor="pointer">
            <Icons size={24} name={isFavorite ? 'heart' : 'heart-outline'} color="red" onPress={() => toggleFavorite(id)} />
            {(isFavorite && currentClass === 'Favoritos') || isCart ? (
              <></>
            ) : isCart ? (
              <View borderColor="#FFA500" borderWidth={1} borderRadius={50} gap={8} justifyContent="center" alignItems="center" p={8} height={36} width={80} flexDirection="row">
                <Text fontSize={12} fontWeight="800">
                  {valueQuant}
                  <Text fontSize={8} color="gray">
                    {orderUnit.replace('Unid', 'Un')}
                  </Text>
                </Text>
                <Icons name="pencil-sharp" color="#FFA500" size={15} />
              </View>
            ) : (
              <Icons name={open ? 'chevron-up' : 'chevron-down'} size={30} color="#0BC07D" />
            )}
          </View>
        </View>
        {(open || isCart || (isFavorite && currentClass === 'Favoritos')) && (
          <View
            onPress={(e) => e.stopPropagation()}
            minHeight={Platform.OS === 'web' ? 50 : 85}
            borderTopWidth={1}
            borderTopColor="#ccc"
            paddingHorizontal={8}
            gap={8}
            borderBottomWidth={0}
            borderBottomLeftRadius={12}
            borderBottomRightRadius={12}
            backgroundColor="white"
            justifyContent="center"
            transform={[{ translateY: 0 }]}
            style={{
              width: Platform.OS === 'web' ? '70%' : '100%',
              alignSelf: 'center'
            }}
          >
            <View paddingHorizontal={Platform.OS === 'web' ? 10 : 0} flexDirection="row" alignItems="center" marginTop={Platform.OS === 'web' ? 0 : 10}>
              <View justifyContent={Platform.OS === 'web' ? 'flex-end' : 'flex-start'} alignItems="center" flex={1} mr={Platform.OS === 'web' ? 5 : 5} flexDirection="row" gap={8}>
                {Platform.OS === 'web' && (
                  <View alignSelf="flex-start" flex={1}>
                    <XStack backgroundColor="#F0F2F6" flex={1} paddingRight={14} borderWidth={0} borderRadius={20} alignItems="center" flexDirection="row" height={36}>
                      <Input
                        focusVisibleStyle={{ outlineWidth: 0 }}
                        placeholder="Observação para entrega..."
                        backgroundColor="transparent"
                        borderWidth={0}
                        borderColor="transparent"
                        flex={1}
                        fontSize={10}
                        maxLength={999}
                        onPressIn={(e) => {
                          e.stopPropagation()
                        }}
                        onChangeText={handleObsChange}
                        onBlur={handleBlur}
                        value={obs}
                      />
                    </XStack>
                  </View>
                )}

                {/*botao verde */}
                <Button
                  onPress={(e) => {
                    e.stopPropagation()
                    handleQuantityChange(firstUnit ? firstUnit : 1)
                  }}
                  backgroundColor={quant === (firstUnit ? firstUnit : 1) ? '#0BC07D' : '#F0F2F6'}
                  height={30}
                  minWidth={48}
                  borderRadius={12}
                >
                  <Text color={quant === (firstUnit ? firstUnit : 1) ? '#fff' : '#000'}>{firstUnit ? firstUnit : 1}</Text>
                </Button>
                <Button
                  onPress={(e) => {
                    e.stopPropagation()
                    handleQuantityChange(secondUnit ? secondUnit : 5)
                  }}
                  backgroundColor={quant === (secondUnit ? secondUnit : 5) ? '#0BC07D' : '#F0F2F6'}
                  color={quant === secondUnit ? '#fff' : '#000'}
                  height={30}
                  minWidth={48}
                  borderRadius={12}
                >
                  <Text color={quant === (secondUnit ? secondUnit : 5) ? '#fff' : '#000'}>{secondUnit ? secondUnit : 5}</Text>
                </Button>
                <Button
                  onPress={(e) => {
                    e.stopPropagation()
                    handleQuantityChange(thirdUnit ? thirdUnit : 10)
                  }}
                  backgroundColor={quant === (thirdUnit ? thirdUnit : 10) ? '#0BC07D' : '#F0F2F6'}
                  height={30}
                  color={quant === thirdUnit ? '#fff' : '#000'}
                  minWidth={48}
                  borderRadius={12}
                >
                  <Text color={quant === (thirdUnit ? thirdUnit : 10) ? '#fff' : '#000'}>{thirdUnit ? thirdUnit : 10}</Text>
                </Button>
              </View>
              <View alignItems="center" borderColor="#F0F2F6" borderWidth={1} p={4} borderRadius={18} flexDirection="row" gap={16}>
                <Icons
                  name="remove"
                  color="#04BF7B"
                  size={24}
                  onPress={async (e) => {
                    e.stopPropagation()
                    handleValueQuantChange(-quant)
                  }}
                />
                <Text>
                  {valueQuant} {orderUnit.replace('Unid', 'Un')}
                </Text>
                <Icons
                  name="add"
                  color="#04BF7B"
                  size={24}
                  onPress={async (e) => {
                    e.stopPropagation()
                    handleValueQuantChange(+quant)
                  }}
                />
              </View>
            </View>
            {Platform.OS !== 'web' && (
              <View>
                <XStack backgroundColor="#F0F2F6" paddingRight={14} borderWidth={0} borderRadius={20} alignItems="center" flexDirection="row" marginBottom={10} height={36}>
                  <Input
                    focusVisibleStyle={{ outlineWidth: 0 }}
                    placeholder="Observação para entrega..."
                    backgroundColor="transparent"
                    borderWidth={0}
                    borderColor="transparent"
                    flex={1}
                    fontSize={10}
                    maxLength={999}
                    onPressIn={(e) => {
                      e.stopPropagation()
                    }}
                    onChangeText={handleObsChange}
                    onBlur={handleBlur}
                    value={obs}
                  />
                </XStack>
              </View>
            )}
          </View>
        )}
      </Stack>
    )
  },
  (prevProps, nextProps) => {
    return prevProps.id === nextProps.id && prevProps.currentClass === nextProps.currentClass && prevProps.favorites.length === nextProps.favorites.length && prevProps.cart.size === nextProps.cart.size
  }
)

ProductBox.displayName = 'ProductBox'

type CustomSelectProps = {
  items: SelectItem[]
  native?: boolean
}

export const CustomSelect: React.FC<CustomSelectProps> = ({ items, ...props }) => {
  const [val, setVal] = useState('')

  const handleChange = async (value: string) => {
    setVal(value)
    await setStorage(
      'selectedRestaurant',
      JSON.stringify({
        restaurant: items.filter((item) => {
          if (typeof item.name != 'undefined' ? item.name : '' === value) return item
        })
      })
    )
  }

  return (
    <Select
      value={val}
      onValueChange={(value) => {
        handleChange(value)
      }}
      disablePreventBodyScroll
      {...props}
    >
      <Select.Trigger backgroundColor="$colorTransparent" paddingRight={20} alignItems="flex-start" paddingLeft={0} paddingVertical={0} borderWidth={0} width={220} pressStyle={{ backgroundColor: 'transparent' }} iconAfter={<Icons name="chevron-down" />}>
        <Select.Value fontSize={16} fontWeight="900" placeholder={typeof items[0].name != 'undefined' ? items[0].name : ''} />
      </Select.Trigger>

      <Adapt when="sm" platform="touch">
        <Sheet native={!!props.native} modal dismissOnSnapToBottom animation="bouncy">
          <Sheet.Overlay />
          <Sheet.Frame>
            <Sheet.ScrollView>
              <Adapt.Contents />
            </Sheet.ScrollView>
          </Sheet.Frame>
        </Sheet>
      </Adapt>

      <Select.Content zIndex={200_000}>
        <Select.ScrollUpButton alignItems="center" justifyContent="center" position="relative" width="100%" height={12}>
          <YStack zIndex={10}>
            <Icons name="chevron-up" size={20} />
          </YStack>
        </Select.ScrollUpButton>
        <Select.Viewport minWidth={200}>
          <Select.Group>
            <Select.Label>Restaurantes</Select.Label>
            {useMemo(
              () =>
                items.map((item, i) => (
                  <Select.Item index={i} key={typeof item.name != 'undefined' ? item.name : ''} value={typeof item.name != 'undefined' ? item.name.toLowerCase() : ''}>
                    <Select.ItemText>{typeof item.name != 'undefined' ? item.name : ''}</Select.ItemText>
                    <Select.ItemIndicator marginLeft="auto">
                      <Icons name="checkmark" size={16} />
                    </Select.ItemIndicator>
                  </Select.Item>
                )),
              [items]
            )}
          </Select.Group>
          {props.native && (
            <YStack position="absolute" right={0} top={0} bottom={0} alignItems="center" justifyContent="center" width={16} pointerEvents="none">
              <Icons name="chevron-down" />
            </YStack>
          )}
        </Select.Viewport>

        <Select.ScrollDownButton alignItems="center" justifyContent="center" position="relative" width="100%" height={12}>
          <YStack zIndex={10}>
            <Icons name="chevron-down" size={20} />
          </YStack>
        </Select.ScrollDownButton>
      </Select.Content>
    </Select>
  )
}

let classItems: { name: string }[] = []

interface Restaurant {
  externalId: any
  id: string
  name: string
  registrationReleasedNewApp: boolean
}

export function Products({ navigation }: HomeScreenProps) {
  const [currentClass, setCurrentClass] = useState('Favoritos')
  const [productsList, setProductsList] = useState<Product[] | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [displayedProducts, setDisplayedProducts] = useState<Product[]>([])
  const [favorites, setFavorites] = useState<Product[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [cart, setCart] = useState<Map<string, Cart>>(new Map())
  const [cartToExclude, setCartToExclude] = useState<Map<string, Cart>>(new Map())
  const [isModalVisible, setModalVisible] = useState(false)
  const [image, setImage] = useState<string>('')
  const [skeletonLoading, setSkeletonLoading] = useState<boolean>(false)
  const [isScrolling, setIsScrolling] = useState(false)
  const [showRegistrationReleasedNewApp, setShowRegistrationReleasedNewApp] = useState(false)
  const [showFinanceBlock, setShowFinanceBlock] = useState(false)
  const [restaurantes, setRestaurantes] = useState<Restaurant[]>([])
  const [productObservations, setProductObservations] = useState(new Map())
  const [displayedCartSize, setDisplayedCartSize] = useState(cart.size)

  useEffect(() => {
    SaveUserAppInfo()
  }, [])

  useEffect(() => {
    const timeout = setTimeout(() => {
      setDisplayedCartSize(cart.size)
    }, 100)

    return () => clearTimeout(timeout)
  }, [cart.size])

  //seguindo o padrão das orders
  const [selectedRestaurant, setSelectedRestaurant] = useState<string | null>(null)
  const [restaurantOpen, setRestaurantOpen] = useState(false)

  const virtualizedListRef = useRef<VirtualizedList<Product>>(null)
  const flatListRef = useRef<FlatList<Product>>(null)

  const handleScroll = () => {
    if (!isScrolling) {
      setIsScrolling(true)
    }
  }

  const handleScrollEnd = () => {
    setIsScrolling(false)
  }

  const loadProducts = useCallback(async () => {
    try {
      const result = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/product/list`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: '{}'
      })
      const products = await result.json()

      setProductsList(products.data)
    } catch (error) {
      console.error('Error loading products:', error)
    }
  }, [])

  const loadFavorites = useCallback(async () => {
    try {
      const token = await getToken()
      const restaurant = await getSavedRestaurant()

      if (token == null || !restaurant) return []
      const result = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/favorite/list`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          token,
          restaurantId: restaurant.id
        })
      })
      if (!result.ok) return []
      const favorites = await result.json()
      if (favorites.data.length < 1) return []
      return favorites.data
    } catch (error) {
      console.error('Erro ao carregar favoritos:', error)
      return []
    }
  }, [])

  const loadCart = async (): Promise<Map<string, Cart>> => {
    try {
      const token = await getToken()
      if (!token) return new Map()

      const result = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/cart/list`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ token })
      })

      if (!result.ok) return new Map()

      const cart = await result.json()
      const cartMap = new Map<string, Cart>(cart.data.map((item: Cart) => [item.productId, item]))

      const localCartString = await getStorage('cart')
      const localCart = localCartString ? new Map<string, Cart>(JSON.parse(localCartString)) : new Map()

      // Merge local cart with server cart
      localCart.forEach((value, key) => {
        if (value.amount > 0) {
          cartMap.set(key, value)
        } else {
          cartMap.delete(key) // remove se estiver com amount 0
        }
      })

      await deleteStorage('cart-inside')
      await setStorage('cart', JSON.stringify(Array.from(cartMap.entries())))

      return cartMap
    } catch (error) {
      console.error('Erro ao carregar carrinho:', error)
      return new Map()
    }
  }
  const loadRestaurants = useCallback(async () => {
    try {
      const token = await getToken()
      if (token == null) return []
      const result = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/restaurant/list`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          token
        })
      })
      if (!result.ok) return []
      const restaurants = await result.json()
      if (restaurants.data.length < 1) return []
      return restaurants.data
    } catch (error) {
      console.error('Erro ao carregar restaurantes:', error)
      return []
    }
  }, [])

  const saveCart = useCallback(async (cart: Cart, isCart: boolean) => {
    let newCart = new Map()
    const attCart = async (): Promise<void> => {
      setCart((prevCart) => {
        newCart = new Map(prevCart)

        if (cart.amount === 0) {
          if (isCart) {
            newCart.delete(cart.productId)
            setCartToExclude((prevCartToExclude) => {
              const newCartToExclude = new Map(prevCartToExclude)
              newCartToExclude.set(cart.productId, cart)
              return newCartToExclude
            })
          }
        } else {
          newCart.set(cart.productId, cart)
          setCartToExclude((prevCartToExclude) => {
            const newCartToExclude = new Map(prevCartToExclude)
            newCartToExclude.delete(cart.productId)
            return newCartToExclude
          })
        }

        return newCart
      })
    }
    await attCart()
    await setStorage('cart', JSON.stringify(Array.from(newCart.entries())))
  }, [])

  const saveCartArray = useCallback(
    async (carts: Map<string, Cart>, cartsToExclude: Map<string, Cart>): Promise<void> => {
      const token = await getToken()
      if (token == null) return

      await fetch(`${process.env.EXPO_PUBLIC_API_URL}/cart/add`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          token,
          carts: Array.from(carts.values()),
          cartToExclude: Array.from(cartsToExclude.values())
        })
      })

      setCartToExclude(new Map())
      //modificado, reduzido a 3 ganchos para nao duplicar itens no carrinho
    },
    [saveCart, loadCart, loadProducts]
  )

  const getSavedRestaurant = async (): Promise<Restaurant | null> => {
    try {
      const data = await AsyncStorage.getItem('selectedRestaurant')
      if (!data) return null

      const parsedData = JSON.parse(data)

      if (!parsedData?.restaurant) {
        console.error('Formato inválido:', parsedData)
        return null
      }

      return parsedData.restaurant
    } catch (error) {
      console.error('Erro ao parsear dados:', error)
      return null
    }
  }

  useEffect(() => {
    const loadInitialData = async () => {
      setLoading(true)
      try {
        const [restaurants, savedRestaurant, cartMap] = await Promise.all([loadRestaurants(), getSavedRestaurant(), loadCart(), loadProducts()])

        const verduraKg = restaurants.filter((rest: any) => rest.verduraKg === true)
        // Extraindo categorias
        const categories = restaurants.flatMap((rest: any) => rest.categories || [])
        if (verduraKg.length && categories.length === 0) {
          classItems = [{ name: 'Favoritos' }, { name: 'Fruta' }, { name: 'Legumes' }, { name: 'Verduras - KG' }, { name: 'Especiarias' }, { name: 'Granja' }, { name: 'Cogumelos e trufas' }, { name: 'Higienizados' }]
        } else if (categories.length === 0) {
          classItems = [{ name: 'Favoritos' }, { name: 'Fruta' }, { name: 'Legumes' }, { name: 'Verduras' }, { name: 'Especiarias' }, { name: 'Granja' }, { name: 'Cogumelos e trufas' }, { name: 'Higienizados' }]
        } else {
          classItems = [{ name: 'Favoritos' }, ...categories.map((category: any) => ({ name: category }))]
        }

        const validRestaurants = Array.isArray(restaurants) ? restaurants : []

        setRestaurantes(validRestaurants)

        const availableRestaurants = validRestaurants.filter((r) => !r.registrationReleasedNewApp)
        const allRestaurantBlocked = availableRestaurants.length === 0

        let initialRestaurant = null
        if (!allRestaurantBlocked) {
          initialRestaurant = availableRestaurants[0]

          if (savedRestaurant) {
            const found = availableRestaurants.find((r) => r.id === savedRestaurant.id)
            if (found) {
              initialRestaurant = found
            }
          }
          setSelectedRestaurant(initialRestaurant.externalId)
          setStorage('selectedRestaurant', JSON.stringify({ restaurant: initialRestaurant }))
        }

        const restFilteredComercial = initialRestaurant?.registrationReleasedNewApp === true
        const restFilteredFinance = restaurants.filter((item: any) => item.financeBlock)
        if (restFilteredComercial || allRestaurantBlocked) {
          setShowRegistrationReleasedNewApp(true)
        }

        if (restFilteredFinance.length) {
          setShowFinanceBlock(true)
        }

        const favs = await loadFavorites()
        if (favs.length > 0) {
          setFavorites(favs)
        }
        if (cartMap.size > 0) {
          setCart(cartMap)
        }
        const newObservations = new Map()
        cart.forEach((item) => {
          if (item.obs) newObservations.set(item.productId, item.obs)
        })
        setProductObservations(newObservations)
      } catch (error) {
        console.error('Erro ao carregar dados:', error)
      } finally {
        setLoading(false)
      }
    }
    loadInitialData()
  }, [loadFavorites, loadProducts, loadRestaurants])

  useEffect(() => {
    const realoadFavs = async () => {
      const storedRestaurant = await getSavedRestaurant()
      if (storedRestaurant?.externalId === selectedRestaurant) return
      if (selectedRestaurant) {
        loadFavorites().then((favs) => {
          if (favs.length > 0) setFavorites(favs)
          if (favs.length === 0) setFavorites(favs)
        })
      }
    }
    realoadFavs()
  }, [selectedRestaurant])

  const addToFavorites = useCallback(
    async (productId: string, obs: string) => {
      try {
        const token = await getToken()
        const restaurant = await getSavedRestaurant()
        if (token == null || !restaurant) return
        const productToAdd = productsList?.find((product) => product.id === productId)
        if (productToAdd) {
          setFavorites([...favorites, { ...productToAdd, obs }])
        }
        const storedRestaurant = await getSavedRestaurant()

        const result = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/favorite/save`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            productId,
            restaurantId: storedRestaurant?.id,
            token,
            obs
          })
        })
        if (!result.ok) return null
      } catch (error) {
        console.error('Erro ao adicionar aos favoritos:', error)
      }
    },
    [favorites, productsList, selectedRestaurant]
  )

  const addObservation = useCallback(
    async (productId: string, observation: string): Promise<void | null | undefined> => {
      try {
        const token = await getToken()
        const restaurant = await getSavedRestaurant()
        if (token == null || !restaurant) return
        const productToAdd = productsList?.find((product) => product.id === productId)
        const storedRestaurant = await getSavedRestaurant()

        const isFavorite = favorites.some((fav) => fav.id === productId)
        if (!isFavorite) {
          return
        }

        const result = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/favorite/update`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            productId,
            restaurantId: storedRestaurant?.id,
            token,
            obs: observation
          })
        })
        if (!result.ok) return null
      } catch (error) {
        console.error('Erro ao adicionar aos favoritos:', error)
      }
    },
    [favorites, productsList, selectedRestaurant]
  )

  const removeFromFavorites = useCallback(
    async (productId: string) => {
      try {
        const token = await getToken()
        const restaurant = await getSavedRestaurant()
        setFavorites(favorites.filter((favorite) => favorite.id !== productId))
        if (token == null || !restaurant) return
        const storedRestaurant = await getSavedRestaurant()

        const result = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/favorite/del`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            productId,
            restaurantId: storedRestaurant?.id,
            token
          })
        })
        if (!result.ok) return null
      } catch (error) {
        console.error('Erro ao remover dos favoritos:', error)
      }
    },
    [favorites]
  )

  /*const toggleFavorite = useCallback(
    async (productId: string) => {
      const isCurrentlyFavorite = favorites.some((favorite) => favorite.id === productId)
      if (isCurrentlyFavorite) {
        await removeFromFavorites(productId)
      } else {
        await addToFavorites(productId)
      }
    },
    [favorites, addToFavorites, removeFromFavorites]
  )*/

  const toggleFavorite = useCallback(
    async (productId: string) => {
      const product = productsList?.find((p) => p.id === productId)
      const isCurrentlyFavorite = favorites.some((f) => f.id === productId)

      if (isCurrentlyFavorite) {
        await removeFromFavorites(productId)
      } else {
        // Adiciona a observação atual ao favoritar
        const currentObs = productObservations.get(productId) || ''
        await addToFavorites(productId, currentObs)

        // Se houver uma observação no carrinho, sincroniza com os favoritos
        const cartItem = cart.get(productId)
        if (cartItem?.obs && cartItem.obs !== currentObs) {
          await addObservation(productId, cartItem.obs)
          setProductObservations((prev) => new Map(prev).set(productId, cartItem.obs))
        }
      }
    },
    [favorites, productObservations, cart]
  )

  useEffect(() => {
    if (virtualizedListRef.current) {
      virtualizedListRef.current.scrollToOffset({ animated: true, offset: 0 })
    } else if (flatListRef.current) {
      flatListRef.current.scrollToOffset({ animated: true, offset: 0 })
    }
  }, [currentClass, searchQuery])

  useEffect(() => {
    if (productsList) {
      productsList.sort((a, b) => a.name.toLowerCase().localeCompare(b.name.toLowerCase()))
    }
  }, [productsList])

  const filteredProducts = useMemo(() => {
    let products = productsList || []

    // Favoritos
    if (currentClass === 'Favoritos') {
      products = favorites
    } else {
      products = productsList?.filter((product) => product.class.toLowerCase() === currentClass.toLowerCase()) || []
    }

    // Normalizar a pesquisa (remover acentos e caracteres especiais)
    const normalizeText = (text: string) =>
      text
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()

    if (searchQuery) {
      const excludeClass = classItems[3].name === 'Verduras - KG' ? 'Verduras' : 'Verduras - KG'
      const normalizedQuery = normalizeText(searchQuery)
      const queryWords = normalizedQuery.split(' ').filter((word) => word !== '')

      products =
        productsList?.filter((product) => {
          const normalizedProductName = normalizeText(product.name)
          const productNameWords = normalizedProductName.split(' ')
          const isMatchingName = queryWords.every((queryWord) => productNameWords.some((productWord) => productWord.includes(queryWord)))
          const isNotExcludedClass = normalizeText(product.class) !== normalizeText(excludeClass)
          return isMatchingName && isNotExcludedClass
        }) ?? []
    }
    return products.sort((a, b) => a.name.toLowerCase().localeCompare(b.name.toLowerCase()))
  }, [currentClass, productsList, favorites, searchQuery])

  useEffect(() => {
    setDisplayedProducts(filteredProducts)
    setSkeletonLoading(false)
  }, [filteredProducts])

  const handlePress = useCallback(
    (name: string) => {
      setSearchQuery('')
      if (name !== currentClass) {
        setSkeletonLoading(true)
        setCurrentClass(name)
      }
    },
    [currentClass]
  )

  const renderClassItem = useCallback(
    ({ item }: { item: SelectItem }) => (
      <TouchableOpacity
        style={{
          padding: 8,
          ...(currentClass.toLowerCase() === item.name.toLowerCase() ? { borderBottomWidth: 1.5, borderBottomColor: '#04BF7B' } : {}),
          justifyContent: 'center'
        }}
        onPress={() => handlePress(item.name)}
      >
        <Text color={currentClass.toLowerCase() !== item.name.toLowerCase() ? '#aaa' : '#04BF7B'} fontSize={14} width={90} textAlign="center">
          {item.name}
        </Text>
      </TouchableOpacity>
    ),
    [currentClass, handlePress]
  )

  const handleSetImage = (imageString: string): void => {
    setImage(imageString)
  }

  const handleSetModalVisible = (status: boolean): void => {
    setModalVisible(status)
  }

  const renderProduct = useCallback(
    ({ item }: { item: Product }) => (
      <ProductBox
        currentClass={currentClass}
        setModalVisible={handleSetModalVisible}
        setImage={handleSetImage}
        key={item.id}
        toggleFavorite={toggleFavorite}
        {...item}
        favorites={favorites}
        saveCart={saveCart}
        setLoading={setLoading}
        saveCartArray={saveCartArray}
        cartToExclude={cartToExclude}
        cart={cart}
        obs={productObservations.get(item.id) || ''}
        onObsChange={(newObs: any) => {
          setProductObservations((prev) => {
            const newMap = new Map(prev)
            newMap.set(item.id, newObs)
            return newMap
          })
        }}
        addObservation={addObservation}
      />
    ),
    [cart, currentClass, favorites, saveCart, toggleFavorite, productObservations, addObservation]
  )

  async function handleRestaurantChoice(value: string | null) {
    try {
      if (!value) return

      const storedRestaurant = await getSavedRestaurant()
      if (storedRestaurant?.externalId === value) {
        return
      }

      const restaurant = restaurantes.find((r) => r.externalId === value)
      if (!restaurant) return
      if (restaurant.registrationReleasedNewApp === true) {
        setShowRegistrationReleasedNewApp(true)
        return
      }
      await AsyncStorage.setItem('selectedRestaurant', JSON.stringify({ restaurant }))
    } catch (error) {
      console.error('Falha na escolha de restaurante:', error)
    }
  }

  if (loading) {
    return (
      <View flex={1} justifyContent="center" alignItems="center">
        <ActivityIndicator size="large" color="#04BF7B" />
      </View>
    )
  }

  return (
    <Stack pt={20} backgroundColor="#f9f9f9" height="100%" position="relative">
      <DialogComercialInstance
        openModal={showRegistrationReleasedNewApp}
        setOpenModal={setShowRegistrationReleasedNewApp}
        setRegisterInvalid={setShowRegistrationReleasedNewApp}
        rest={restaurantes}
        navigation={navigation}
        messageText="Este restaurante não está liberado. Entre em contato conosco para concluir o processo."
        onSelectAvailable={() => {
          const availableRestaurant = restaurantes.find((r) => !r.registrationReleasedNewApp)
          if (availableRestaurant) {
            AsyncStorage.setItem('selectedRestaurant', JSON.stringify({ restaurant: availableRestaurant }))
            setSelectedRestaurant(availableRestaurant.externalId)
            setShowRegistrationReleasedNewApp(false)
            // Recarregar os dados do novo restaurante
            loadProducts()
            loadFavorites()
            loadCart()
          }
        }}
      />
      <DialogFinanceInstance openModal={showFinanceBlock} setRegisterInvalid={setShowFinanceBlock} rest={restaurantes} />
      <Modal visible={isModalVisible} transparent={true} onRequestClose={() => setModalVisible(false)}>
        <TouchableOpacity
          style={{
            flex: 1,
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            justifyContent: 'center',
            alignItems: 'center'
          }}
          activeOpacity={1}
          onPress={() => setModalVisible(false)}
        >
          <View width="100%" height="80%" backgroundColor="white" borderRadius={10} overflow="hidden" justifyContent="center" alignItems="center">
            <ImageViewer imageUrls={[{ url: image }]} enableSwipeDown={true} onSwipeDown={() => setModalVisible(false)} style={{ width: '100%', height: '100%' }} />
            <TouchableOpacity
              style={{
                position: 'absolute',
                top: 30,
                right: 30,
                backgroundColor: 'rgba(0, 0, 0, 0.6)',
                borderRadius: 20,
                padding: 10,
                zIndex: 1
              }}
              onPress={() => setModalVisible(false)}
            >
              <Text color="white" fontSize={20} fontWeight="bold">
                X
              </Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/*Lista de restaurantes do usuário*/}
      <Text
        style={{
          marginTop: Platform.OS === 'web' ? 15 : 35,
          marginLeft: Platform.OS === 'web' ? 23 : 15,
          width: Platform.OS === 'web' ? '70%' : '',
          alignSelf: Platform.OS === 'web' ? 'center' : 'flex-start'
        }}
      >
        Meus Restaurantes
      </Text>

      <DropDownPicker
        open={restaurantOpen}
        setOpen={setRestaurantOpen}
        value={selectedRestaurant}
        items={restaurantes.map((restaurant) => ({
          label: restaurant.name,
          value: restaurant.externalId
        }))}
        setValue={setSelectedRestaurant}
        onChangeValue={handleRestaurantChoice}
        placeholder={selectedRestaurant ? undefined : 'Selecione um restaurante'}
        listMode="SCROLLVIEW"
        dropDownDirection="BOTTOM"
        dropDownContainerStyle={{
          width: Platform.OS === 'web' ? '68%' : '92%',
          alignSelf: 'center'
        }}
        style={{
          width: Platform.OS === 'web' ? '68%' : '92%',
          alignSelf: 'center',
          marginTop: 10,
          marginHorizontal: 15,
          marginRight: 20,
          borderColor: '#ccc',
          borderWidth: 1,
          borderRadius: 5,
          height: 40
        }}
      />

      <View height={40} flex={1} paddingTop={8}>
        <XStack backgroundColor="#F0F2F6" marginTop={30} paddingRight={14} borderWidth={0} borderRadius={20} alignItems="center" flexDirection="row" margin={10} style={{ width: Platform.OS === 'web' ? '68.4%' : '', alignSelf: 'center' }}>
          <Input placeholder="Buscar produtos..." backgroundColor="transparent" borderWidth={0} borderColor="transparent" focusVisibleStyle={{ outlineWidth: 0 }} outlineStyle="none" flex={1} maxLength={50} value={searchQuery} onChangeText={setSearchQuery} />
          <Icons name="search" size={24} color="#04BF7B" />
        </XStack>

        <FlatList style={{ maxHeight: Platform.OS === 'web' ? 50 : 40, minHeight: Platform.OS === 'web' ? 50 : undefined, width: Platform.OS === 'web' ? '68%' : undefined, alignSelf: Platform.OS === 'web' ? 'center' : undefined }} data={classItems} horizontal showsHorizontalScrollIndicator={false} keyExtractor={(item: any) => item.name} renderItem={renderClassItem} />

        <View backgroundColor="#F0F2F6" flex={1} paddingHorizontal={16} paddingTop={5} borderTopColor="#aaa" borderTopWidth={0.5}>
          {currentClass === 'Favoritos' && favorites.length < 1 && !searchQuery ? (
            <View flex={1} paddingTop={50} alignItems="center">
              <Text pl={15} marginBottom={5} alignSelf="center" fontSize={14} color="#A9A9A9" textAlign="center">
                Busque os produtos da sua culinária e clique no coração para favoritar.
                <Text> </Text>
              </Text>
              <Icons name="heart-outline" size={25} color="gray" />
            </View>
          ) : !skeletonLoading ? (
            Platform.OS === 'android' ? (
              <CustomVirtualizedList data={displayedProducts} renderItem={renderProduct} keyExtractor={(item) => item.id} listRef={virtualizedListRef} onScroll={handleScroll} onMomentumScrollBegin={handleScroll} onMomentumScrollEnd={handleScrollEnd} />
            ) : (
              <CustomFlatList data={displayedProducts} renderItem={renderProduct} keyExtractor={(item) => item.id} onEndReached={loadProducts} onScroll={handleScroll} onMomentumScrollBegin={handleScroll} onMomentumScrollEnd={handleScrollEnd} listRef={flatListRef} />
            )
          ) : (
            <ScrollView>
              <View flex={1} minHeight={40} borderWidth={1} borderRadius={12} borderColor="#F0F2F6">
                {[...Array(7)].map((_, index) => (
                  <View key={index} justifyContent="space-between" alignItems="center" marginTop={8} paddingHorizontal={8} flexDirection="row" minHeight={80} backgroundColor="white" borderRadius={12}>
                    <MotiView
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        marginLeft: Platform.OS === 'web' ? 10 : 0
                      }}
                    >
                      <Skeleton colorMode="light" height={60} width={60} />
                      <View marginLeft={8} rowGap={5}>
                        <Skeleton colorMode="light" height={20} width={250} />
                        <Skeleton colorMode="light" height={10} width={50} />
                      </View>
                    </MotiView>
                  </View>
                ))}
              </View>
            </ScrollView>
          )}
        </View>
        <View justifyContent="center" alignItems="center" flexDirection="row" gap={30} height={55} borderTopWidth={0.2} borderTopColor="lightgray">
          <View onPress={() => navigation.replace('Products')} padding={10} marginVertical={10} borderRadius={8} flexDirection="column" justifyContent="center" alignItems="center" width={80} height={70}>
            <Icons name="home" size={20} color="#04BF7B" />
            <Text fontSize={12} color="#04BF7B">
              Home
            </Text>
          </View>
          <View
            onPress={async () => {
              setLoading(true)
              saveCartArray(cart, cartToExclude).catch(console.error)
              setLoading(false)
              navigation.replace('Orders')
            }}
            padding={10}
            marginVertical={10}
            borderRadius={8}
            flexWrap="nowrap"
            flexDirection="column"
            justifyContent="center"
            alignItems="center"
            width={120}
            height={70}
          >
            <Icons name="journal" size={20} color="gray" />
            <Text fontSize={12} color="gray">
              Meus Pedidos
            </Text>
          </View>
          <View
            onPress={async () => {
              setLoading(true)
              await saveCartArray(cart, cartToExclude)
              await Promise.all([clearStorage(), deleteToken()])
              setLoading(false)
              navigation.replace('Sign')
            }}
            padding={10}
            marginVertical={10}
            borderRadius={8}
            flexWrap="nowrap"
            flexDirection="column"
            justifyContent="center"
            alignItems="center"
            width={80}
            height={70}
          >
            <Icons name="log-out" size={20} color="gray" />
            <Text fontSize={12} color="gray">
              Sair
            </Text>
          </View>
        </View>
        <VersionInfo />
      </View>

      <CartButton
        cartSize={displayedCartSize}
        isScrolling={isScrolling}
        onPress={async () => {
          setLoading(true)
          navigation.replace('Cart')
        }}
      />
    </Stack>
  )
}
