import { Combination } from '@/src/types/combinationTypes';
import { formatCurrency } from '@/src/utils/formatCurrency';
import Icons from '@expo/vector-icons/Ionicons';
import React from 'react';
import { Platform, TouchableOpacity } from 'react-native';
import { styled, Text, View, XStack, YStack } from 'tamagui';

interface ListItemProps extends Combination {
  onPress: (id: string) => void;
}

const ItemContainer = styled(XStack, {
  name: 'ItemContainer',
  alignItems: 'center',
  justifyContent: 'space-between',
  paddingVertical: '$4',
  paddingHorizontal: Platform.OS === 'web' ? '$4' : '$5',
  backgroundColor: '#fff',
  borderBottomWidth: 1,
  borderBottomColor: '#eee',
  flexDirection: 'row',
});

const LeftContent = styled(XStack, {
  name: 'LeftContent',
  alignItems: 'center',
  flex: 1,
  space: '$3',
  marginRight: Platform.OS === 'web' ? 0 : 20,
});

const Circle = styled(View, {
  width: 40,
  height: 40,
  borderRadius: 9999,
  backgroundColor: '#e0e0e0',
});

const InfoContainer = styled(YStack, {
  flexShrink: 1,
  space: '$1',
});

const ItemTitle = styled(Text, {
  fontSize: Platform.OS === 'web' ? 16 : 14,
  color: '#000',
});

const ItemSubTitle = styled(Text, {
  fontSize: 12,
  color: '#555',
});

const RightContent = styled(YStack, {
  alignItems: 'flex-end',
  space: '$1',
  marginRight: Platform.OS === 'web' ? 10 : 0,
});

const ItemTotalValue = styled(Text, {
  fontSize: 15,
  fontWeight: 'bold',
  color: '#000',
  textAlign: 'right',
});

const ItemMissing = styled(Text, {
  fontSize: 12,
  color: 'red',
  textAlign: 'right',
});

const IconContent = styled(View, {
  justifyContent: 'center',
  paddingRight: Platform.OS === 'web' ? '1%' : 0,
});

const CustomListItem: React.FC<ListItemProps> = ({
  id,
  combination,
  supplier,
  createdAt,
  delivery,
  totalValue,
  missingItems,
  supplierClosed,
  unavailable,
  onPress,
}) => {
  return (
    <TouchableOpacity
      disabled={totalValue === 0 || unavailable ? true : false}
      onPress={() => onPress(id)}
    >
      <ItemContainer opacity={totalValue === 0 || unavailable ? 0.5 : 1}>
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
          {totalValue !== undefined && !unavailable && (
            <ItemTotalValue>{formatCurrency(totalValue)}</ItemTotalValue>
          )}
          {(missingItems !== undefined || unavailable) && (
            <ItemMissing color={!unavailable && missingItems === 0 ? '#666' : 'red'}>
              {supplier === 'N/A'
                ? `Indisponível`
                : unavailable
                  ? `Fornecedor(es) \nfechado(s) ou \nabaixo do \nvalor mínimo`
                  : `${missingItems} faltante${missingItems !== 1 ? 's' : ''}`}
            </ItemMissing>
          )}
        </RightContent>

        <IconContent>
          <Icons name="chevron-forward" size={20} color="#000" />
        </IconContent>
      </ItemContainer>
    </TouchableOpacity>
  );
};

export default CustomListItem;
