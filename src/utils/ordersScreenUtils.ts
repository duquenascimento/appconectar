import { OrderData } from '../types/IOrder'
import { ScheduleOrderResponse } from '../types/scheduleOrderTypes';
import { isTomorrow, getBrazilDateTime } from './dateUtils';

export const getStatusAndColor = (item: ScheduleOrderResponse): [string, string] => {
  if (isTomorrow(getBrazilDateTime(item.deliveryDate))) {
    return ['Aguardando confirmação', '#FFC107'];
  }
  if (item.status == 'CANCELED') {
    return ['Cancelado', '#DD2300'];
  }
  return ['Agendado', '#4CAF50'];
};

export const getCancellationSecondsLeft = (orderHour, supplierClosingTimeStr) => {
  const orderDate = new Date(orderDate);
  const now = new Date();

  const deadline15Min = new Date(orderDate.getTime() + 15 * 60 * 1000);

  const [closingHour, closingMinute] = supplierClosingTimeStr.split(':').map(Number);
  
  const deadlineClosing = new Date(orderDate); // Clona a data do pedido
  deadlineClosing.setHours(closingHour, closingMinute, 0, 0);

  const finalDeadline = (deadlineClosing < deadline15Min) ? deadlineClosing : deadline15Min;

  const diffInMilliseconds = finalDeadline - now;

  if (diffInMilliseconds <= 0) {
    return 0;
  }

  return Math.floor(diffInMilliseconds / 1000);
};