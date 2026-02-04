import { TouchableOpacity } from 'react-native';
import { View, Text, YStack } from 'tamagui';
import Icons from '@expo/vector-icons/Ionicons';

import { getBrazilLocaleString } from '@/src/utils/dateUtils';
import { isScheduleOrderResponse, ScheduleOrderResponse } from '@/src/types/scheduleOrderTypes';
import { getStatusAndColor } from '@/src/utils/ordersScreenUtils';
import BadgeText from '@/src/components/text/BadgeText';
import { ordersScreenStyles as styles } from '@/src/styles/styles';
import { OrderData } from '@/src/types/IOrder';

interface OrderListItemProps {
  item: OrderData | ScheduleOrderResponse;
  isLargeScreen: boolean;
  selectedOrders: string[];
  onToggleSelect: (orderId: string) => void;
  onPress: (orderId: string, isScheduled: boolean) => void;
}

export default function OrderListItem({
  item,
  isLargeScreen,
  selectedOrders,
  onToggleSelect,
  onPress,
}: OrderListItemProps) {
  const isScheduledOrder = isScheduleOrderResponse(item);
  const isCanceled = item.status_id === 6;

  const newFormatSupplier = Object.values(item.calcOrderAgain)
    .map((sup: any) => sup.supplier)
    .find((supplier) => supplier?.externalId === item.supplierId);

  const supplierName = isScheduledOrder
    ? item.combination?.nome || item.supplier?.name || 'Fornecedor indisponível'
    : item.calcOrderAgain?.data[0]?.supplier?.name ||
      newFormatSupplier?.name ||
      'Fornecedor indisponível';

  const truncatedSupplierName =
    supplierName.length > (isLargeScreen ? 20 : 12)
      ? supplierName.slice(0, isLargeScreen ? 20 : 12) + '...'
      : supplierName;

  const [status, statusColor] = isScheduledOrder ? getStatusAndColor(item) : [];

  return (
    <TouchableOpacity
      onPress={() => onPress(item.id, isScheduledOrder)}
      style={({ pressed }) => [styles.itemContainer]}
    >
      <View flex={1} flexDirection="row" marginVertical={15} gap={3}>
        {/* Checkbox */}
        <TouchableOpacity
          onPress={() => !isScheduledOrder && onToggleSelect(item.id)}
          disabled={isScheduledOrder}
          style={[
            styles.checkboxContainer,
            {
              borderColor: isScheduledOrder ? '#ccc' : '#04BF7B',
              borderWidth: 3,
            },
          ]}
        >
          <Text>{selectedOrders.includes(item.id) ? '✓' : ''}</Text>
        </TouchableOpacity>

        {/* Coluna esquerda */}
        <View style={styles.leftColumn}>
          {isScheduledOrder ? (
            <View
              backgroundColor={statusColor}
              borderRadius={20}
              paddingHorizontal={8}
              paddingVertical={2}
              marginBottom={4}
            >
              <Text color="white">{status}</Text>
            </View>
          ) : (
            <Text marginBottom={10} style={styles.orderId}>
              {item.id}
            </Text>
          )}

          <Text style={styles.deliveryDate}>{getBrazilLocaleString(item.deliveryDate)}</Text>
        </View>

        {/* Coluna direita */}
        <YStack alignItems="flex-end">
          {isCanceled && <BadgeText text="Pedido Cancelado" color="#ff2233" />}

          {!isScheduledOrder && (
            <Text marginBottom={10} style={styles.total}>
              R$ {item.totalConectar.toFixed(2)}
            </Text>
          )}

          <Text numberOfLines={1}>{truncatedSupplierName}</Text>
        </YStack>

        <Icons name="chevron-forward" size={20} color="#000" />
      </View>
    </TouchableOpacity>
  );
}
