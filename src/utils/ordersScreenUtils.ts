import { ScheduleOrderResponse } from '../types/scheduleOrderTypes';
import { isTomorrow, getBrazilDateTime } from './dateUtils';

enum OrderStatus {
  CANCELED = 'CANCELED',
  PENDING = 'PENDING',
  ACTIVE = 'ACTIVE',
}

export const getStatusAndColor = (item: ScheduleOrderResponse): [string, string] => {
  if (isTomorrow(getBrazilDateTime(item.deliveryDate))) {
    return ['Aguardando confirmação', '#FFC107'];
  }
  if (item.status === OrderStatus.CANCELED) {
    return ['Cancelado', '#DD2300'];
  }
  return ['Agendado', '#4CAF50'];
};
