import { Platform } from 'react-native'
import { Button, XStack, Text, View } from 'tamagui'
import { BaseDialog } from './BaseDialog'
import { openStore } from './stores/storeLinks'

interface UpdateAppModalProps {
  openModal: boolean
  message: string
}

export function UpdateAppModal({ openModal, message }: UpdateAppModalProps) {
  if (Platform.OS === 'web') return null

  const handleUpdatePress = () => {
    openStore(Platform.OS === 'ios' ? 'ios' : 'android')
  }

  return (
    <BaseDialog
      open={openModal}
      title="Atualização Obrigatória"
      description={message || 'Uma nova versão está disponível. Por favor, atualize o app para continuar.'}
    >
      <XStack alignSelf="center" gap="$4" marginTop="$2">
        <Button
          theme="active"
          backgroundColor="$blue9"
          pressStyle={{ backgroundColor: '$blue10' }}
          onPress={handleUpdatePress}
          fontSize="$5"
        >
          Atualizar Agora
        </Button>
      </XStack>

      <View marginTop="$3" alignItems="center">
        <Text fontSize="$2" color="$gray10">
          v{process.env.EXPO_PUBLIC_VERSION}
        </Text>
      </View>
    </BaseDialog>
  )
}
