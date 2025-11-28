import { DateTime } from 'luxon';
import { PaymentDescriptions } from '../types/paymentTypes';

export function isBefore13Hours(): boolean {
  const now = DateTime.now().setZone('America/Sao_Paulo'); // Data e hora atual
  const targetTime = now.set({ hour: 13, minute: 0, second: 0, millisecond: 0 }); // Define 13h00 no mesmo dia
  return now.valueOf() < targetTime.valueOf(); // Compara os timestamps em milissegundos
}

export function getSecondsUntil13h() {
  const now = DateTime.now().setZone('America/Sao_Paulo').toJSDate(); // Data e hora atual
  const target = new Date(); // Cria uma nova data (hoje)

  target.setHours(13, 0, 0, 0); // Define 13h00 na data atual

  const differenceInMillis = target.getTime() - now.getTime(); // Diferença em milissegundos

  // Converter milissegundos para segundos
  const differenceInSeconds = Math.floor(differenceInMillis / 1000);

  // Verifica se o horário já passou e retorna o valor (negativo ou positivo)
  return differenceInSeconds;
}

export function getDeliveryWindow(data: any) {
  if (!data || !data.addressInfos || !data.addressInfos.length) return '';
  const addr = data.addressInfos[0];
  const startTime = addr.initialDeliveryTime.substring(11, 16);
  const endTime = addr.finalDeliveryTime.substring(11, 16);
  return `Entre ${startTime} e ${endTime}`;
}

export const getPaymentDate = (paymentWay: string, emergencyOrder: boolean): string => {
  const today = new Date();
  const todayUTC = new Date(today.getTime() + today.getTimezoneOffset() * 60000);

  const offset = -3; // Horário padrão de São Paulo é UTC-3
  const deliveryDay = new Date(
    todayUTC.getFullYear(),
    todayUTC.getMonth(),
    todayUTC.getDate(),
    todayUTC.getHours() + offset,
    todayUTC.getMinutes(),
  );

  deliveryDay.setDate(emergencyOrder ? deliveryDay.getDate() : deliveryDay.getDate() + 1); // Se pedido de emergencia, mesmo dia, senão dia seguinte
  console.log('Delivery Day', deliveryDay, emergencyOrder);
  const calculateNextWeekday = (date: Date, day: number): Date => {
    const resultDate = new Date(date);
    resultDate.setDate(date.getDate() + ((day + (7 - date.getDay())) % 7));
    return resultDate;
  };

  const calculateNextBimonthly = (date: Date, day1: number, day2: number): Date => {
    const day = date.getDate();
    if (day < day1) {
      return new Date(date.getFullYear(), date.getMonth(), day1);
    }
    if (day < day2) {
      return new Date(date.getFullYear(), date.getMonth(), day2);
    }
    return new Date(date.getFullYear(), date.getMonth() + 1, day1);
  };

  const calculateNextMonthly = (date: Date, day: number): Date => {
    const nextDate = new Date(date.getFullYear(), date.getMonth(), day);
    if (date.getDate() >= day) {
      nextDate.setMonth(date.getMonth() + 1);
    }
    if (nextDate.getMonth() !== (date.getMonth() + 1) % 12) {
      nextDate.setDate(0);
    }
    return nextDate;
  };

  const paymentDescriptions: PaymentDescriptions = {
    DI00: deliveryDay.toLocaleDateString('pt-BR'),
    DI01: new Date(
      deliveryDay.getFullYear(),
      deliveryDay.getMonth(),
      deliveryDay.getDate() + 1,
    ).toLocaleDateString('pt-BR'),
    DI02: new Date(
      deliveryDay.getFullYear(),
      deliveryDay.getMonth(),
      deliveryDay.getDate() + 2,
    ).toLocaleDateString('pt-BR'),
    DI07: new Date(
      deliveryDay.getFullYear(),
      deliveryDay.getMonth(),
      deliveryDay.getDate() + 7,
    ).toLocaleDateString('pt-BR'),
    DI10: new Date(
      deliveryDay.getFullYear(),
      deliveryDay.getMonth(),
      deliveryDay.getDate() + 10,
    ).toLocaleDateString('pt-BR'),
    DI14: new Date(
      deliveryDay.getFullYear(),
      deliveryDay.getMonth(),
      deliveryDay.getDate() + 14,
    ).toLocaleDateString('pt-BR'),
    DI15: new Date(
      deliveryDay.getFullYear(),
      deliveryDay.getMonth(),
      deliveryDay.getDate() + 15,
    ).toLocaleDateString('pt-BR'),
    DI28: new Date(
      deliveryDay.getFullYear(),
      deliveryDay.getMonth(),
      deliveryDay.getDate() + 28,
    ).toLocaleDateString('pt-BR'),
    US08: calculateNextWeekday(deliveryDay, 1).toLocaleDateString('pt-BR'), // Próxima segunda-feira
    UQ10: calculateNextWeekday(deliveryDay, 3).toLocaleDateString('pt-BR'), // Próxima quarta-feira
    UX12: calculateNextWeekday(deliveryDay, 5).toLocaleDateString('pt-BR'), // Próxima sexta-feira
    BX10: calculateNextBimonthly(deliveryDay, 10, 25).toLocaleDateString('pt-BR'), // Bissemanal nos dias 10 e 25
    BX12: calculateNextBimonthly(deliveryDay, 12, 26).toLocaleDateString('pt-BR'), // Bissemanal nos dias 12 e 26
    BX16: calculateNextBimonthly(deliveryDay, 16, 30).toLocaleDateString('pt-BR'), // Bissemanal nos dias 16 e 30
    ME01: calculateNextMonthly(deliveryDay, 1).toLocaleDateString('pt-BR'), // Mensal no dia 1
    ME05: calculateNextMonthly(deliveryDay, 5).toLocaleDateString('pt-BR'), // Mensal no dia 5
    ME10: calculateNextMonthly(deliveryDay, 10).toLocaleDateString('pt-BR'), // Mensal no dia 10
    ME15: calculateNextMonthly(deliveryDay, 15).toLocaleDateString('pt-BR'), // Mensal no dia 15
    AV01: new Date(
      deliveryDay.getFullYear(),
      deliveryDay.getMonth(),
      deliveryDay.getDate() - 1,
    ).toLocaleDateString('pt-BR'), // À Vista: no dia anterior à entrega
    AV00: deliveryDay.toLocaleDateString('pt-BR'), // À Vista: no dia da entrega
  };

  return paymentDescriptions[paymentWay] || '';
};
