import * as Clipboard from 'expo-clipboard';
import { Button, Image, Text, View } from 'tamagui';
import { useToastController } from '@tamagui/toast';
import { PixCharge } from '../types/pixTypes';
import { addMinutes } from '../utils/dateUtils';

export function PixDisplay(props: { pixCharge?: PixCharge | null }) {
  const { pixCharge } = props;
  const toast = useToastController();

  return (
    <View maxWidth={200} gap={'$2'} testID="pix-display">
      {pixCharge && (
        <Image
          testID="pix-qr-code"
          source={{ uri: `data:image/png;base64,${pixCharge.encodedImage}` }}
          width={200}
          height={200}
          accessibilityLabel="QR Code"
        />
      )}
      {pixCharge && (
        <Text testID="pix-validade" color="gray" fontSize={10} textAlign="center">
          {' '}
          {addMinutes(30, pixCharge!.createdAt).toFormat("'Válido até' dd/MM/yyyy HH:mm")}{' '}
        </Text>
      )}
      <Button
        testID="botao-copiar-pix"
        backgroundColor={!pixCharge ? '$gray9' : 'orange'}
        hoverStyle={{ backgroundColor: '$orange9' }}
        disabled={!pixCharge}
        onPress={async () => {
          await Clipboard.setStringAsync(pixCharge!.qrCode);
          toast.show('Código copiado', {
            message: 'O código já está na sua área de transferência.',
            duration: 2000,
          });
        }}
      >
        <Text color="white" fontSize={16} letterSpacing={1} fontWeight="500">
          Copiar QR Code
        </Text>
      </Button>
    </View>
  );
}
