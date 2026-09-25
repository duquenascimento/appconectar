import { Text, View } from 'tamagui';
import { useResponsiveness } from '../hooks/useResponsiveness';

interface SupplierOpeningHourBannerProps {
  // eslint-disable-next-line react/require-default-props
  message?: string;
}

export function SupplierOpeningHourBanner({
  message = 'Fornecedor indisponível para pedidos no momento',
}: SupplierOpeningHourBannerProps) {
  const { isLargeScreen } = useResponsiveness();

  return (
    <View
      backgroundColor="#fbe8e8"
      borderColor="#e88a8a"
      borderWidth={1}
      paddingHorizontal={15}
      paddingVertical={12}
      marginVertical={10}
      marginHorizontal={isLargeScreen ? 'auto' : 10}
      borderRadius={5}
      width="auto"
    >
      <Text fontSize={14} color="#801c1c" fontWeight="600" marginBottom={4}>
        Fornecedor indisponível
      </Text>
      <Text fontSize={13} color="#801c1c">
        {message}. Agende uma notificação para ser avisado no horário.
      </Text>
    </View>
  );
}
