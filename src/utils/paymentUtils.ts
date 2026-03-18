import { DateTime } from 'luxon';
import { PaymentDateData, PaymentDescriptions } from '../types/paymentTypes';
import { getBrazilDateTime, getBrazilDateTimeTomorrow, getBrazilLocaleString } from './dateUtils';

export const getPaymentDate = (paymentWay: string, emergencyOrder: boolean): string => {
  // Se pedido de emergencia, mesmo dia, senão dia seguinte
  const deliveryDay = emergencyOrder ? getBrazilDateTime() : getBrazilDateTimeTomorrow();

  const calculateNextWeekday = (date: DateTime, day: number): DateTime => {
    return date.plus({ days: (day + (7 - date.weekday)) % 7 });
  };

  const calculateNextBimonthly = (date: DateTime, day1: number, day2: number): DateTime => {
    const { day } = date;
    if (day < day1) {
      return date.set({ day: day1 });
    }
    if (day < day2) {
      return date.set({ day: day2 });
    }
    return date.plus({ months: 1 }).set({ day: day1 });
  };

  const calculateNextMonthly = (date: DateTime, day: number): DateTime => {
    const nextDate = date.set({ day }).plus({ months: date.day >= day ? 1 : 0 });
    return nextDate.day === day ? nextDate : nextDate.endOf('month');
  };

  const paymentDates: PaymentDateData = {
    DI00: deliveryDay,
    DI01: deliveryDay.plus({ days: 1 }),
    DI02: deliveryDay.plus({ days: 2 }),
    DI07: deliveryDay.plus({ days: 7 }),
    DI10: deliveryDay.plus({ days: 10 }),
    DI14: deliveryDay.plus({ days: 14 }),
    DI15: deliveryDay.plus({ days: 15 }),
    DI28: deliveryDay.plus({ days: 28 }),
    US08: calculateNextWeekday(deliveryDay, 1),
    UQ10: calculateNextWeekday(deliveryDay, 3),
    UX12: calculateNextWeekday(deliveryDay, 5),
    BX10: calculateNextBimonthly(deliveryDay, 10, 25),
    BX12: calculateNextBimonthly(deliveryDay, 12, 26),
    BX16: calculateNextBimonthly(deliveryDay, 16, 30),
    ME01: calculateNextMonthly(deliveryDay, 1),
    ME05: calculateNextMonthly(deliveryDay, 5),
    ME10: calculateNextMonthly(deliveryDay, 10),
    ME15: calculateNextMonthly(deliveryDay, 15),
    AV01: deliveryDay.minus({ days: 1 }),
    AV00: deliveryDay,
    CC32: deliveryDay,
  };

  const paymentDate = paymentDates[paymentWay];

  if (!paymentDate) return '--/--/----';

  return getBrazilLocaleString(paymentDate);
};

export const getPaymentDescription = (paymentWay: string): string => {
  const paymentDescriptions: PaymentDescriptions = {
    DI00: 'Diário: no dia da entrega',
    DI01: 'Diário: 1 dia após entrega',
    DI02: 'Diário: 2 dias após entrega',
    DI07: 'Diário: 7 dias após entrega',
    DI10: 'Diário: 10 dias após entrega',
    DI14: 'Diário: 14 dias após entrega',
    DI15: 'Diário: 15 dias após entrega',
    DI28: 'Diário: 28 dias após entrega',
    US08: 'Semanal: vencimento na segunda',
    UQ10: 'Semanal: vencimento na quarta',
    UX12: 'Semanal: vencimento na sexta',
    BX10: 'Bissemanal: vencimento na segunda',
    BX12: 'Bissemanal: vencimento na quarta',
    BX16: 'Bissemanal: vencimento na sexta',
    ME01: 'Mensal: vencimento dia 1',
    ME05: 'Mensal: vencimento dia 5',
    ME10: 'Mensal: vencimento dia 10',
    ME15: 'Mensal: vencimento dia 15',
    AV01: 'À Vista: pix no dia anterior à entrega',
    AV00: 'À Vista: pix no dia da entrega',
    CC32: 'Cartão de Crédito'
  };

  return paymentDescriptions[paymentWay] || '';
};
