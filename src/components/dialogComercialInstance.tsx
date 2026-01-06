import { Linking } from 'react-native';
import { Button, Dialog, XStack, YStack } from 'tamagui';
import { useAuthContext } from '../contexts/auth.context';
import { Restaurant } from '../types/restaurantTypes';
import { setStorageRestaurant } from '../utils/restaurantUtils';
import { BaseDialog } from './BaseDialog';

type DialogComercialInstanceProps = {
  openModal: boolean;
  setOpenModal: (open: boolean) => void;
  setRegisterInvalid: Function;
  rest: Restaurant[];
  messageText?: string;
  onSelectAvailable?: () => void;
};

export default function DialogComercialInstance({
  openModal,
  setOpenModal,
  onSelectAvailable,
  rest,
  messageText,
}: DialogComercialInstanceProps) {
  const hasAvailableRestaurant = rest.some((r) => !r.registrationReleasedNewApp);
  const { logout } = useAuthContext();

  const handleSelectAvailable = async () => {
    if (onSelectAvailable) {
      onSelectAvailable();
    } else {
      const availableRestaurant = rest.find((r) => !r.registrationReleasedNewApp);
      if (availableRestaurant) {
        await setStorageRestaurant(availableRestaurant);
        setOpenModal(false);
      }
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Erro ao deslogar:', error);
    }
  };

  const handleBackButton = async () => {
    if (!hasAvailableRestaurant) {
      await handleLogout();
    } else {
      await handleSelectAvailable();
    }
  };

  const handleContactPress = async () => {
    const text = encodeURIComponent(
      `Olá! gostaria de liberar o meu acesso, represento os seguintes restaurantes:
${rest.map((item: any) => `\n- ${item.name}`)}\n\nConsegue me ajudar?`,
    );
    await Linking.openURL(`https://wa.me/5521999954372?text=${text}`);
    setTimeout(() => handleLogout(), 2000);
  };

  return (
    <BaseDialog
      open={openModal}
      title="Bem vindo à Conéctar!"
      description={
        messageText ||
        'Entre em contato conosco para agendar um contato rápido e começar a utilizar o aplicativo!'
      }
    >
      {/* Versão Desktop - Botões lado a lado */}
      <XStack
        display="none"
        /* $gtSm={{ display: 'flex' }} */
        justifyContent="center"
        alignSelf="center"
        gap="$4"
      >
        <Dialog.Close displayWhenAdapted asChild>
          <Button
            width="$20"
            theme="active"
            aria-label="SelectAvailable"
            backgroundColor="#3A7EC2"
            color="$white1"
            onPress={handleBackButton}
          >
            Voltar
          </Button>
        </Dialog.Close>

        <Dialog.Close displayWhenAdapted asChild>
          <Button
            width="$20"
            theme="active"
            aria-label="Close"
            backgroundColor="#04BF7B"
            color="$white1"
            onPress={handleContactPress}
          >
            Entre em contato
          </Button>
        </Dialog.Close>
      </XStack>

      {/* Versão Mobile - Botões em coluna */}
      <YStack
        display="flex"
        /* $gtSm={{ display: 'none' }} */
        justifyContent="center"
        alignSelf="center"
        gap="$3"
        width="100%"
      >
        <Dialog.Close displayWhenAdapted asChild>
          <Button
            width="100%"
            theme="active"
            aria-label="SelectAvailable"
            backgroundColor="#3A7EC2"
            color="$white1"
            onPress={handleBackButton}
          >
            Voltar
          </Button>
        </Dialog.Close>

        <Dialog.Close displayWhenAdapted asChild>
          <Button
            width="100%"
            theme="active"
            aria-label="Close"
            backgroundColor="#04BF7B"
            color="$white1"
            onPress={handleContactPress}
          >
            Entre em contato
          </Button>
        </Dialog.Close>
      </YStack>
    </BaseDialog>
  );
}
