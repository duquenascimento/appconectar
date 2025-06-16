import React, { ReactNode, useEffect, useState } from 'react'
import { View, Text, XStack, Input } from 'tamagui'
import { FlatList, TouchableOpacity, ActivityIndicator, Platform, Linking } from 'react-native'
import DropDownPicker from 'react-native-dropdown-picker'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import Icons from '@expo/vector-icons/Ionicons'
import { getOrders } from '../../src/services/orderService'
import { loadRestaurants } from '../../src/services/restaurantService'
import { RootStackParamList } from '../../src/types/navigationTypes'
import { ordersScreenStyles as styles } from '../../src/styles/styles'
import { clearStorage, deleteToken } from '../utils/utils'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { VersionInfo } from '../utils/VersionApp'

type OrdersScreenNavigationProp = NativeStackNavigationProp<RootStackParamList>

interface Order {
  orderDocument: ReactNode
  id: string
  deliveryDate: string
  totalConectar: number
  calcOrderAgain: {
    data: {
      supplier: {
        name: string
      }
    }[]
  }
}

interface Restaurant {
  externalId: any
  id: string
  name: string
  registrationReleasedNewApp: boolean
}

const formatDate = (isoDate: string) => {
  const date = new Date(isoDate)
  return date.toLocaleDateString('pt-BR', { timeZone: 'UTC' })
}

export function OrdersScreen({ navigation }: { navigation: OrdersScreenNavigationProp }) {
  const [orders, setOrders] = useState<Order[]>([])
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedOrders, setSelectedOrders] = useState<string[]>([])
  const [isDownloading, setIsDownloading] = useState(false)
  const [restaurants, setRestaurants] = useState<Restaurant[]>([])
  const [selectedRestaurant, setSelectedRestaurant] = useState('')
  const [restaurantOpen, setRestaurantOpen] = useState(false)

  useEffect(() => {
    const LoadRestaurants = async () => {
      try {
        const restaurantsData = await loadRestaurants()
        setRestaurants(restaurantsData)
        if (restaurantsData.length > 0) {
          const restaurant = await getSavedRestaurant()
          if (restaurant) {
            setSelectedRestaurant(restaurant.externalId)
          } else {
            setSelectedRestaurant(restaurantsData[0].externalId)
          }
        }
      } catch (error) {}
    }
    LoadRestaurants()
  }, [])

  useEffect(() => {
    const loadOrders = async () => {
      if (!selectedRestaurant) {
        return
      }
      setLoading(true)
      try {
        const result = await getOrders(1,100, selectedRestaurant)

        const ordersData = result.map((order: any) => {
          const filteredSupplier = order.calcOrderAgain?.data?.filter((item: any) => item.supplier?.externalId === order.supplierId) || []

          return {
            ...order,
            calcOrderAgain: {
              ...order.calcOrderAgain,
              data: filteredSupplier
            }
          }
        })
        setOrders(ordersData)
        setFilteredOrders(ordersData)
      } catch (error) {
        console.error('Erro ao carregar pedidos:', error)
      } finally {
        setLoading(false)
      }
    }
    loadOrders()
  }, [selectedRestaurant])

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

  async function handleRestaurantChoice(value: string | null) {
    try {
      if (!value) return

      const storedRestaurant = await getSavedRestaurant()
      if (storedRestaurant?.externalId === value) {
        return
      }

      const restaurant = restaurants.find((r) => r.externalId === value)
      if (restaurant) {
        await AsyncStorage.setItem('selectedRestaurant', JSON.stringify({ restaurant }))
      }
    } catch (error) {
      console.error('Falha na escolha de restaurante:', error)
    }
  }

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    const datePartialRegex = /^(\d{1,2})(\/\d{1,2})?(\/\d{1,4})?$/
    const isDatePartial = datePartialRegex.test(query)
    const filtered = orders.filter((order: any) => {
      if (isDatePartial) {
        const [day, month, year] = query.split('/')
        const deliveryDate = order.deliveryDate.split('T')[0] 
        const [orderYear, orderMonth, orderDay] = deliveryDate.split('-')
        if (day && !orderDay.startsWith(day)) return false
        if (month && !orderMonth.startsWith(month)) return false
        if (year && !orderYear.startsWith(year)) return false
        return true
      }
      const matchesId = order.id.toLowerCase().includes(query.toLowerCase())
      const matchesTotal = order.totalConectar.toString().includes(query)
      const matchExternalId = order.calcOrderAgain.data.find((item: any) => item.supplier && item.supplier.externalId === order.supplierId)

      const matchesSupplier =
        matchExternalId.supplier.name.toLowerCase().includes(query.toLowerCase())

      return matchesId || matchesTotal || matchesSupplier
    })

    setFilteredOrders(filtered)
    if (filtered.length === 0 && query.length > 0) {
    }
  }

  const toggleOrderSelection = (orderId: string) => {
    setSelectedOrders((prevSelected: any) => {
      if (prevSelected.includes(orderId)) {
        return prevSelected.filter((id: string) => id !== orderId)
      } else {
        return [...prevSelected, orderId]
      }
    })
  }

  const handleDownloadSelectedOrders = async () => {
    setIsDownloading(true)
    for (const orderId of selectedOrders) {
      const order: any = orders.find((order) => order.id === orderId)
      if (order && order.orderDocument) {
        if (Platform.OS === 'web') {
          window.open(order.orderDocument, '_blank')
          window.open(order.orderInvoices?.filePath[0], '_blank')
        } else {
          try {
            await Linking.openURL(order.orderDocument)
            await Linking.openURL(order.orderInvoices?.filePath[0])
          } catch (error) {
            console.error(`Erro ao abrir o link:`, error)
          }
        }
        await new Promise((resolve) => setTimeout(resolve, 1000))
      }
    }
    setIsDownloading(false)
  }

  const truncateText = (text: string, maxLength: number) => {
    if (text.length > maxLength) {
      return text.substring(0, maxLength) + '...'
    }
    return text
  }

  if (loading) {
    return (
      <View flex={1} justifyContent="center" alignItems="center">
        <ActivityIndicator size="large" color="#04BF7B" />
        <Text fontSize={16} mt={5} color="gray" textAlign="center">
          Carregando histórico de pedidos. Por favor Aguarde...
        </Text>
      </View>
    )
  }

  return (
    <>
      <Text
        style={{
          marginTop: 35,
          marginLeft: Platform.OS === 'web' ? '' : 15,
          width: Platform.OS === 'web' ? '70%' : '',
          alignSelf: Platform.OS === 'web' ? 'center' : 'flex-start'
        }}
      >
        Meus Pedidos
      </Text>
      <DropDownPicker
        value={selectedRestaurant}
        setValue={(value) => setSelectedRestaurant(value)}
        onChangeValue={handleRestaurantChoice}
        items={restaurants
          .filter((restaurant) => !restaurant.registrationReleasedNewApp)
          .map((restaurant) => ({
            label: restaurant.name,
            value: restaurant.externalId
          }))}
        open={restaurantOpen}
        setOpen={setRestaurantOpen}
        placeholder="Selecione um restaurante"
        listMode="SCROLLVIEW"
        dropDownContainerStyle={{
          width: Platform.OS === 'web' ? '70%' : '92%',
          alignSelf: 'center'
        }}
        style={{
          width: Platform.OS === 'web' ? '70%' : '92%',
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

      <XStack
        backgroundColor="#FFF"
        borderRadius={20}
        width={Platform.OS === 'web' ? '70%' : '92%'}
        marginTop={20}
        alignSelf="center"
        alignItems="center"
      >
        <Icons name="search" size={24} color="#04BF7B" style={{ marginLeft: 15 }} />
        <Input
          width={Platform.OS === 'web' ? '67%' : '92%'}
          placeholder="Buscar pedidos..."
          value={searchQuery}
          onChangeText={(text) => {
            setSearchQuery(text)
            handleSearch(text)
          }}
          backgroundColor="transparent"
          borderWidth={0}
          borderColor="transparent"
          fontSize={14}
          color="#000"
          flex={1}
          placeholderTextColor="#888"
        />
      </XStack>

      <TouchableOpacity
        onPress={handleDownloadSelectedOrders}
        disabled={selectedOrders.length === 0 || isDownloading}
        style={{
          width: Platform.OS === 'web' ? '70%' : '92%',
          backgroundColor: selectedOrders.length > 0 ? '#04BF7B' : '#ccc',
          paddingVertical: 10,
          paddingHorizontal: 20,
          borderRadius: 5,
          alignItems: 'center',
          alignSelf: 'center',
          marginBottom: 16,
          marginTop: Platform.OS === 'web' ? 20 : 15,
          marginHorizontal: 15
        }}
      >
        {isDownloading ? <ActivityIndicator color="#fff" /> : <Text style={{ color: '#fff', fontSize: 16, fontWeight: 'bold' }}>Baixar Documentos Selecionados</Text>}
      </TouchableOpacity>

      <FlatList
        style={{
          width: Platform.OS === 'web' ? '70%' : undefined,
          alignSelf: 'center'
        }}
        data={filteredOrders}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={() => <Text style={styles.emptyText}>Nenhum pedido encontrado.</Text>}
        renderItem={({ item }) => {
          const supplierName = item.calcOrderAgain?.data[0]?.supplier?.name || 'Fornecedor não disponível'
          const truncatedSupplierName = truncateText(supplierName, 20)
          return (
            <TouchableOpacity onPress={() => navigation.navigate('OrderDetails', { orderId: item.id })} style={styles.itemContainer}>
              <TouchableOpacity onPress={() => toggleOrderSelection(item.id)} style={styles.checkboxContainer}>
                <Text>{selectedOrders.includes(item.id) ? '✓' : ''}</Text>
              </TouchableOpacity>

              <View style={styles.leftColumn}>
                <Text mb={10} style={styles.orderId}>
                  {item.id}
                </Text>
                <Text style={styles.deliveryDate}>{formatDate(item.deliveryDate)}</Text>
              </View>

              <View style={styles.rightColumn}>
                <Text mb={10} style={styles.total}>
                  R$ {item.totalConectar.toFixed(2)}
                </Text>
                <Text>{truncatedSupplierName}</Text>
              </View>
              <Icons
                name="chevron-forward"
                size={20}
                color="#000"
                style={{
                  marginLeft: 'auto'
                }}
              />
            </TouchableOpacity>
          )
        }}
      />
      <View justifyContent="center" alignItems="center" flexDirection="row" gap={30} height={55} borderTopWidth={0.2} borderTopColor="lightgray">
        <View onPress={() => navigation.replace('Products')} padding={10} marginVertical={10} borderRadius={8} flexDirection="column" justifyContent="center" alignItems="center" width={80} height={70}>
          <Icons name="home" size={20} color="gray" />
          <Text fontSize={12} color="gray">
            Home
          </Text>
        </View>
        <View
          onPress={async () => {
            setLoading(true)
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
          <Icons name="journal" size={20} color="#04BF7B" />
          <Text fontSize={12} color="#04BF7B">
            Meus Pedidos
          </Text>
        </View>
        <View
          onPress={async () => {
            setLoading(true)
            await Promise.all([clearStorage(), deleteToken()])
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
        <VersionInfo />
      </View>
    </>
  )
}
