import { Linking, Platform } from 'react-native'
import { Button, XStack, Text, View } from 'tamagui'
import { BaseDialog } from './BaseDialog'

interface UpdateAppModalProps {
  openModal: boolean
  message: string
}

export function UpdateAppModal({ openModal, message }: UpdateAppModalProps) {
  if (Platform.OS === 'web') return null

  const handleUpdatePress = () => {
    const link =
      Platform.OS === 'ios'
        ? 'https://apps.apple.com/br/app/con%C3%A9ctar/id6471991824'
        : 'https://play.google.com/store/search?q=Con%C3%A9ctar&c=apps&hl=pt-BR'
    Linking.openURL(link).catch(() => console.error('Erro ao abrir loja'))
  }

  return (
    <BaseDialog
      open={openModal}
      title="Atualização Obrigatória"
      description={message || 'Uma nova versão está disponível. Por favor, atualize o app para continuar.'}
    >
      <XStack alignSelf="center" gap="$4" marginTop="$2">
        <Button
          width="$24"
          theme="active"
          backgroundColor="$blue9"
          color="$white"
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
