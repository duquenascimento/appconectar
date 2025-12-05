import { TwoButtonCustomAlert } from '@/src/components/modais/TwoButtonCustomAlert';
import useWindowDimensions from '@/src/hooks/useWindowDimensions';

interface SundayOrderAlertProps {
  visible: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

export default function SundayOrderAlert({ visible, onCancel, onConfirm }: SundayOrderAlertProps) {
  const { isMobile } = useWindowDimensions();

  return (
    <TwoButtonCustomAlert
      visible={visible}
      title="Pedido para domingo"
      message="O pedido será entregue no próximo domingo. Você tem certeza que deseja continuar?"
      onCancel={onCancel}
      cancelText="Cancelar"
      onConfirm={onConfirm}
      confirmText="Continuar"
      width={isMobile ? '90%' : '30%'}
    />
  );
}
