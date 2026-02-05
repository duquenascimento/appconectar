import { Combination } from '@/src/types/combinationTypes';
import { formatCurrency } from '@/src/utils/formatCurrency';
import Icons from '@expo/vector-icons/Ionicons';
import React from 'react';
import { Platform, TouchableOpacity } from 'react-native';
import { styled, Text, View, XStack, YStack, Tooltip } from 'tamagui';
import CustomAlert from '../modais/CustomAlert';

interface ListItemProps extends Combination {
  tooltip?: string;
  onPress?: (id: string) => void;
}

const ItemContainer = styled(XStack, {
  name: 'ItemContainer',
  alignItems: 'center',
  paddingVertical: '$4',
  paddingHorizontal: Platform.OS === 'web' ? '$4' : '$5',
  backgroundColor: '#fff',
  borderBottomWidth: 1,
  borderBottomColor: '#eee',
  flexDirection: 'row',
});

const ItemContent = styled(XStack, {
  name: 'ItemContainer',
  alignItems: 'center',
  flex: 1,
  justifyContent: 'space-between',
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
  terminationCondition,
  tooltip,
  onPress,
}) => {
  let description = unavailable
    ? (terminationCondition ?? `Fornecedor(es) \nfechado(s) ou \nabaixo do \nvalor mínimo`)
    : `${missingItems} faltante${missingItems !== 1 ? 's' : ''}`;
  const [tooltipVisible, setTooltipVisible] = React.useState(false);
  return (
    <TouchableOpacity
      disabled={onPress === undefined || totalValue === 0 || unavailable ? true : false}
      onPress={onPress && (() => onPress(id))}
    >
        <ItemContainer>
          <ItemContent  opacity={totalValue === 0 || unavailable ? 0.5 : 1}>
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
              <ItemMissing
                maxWidth={200}
                color={!unavailable && missingItems === 0 ? '#666' : 'red'}
              >
                {description}
              </ItemMissing>
            )}
          </RightContent>
          </ItemContent>
          {!unavailable && onPress && (
            <IconContent>
              <Icons name="chevron-forward" size={20} color="#000" />
            </IconContent>
          )}
          {unavailable && tooltip && (
            <Icons
              onPress={() => setTooltipVisible(true)}
              name={'information-circle'}
              size={25}
              style={{ marginRight: 10 }}
              color="#04BF7B"
            />
          )}
          {tooltip && (
            <CustomAlert
              visible={tooltipVisible}
              title="Informação"
              color="#000"
              message={tooltip}
              onConfirm={() => setTooltipVisible(false)}
            />
          )}
        </ItemContainer>
        
    </TouchableOpacity>
  );
};

export default CustomListItem;
