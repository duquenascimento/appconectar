import { TwoButtonCustomAlert } from '@/src/components/modais/TwoButtonCustomAlert';
import { Platform } from 'react-native';

interface SundayOrderAlertProps {
  visible: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

export default function SundayOrderAlert({ visible, onCancel, onConfirm }: SundayOrderAlertProps) {
  return (
    <TwoButtonCustomAlert
      visible={visible}
      title="Pedido para domingo"
      message="O pedido será entregue no próximo domingo. Você tem certeza que deseja continuar?"
      onCancel={onCancel}
      cancelText="Cancelar"
      onConfirm={onConfirm}
      confirmText="Continuar"
      width={Platform.OS !== 'web' ? '90%' : '30%'}
    />
  );
}
