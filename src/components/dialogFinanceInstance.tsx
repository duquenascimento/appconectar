// src/components/DialogFinanceInstance.tsx
import { Button, XStack, Text } from 'tamagui'
import * as Linking from 'expo-linking'
import { BaseDialog } from './BaseDialog'

interface Restaurant {
  externalId: any
  id: string
  name: string
  registrationReleasedNewApp: boolean
}

type DialogFinanceInstanceProps = {
  openModal: boolean
  setRegisterInvalid: (value: boolean) => void
  rest: Restaurant[]
}

export function DialogFinanceInstance({ openModal, setRegisterInvalid, rest }: DialogFinanceInstanceProps) {
  return (
    <BaseDialog
      open={openModal}
      title="Conta bloqueada"
      description="Informamos que sua conta está bloqueada devido a pendências com a plataforma. Por favor, entre em contato agora para desbloquear a sua conta."
    >
      <XStack alignSelf="center" gap="$4" marginTop="$4">
        <Button
          width="$20"
          theme="active"
          backgroundColor="$red9"
          color="$white1"
          onPress={async () => {
            const text = encodeURIComponent(`Olá! Estou com pendências em minha conta, represento os seguintes restaurantes:
${rest.map((item) => `
- ${item.name}`).join('')}
Consegue me ajudar?`)
              .replace('!', '%21')
              .replace("'", '%27')
              .replace('(', '%28')
              .replace(')', '%29')
              .replace('*', '%2A')

            await Linking.openURL(`https://wa.me/5521999954372?text=${text}`)
            setRegisterInvalid(false)
          }}
        >
          <Text color="$white">Entre em contato</Text>
        </Button>
      </XStack>
    </BaseDialog>
  )
}