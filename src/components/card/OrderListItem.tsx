import { TouchableOpacity } from 'react-native';
import { View, Text, YStack } from 'tamagui';
import Icons from '@expo/vector-icons/Ionicons';

import { getBrazilLocaleString } from '@/src/utils/dateUtils';
import BadgeText from '@/src/components/text/BadgeText';
import { ordersScreenStyles as styles } from '@/src/styles/styles';
import { OrderHistory } from '@/src/types/IOrder';

interface OrderListItemProps {
  item: OrderHistory;
  isLargeScreen?: boolean;
  selectedOrders: string[];
  onToggleSelect: (orderId: string) => void;
  onPress: (orderId: string) => void;
}

export default function OrderListItem({
  item,
  selectedOrders,
  onToggleSelect,
  onPress,
}: OrderListItemProps) {
  const isCanceled = item.status_id === 6;
  const isPix = isCanceled ? false : (item.paymentWay === 'AV01' || item.paymentWay === 'AV00');

  const BadgeComponent = () => {
    if(isCanceled) {
      return (<BadgeText text="Pedido Cancelado" color="#ff2233" />);
    }

    if(isPix && 'status_id' in item) {
      if(item.status_id === 8) {
        return (<BadgeText text="Pagamento Pendente" color="#183fc0ff" />);
      } else if(item.status_id === 12) {
        return (<BadgeText text="Pagamento Confirmado" color='#04BF7B' />);
      }
    }

    return undefined;
  };

  return (
    <TouchableOpacity
      onPress={() => onPress(item.id)}
    >
      <View flex={1} flexDirection="row" marginVertical={15} gap={3}>
        <TouchableOpacity
          onPress={() => onToggleSelect(item.id)}
          style={[
            styles.checkboxContainer,
            {
              borderColor: '#04BF7B',
              borderWidth: 3,
            },
          ]}
        >
          <Text>{selectedOrders.includes(item.id) ? '✓' : ''}</Text>
        </TouchableOpacity>

        <View style={styles.leftColumn}>
          <Text marginBottom={10} style={styles.orderId}>
            {item.id}
          </Text>

          <Text style={styles.deliveryDate}>{getBrazilLocaleString(item.deliveryDate)}</Text>
        </View>

        <YStack alignItems="flex-end">
          <BadgeComponent />

          <Text marginBottom={10} style={styles.total}>
              R$ {Number(item.totalConectar).toFixed(2)}
            </Text>

          <Text numberOfLines={1}>{item.supplier?.nomefornecedor ?? 'Fornecedor Indiponível'}</Text>
        </YStack>

        <Icons name="chevron-forward" size={20} color="#000" />
      </View>
    </TouchableOpacity>
  );
}
