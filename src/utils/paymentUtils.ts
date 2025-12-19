import { PaymentDescriptions } from '../types/paymentTypes';

export const getPaymentDescription = (paymentWay: string) => {
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
  };

  return paymentDescriptions[paymentWay] || '';
};
