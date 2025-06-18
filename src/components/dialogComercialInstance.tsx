import React from 'react'
import { Dialog, Sheet, Adapt, YStack, XStack, Button } from 'tamagui'
import { Linking, Platform } from 'react-native'
import { clearStorage, deleteToken } from '@/app/utils/utils'
import type { HomeScreenPropsUtils } from '@/app/utils/NavigationTypes'
import AsyncStorage from '@react-native-async-storage/async-storage'

type DialogComercialInstanceProps = {
  openModal: boolean
  setOpenModal: (open: boolean) => void
  setRegisterInvalid: Function
  rest: any[]
  navigation: any
  messageText?: string
  onSelectAvailable?: () => void
} & HomeScreenPropsUtils

const DialogComercialInstance: React.FC<DialogComercialInstanceProps> = ({ openModal, setOpenModal, onSelectAvailable, rest, navigation, messageText }) => {
  const handleSelectAvailable = async () => {
    if (onSelectAvailable) {
      onSelectAvailable()
    } else {
      const availableRestaurant = rest.find((r) => !r.registrationReleasedNewApp)
      if (availableRestaurant) {
        await AsyncStorage.setItem('selectedRestaurant', JSON.stringify({ restaurant: availableRestaurant }))
        setOpenModal(false)
      }
    }
  }

  const hasAvailableRestaurant = rest.some((r) => !r.registrationReleasedNewApp)

  const handleBackButton = async () => {
    if (!hasAvailableRestaurant) {
      await handleLogout()
    } else {
      await handleSelectAvailable()
    }
  }

  const handleLogout = async () => {
    try {
      await Promise.all([clearStorage(), deleteToken()])
      navigation.replace('Sign')
    } catch (error) {
      console.error('Erro ao deslogar:', error)
    }
  }

  const handleContactPress = async () => {
    const text = encodeURIComponent(
      `Olá! gostaria de liberar o meu acesso, represento os seguintes restaurantes:
${rest.map((item: any) => `\n- ${item.name}`)}` + '\n\nConsegue me ajudar?'
    )
      .replace('!', '%21')
      .replace("'", '%27')
      .replace('(', '%28')
      .replace(')', '%29')
      .replace('*', '%2A')

    await Linking.openURL(`https://wa.me/5521999954372?text=${text}`)
    setTimeout(() => {
      handleLogout()
    }, 2000)
  }

  return (
    <Dialog modal open={openModal}>
      <Adapt when="sm" platform="touch">
        <Sheet animationConfig={{ type: 'spring', damping: 20, mass: 0.5, stiffness: 200 }} animation="medium" zIndex={200000} modal disableDrag snapPoints={[100]} snapPointsMode="percent">
          <Sheet.Frame padding="$4" gap="$4" flex={1}>
            <Adapt.Contents />
          </Sheet.Frame>
          <Sheet.Overlay animation="quickest" enterStyle={{ opacity: 0 }} exitStyle={{ opacity: 0 }} />
        </Sheet>
      </Adapt>

      <Dialog.Portal>
        <Dialog.Overlay key="overlay" animation="quick" opacity={0.5} enterStyle={{ opacity: 0 }} exitStyle={{ opacity: 0 }} />
        <Dialog.Content
          bordered
          elevate
          key="content"
          animateOnly={['transform', 'opacity']}
          animation={[
            'quicker',
            {
              opacity: {
                overshootClamping: true
              }
            }
          ]}
          enterStyle={{ x: 0, y: -20, opacity: 0, scale: 0.9 }}
          exitStyle={{ x: 0, y: 10, opacity: 0, scale: 0.95 }}
          gap="$4"
        >
          <YStack flex={1} justifyContent="center" alignItems="center" padding="$4" gap="$4">
            <Dialog.Title textAlign="center" mx="auto">
              Bem vindo à Conéctar!
            </Dialog.Title>
            <Dialog.Description textAlign="center">{messageText || 'Entre em contato conosco para agendar um contato rápido e começar a utilizar o aplicativo!'}</Dialog.Description>

            {/* Versão Desktop - Botões lado a lado */}
            <XStack display="none" $gtSm={{ display: 'flex' }} justifyContent="center" alignSelf="center" gap="$4">
              <Dialog.Close displayWhenAdapted asChild>
                <Button width="$20" theme="active" aria-label="SelectAvailable" backgroundColor="#3A7EC2" color="$white1" onPress={handleBackButton}>
                  Voltar
                </Button>
              </Dialog.Close>

              <Dialog.Close displayWhenAdapted asChild>
                <Button width="$20" theme="active" aria-label="Close" backgroundColor="#04BF7B" color="$white1" onPress={handleContactPress}>
                  Entre em contato
                </Button>
              </Dialog.Close>
            </XStack>

            {/* Versão Mobile - Botões em coluna */}
            <YStack display="flex" $gtSm={{ display: 'none' }} justifyContent="center" alignSelf="center" gap="$3" width="100%">
              <Dialog.Close displayWhenAdapted asChild>
                <Button width="100%" theme="active" aria-label="SelectAvailable" backgroundColor="#3A7EC2" color="$white1" onPress={handleBackButton}>
                  Voltar
                </Button>
              </Dialog.Close>

              <Dialog.Close displayWhenAdapted asChild>
                <Button width="100%" theme="active" aria-label="Close" backgroundColor="#04BF7B" color="$white1" onPress={handleContactPress}>
                  Entre em contato
                </Button>
              </Dialog.Close>
            </YStack>
          </YStack>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog>
  )
}

export default DialogComercialInstance
