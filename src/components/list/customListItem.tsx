import React from 'react'
import { TouchableOpacity, Platform } from 'react-native'
import Icons from '@expo/vector-icons/Ionicons'
import { Text, View, styled, XStack, YStack } from 'tamagui'
import { formatCurrency } from '@/app/utils/formatCurrency'

export interface Combination {
  id: string
  combination: string
  supplier?: string
  createdAt?: string
  delivery?: string
  missingItems?: number
  totalValue?: number
  supplierClosed?: string
}

interface ListItemProps extends Combination {
  onPress: (id: string) => void
}

const ItemContainer = styled(XStack, {
  name: 'ItemContainer',
  alignItems: 'center',
  justifyContent: 'space-between',
  paddingVertical: '$4',
  paddingHorizontal: '$4',
  backgroundColor: '#fff',
  borderBottomWidth: 1,
  borderBottomColor: '#eee'
})

const LeftContent = styled(XStack, {
  name: 'LeftContent',
  alignItems: 'center',
  flex: 1,
  space: '$3'
})

const Circle = styled(View, {
  width: 40,
  height: 40,
  borderRadius: 9999,
  backgroundColor: '#e0e0e0'
})

const InfoContainer = styled(YStack, {
  flexShrink: 1,
  space: '$1'
})

const ItemTitle = styled(Text, {
  fontSize: 16,
  color: '#000'
})

const ItemSubTitle = styled(Text, {
  fontSize: 13,
  color: '#555'
})

const RightContent = styled(YStack, {
  alignItems: 'flex-end',
  space: '$1'
})

const ItemTotalValue = styled(Text, {
  fontSize: 15,
  fontWeight: 'bold',
  color: '#000',
  textAlign: 'right'
})

const ItemMissing = styled(Text, {
  fontSize: 12,
  color: '#666',
  textAlign: 'right'
})

const IconContent = styled(View, {
  justifyContent: 'center',
  paddingRight: Platform.OS === 'web' ? '10%' : 0
})

const CustomListItem: React.FC<ListItemProps> = ({ id, combination, supplier, createdAt, delivery, totalValue, missingItems, supplierClosed, onPress }) => {
  return (
    <TouchableOpacity onPress={() => onPress(id)}>
      <ItemContainer>
        <LeftContent>
          <Circle />
          <InfoContainer>
            <ItemTitle>{combination}</ItemTitle>
            {!!supplier && <ItemSubTitle>{supplier}</ItemSubTitle>}
            {!!createdAt && <ItemSubTitle>Criada em {createdAt}</ItemSubTitle>}
            {!!delivery && <ItemSubTitle>{delivery}</ItemSubTitle>}
            {!!supplierClosed && <ItemSubTitle>{supplierClosed}</ItemSubTitle>}
          </InfoContainer>
        </LeftContent>

        <RightContent>
          {totalValue !== undefined && <ItemTotalValue>{formatCurrency(totalValue)}</ItemTotalValue>}
          {missingItems !== undefined && <ItemMissing>{`${missingItems} faltante${missingItems !== 1 ? 's' : ''}`}</ItemMissing>}
        </RightContent>

        <IconContent>
          <Icons name="chevron-forward" size={20} color="#000" />
        </IconContent>
      </ItemContainer>
    </TouchableOpacity>
  )
}

export default CustomListItem
