import { getBrazilLocaleString } from './dateUtils';

export function getOrderStatusDescription(statusId: number, deliveryDate: string): string {
  switch (statusId) {
    case 6:
      return 'Cancelado';
    case 8:
      return 'Pendente';
    default:
      return `Confirmado ${getBrazilLocaleString(deliveryDate)}`;
  }
}
