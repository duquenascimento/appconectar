import * as Clipboard from "expo-clipboard";
import { Button, Text, View } from "tamagui";
import { Toast, ToastProvider, useToastController } from '@tamagui/toast'
import { PixCharge } from "../types/pixTypes";
import { addMinutes } from "../utils/dateUtils";

export function PixDisplay(props: {pixCharge?: PixCharge | null}) {
  const { pixCharge } = props;
  const toast = useToastController();

  return (
    <View maxWidth={200} gap={'$2'}>
      <img src={pixCharge ? `data:image/png;base64,${pixCharge?.encodedImage}` : undefined} alt="QR Code"/>
      {pixCharge && <Text color="gray" fontSize={10} textAlign="center"> {addMinutes(30, pixCharge!.createdAt).toFormat("'Válido até' dd/MM/yyyy HH:mm")} </Text>}
      <Button
        backgroundColor={!pixCharge ? '$gray9' : 'orange'}
        hoverStyle={{ backgroundColor: '$orange9' }}
        disabled={!pixCharge}
        onPress={async () => {
          await Clipboard.setStringAsync(pixCharge!.qrCode);
          toast.show('Código copiado', {
            message: "O código já está na sua área de transferência.",
            duration: 2000,
          })
        }}
      >
        <Text color="white" fontSize={16} letterSpacing={1} fontWeight="500">
          Copiar QR Code
        </Text>
      </Button>
      
    </View>
  );
}