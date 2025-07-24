
import { Platform, SectionList, StyleSheet } from 'react-native'
import CustomSubtitle from './subtitle/customSubtitle'
import { useCallback, useEffect, useMemo, useState } from 'react'
import CustomListItem from './list/customListItem'
import { useRoute } from '@react-navigation/native'
import { Restaurant } from '@/app/screens/PreferencesScreen'
import { getAllCombinationsByRestaurant } from '../services/combinationsService'
import { getStorage, setStorage } from '@/app/utils/utils'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { useNavigation } from '@react-navigation/native';


type HomeScreenPropsUtils = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'QuotationDetails'>;
};
export interface Combination {
  id: string
  combination: string
  supplier?: string
  delivery?: string
  createdAt?: string
  missingItems?: number
  totalValue?: number
  supplierClosed?: string
  status: 'minha' | 'com_alteracao' | 'indisponivel'
}

export interface CombinationService {
  id: string
  combination: string
  supplier?: string
  delivery?: string
  createdAt?: string
  missingItems?: number
  totalValue?: number
  supplierClosed?: string
}

export type RootStackParamList = {
  Sign: undefined
  Products: undefined
  Preferences: undefined
  CombinationDetail: { id: string }
  CreateCombination: undefined
  QuotationDetails: { id: string }
}

const CombinationList: React.FC = () => {
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null)
  const [minecombinations, setMineCombinations] = useState<Combination[]>([])
   const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const handleCombinationPress = (combinationId: string) => {
  navigation.navigate('QuotationDetails', { id: combinationId })
}

  const route = useRoute()

  const restaurantId = useMemo(() => {
    return (route.params as { restaurantId?: string })?.restaurantId ?? restaurant?.id
  }, [route.params, restaurant])

  useEffect(() => {
    const fetchStoredRestaurant = async () => {
      const storedValue = await getStorage('selectedRestaurant')
      let restaurantFromStorage = null

      if (storedValue) {
        try {
          const parsedValue = JSON.parse(storedValue)
          restaurantFromStorage = parsedValue?.restaurant ?? parsedValue ?? null
        } catch {
          restaurantFromStorage = null
        }
      }

      setRestaurant(restaurantFromStorage)
    }

    fetchStoredRestaurant()
  }, [])

  const loadCombinations = useCallback(async () => {
    if (!restaurantId) return

    try {
      const res = await getAllCombinationsByRestaurant(restaurantId)

      if (!res) {
        throw new Error('Resposta inesperada da API')
      } else {
        const mapped = res.return.map((item: any) => ({
          id: item.id,
          combination: item.nome,
          supplier: 'Fornecedor 1',
          missingItems: 0,
          totalValue: 10.5
        }))

        setMineCombinations(mapped)
        await setStorage('combinations', JSON.stringify(mapped));
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro desconhecido'
      console.error('Erro ao buscar combinações:', message)
    }
  }, [restaurantId])

  useEffect(() => {
    loadCombinations()
  }, [loadCombinations])

  
  const [combinationsAlter, setCombinationsAlter] = useState<Combination[]>([
    { id: '1', combination: 'Combinação 1', supplier: 'Fornecedor 1', delivery: 'Entrega de 07:00 às 09:00', missingItems: 0, totalValue: 0 },
    { id: '2', combination: 'Combinação 2', supplier: 'Fornecedor 2', delivery: 'Entrega de 07:00 às 09:00', missingItems: 1, totalValue: 10.5 }
  ])
  const [combinationsUnvaliable, setCombinationsUnvaliable] = useState<Combination[]>([
    { id: '1', combination: 'Combinação 1', supplier: 'Fornecedor 1', supplierClosed: 'Forn. Fechado (18)', missingItems: 0, totalValue: 0 },
    { id: '2', combination: 'Combinação 2', supplier: 'Fornecedor 2', supplierClosed: 'Forn. Fechado (18)', missingItems: 1, totalValue: 10.5 }
  ])

  const sections = [
    { title: 'Minhas combinações', data: minecombinations },
    { title: 'Disponíveis com alteração', data: combinationsAlter },
    { title: 'Combinações indisponíveis', data: combinationsUnvaliable }
  ]

  return <SectionList sections={sections} keyExtractor={(item) => item.id} renderItem={({ item }) => <CustomListItem id={item.id} combination={item.combination} supplier={item.supplier} delivery={item.delivery} totalValue={item.totalValue} missingItems={item.missingItems} createdAt={item.createdAt} supplierClosed={item.supplierClosed} onPress={() => handleCombinationPress(item.id)} />} renderSectionHeader={({ section: { title } }) => <CustomSubtitle>{title}</CustomSubtitle>} contentContainerStyle={styles.listContentContainer} style={[styles.container, { width: Platform.OS === 'web' ? '70%' : '90%', alignSelf: 'center' }]} />
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  listContentContainer: {
    paddingBottom: 100 
  }
})

export default CombinationList
