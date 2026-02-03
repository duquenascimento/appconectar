import { Text, View } from 'tamagui';
import { useResponsiveness } from '../hooks/useResponsiveness';

export const RetroactiveQuotationWarningBanner = () => {
  const { isLargeScreen } = useResponsiveness();

  return (
    <View
      backgroundColor="#FFF3CD"
      borderColor="#FFC107"
      borderWidth={1}
      paddingHorizontal={15}
      paddingVertical={12}
      marginVertical={10}
      marginHorizontal={isLargeScreen ? 'auto' : 10}
      borderRadius={5}
      width="auto"
    >
      <Text fontSize={14} color="#856404" fontWeight="600" marginBottom={4}>
        ⚠️ Modo Somente Leitura
      </Text>
      <Text fontSize={13} color="#856404">
        Cotação retroativa: Esta é apenas uma visualização de preços históricos. Não é possível
        criar pedidos com datas passadas.
      </Text>
    </View>
  );
};
