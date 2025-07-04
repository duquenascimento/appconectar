import { ScrollView } from 'tamagui'
import { Combo } from '../services/combinationService'
import { FlatList, Platform, SectionList, StyleSheet } from 'react-native'
import CustomSubtitle from './subtitle/customSubtitle'
import { useState } from 'react'
import CustomListItem from './list/customListItem'
import { useNavigation } from '@react-navigation/native'
import { NativeStackNavigationProp } from 'react-native-screens/lib/typescript/native-stack/types'

interface CombosListProps {
  combos: Combo[]
}

export interface Combination {
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
}

type PreferencesScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Preferences'>

const handleCombinationPress = (combinationId: string) => {
  //useNavigation.navigate('CombinationDetail', { id: combinationId })
}

const CombinationList: React.FC<CombosListProps> = ({ combos }) => {
  const navigation = useNavigation<PreferencesScreenNavigationProp>()

  const [minecombinations, setMineCombinations] = useState<Combination[]>([
    { id: '1', combination: 'Combinação 1', supplier: 'Fornecedor 1', missingItems: 0, totalValue: 0 },
    { id: '2', combination: 'Combinação 2', supplier: 'Fornecedor 2', missingItems: 1, totalValue: 10.5 }
  ])
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

  return (
    <SectionList
      sections={sections}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <CustomListItem
          id={item.id}
          combination={item.combination}
          supplier={item.supplier}
          delivery={item.delivery}
          totalValue={item.totalValue}
          missingItems={item.missingItems}
          createdAt={item.createdAt}
          supplierClosed={item.supplierClosed}
          onPress={handleCombinationPress}
        />
      )}
      renderSectionHeader={({ section: { title } }) => (
        <CustomSubtitle>{title}</CustomSubtitle>
      )}
      contentContainerStyle={styles.listContentContainer}
      style={[styles.container, { width: Platform.OS === 'web' ? '70%' : '90%', alignSelf: 'center' }]}
    />
  )
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
