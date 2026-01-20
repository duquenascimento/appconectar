import { Linking } from 'react-native';
import { Button, YStack } from 'tamagui';
import { useAuthContext } from '../contexts/auth.context';
import { Restaurant } from '../types/restaurantTypes';
import { setStorageRestaurant } from '../utils/restaurantUtils';
import { BaseDialog } from './BaseDialog';

type BlockVariant = 'comercial' | 'financial';

type DialogBlockInstanceProps = {
  openModal: boolean;
  setOpenModal: (open: boolean) => void;
  setRegisterInvalid?: Function;
  rest: Restaurant[];
  variant: BlockVariant;
  onSelectAvailable: (nextRestaurant: Restaurant) => void;
};

export default function DialogBlockInstance({
  openModal,
  setOpenModal,
  onSelectAvailable,
  rest,
  variant = 'comercial',
}: DialogBlockInstanceProps) {
  const { logout } = useAuthContext();

  const getAvailableRestaurant = () => {
    return rest.find((r) => !r.financeBlock && !r.registrationReleasedNewApp);
  };

  const availableRestaurant = getAvailableRestaurant();
  const hasAvailableRestaurant = !!availableRestaurant;

  const title = (): string => {
    switch (variant) {
      case 'financial':
        return 'Conta bloqueada';
      default:
        return 'Bem vindo à Conéctar!';
    }
  };

  const description = (): string => {
    switch (variant) {
      case 'financial':
        return 'Informamos que sua conta está bloqueada devido a pendências com a plataforma. Por favor, entre em contato agora para desbloquear a sua conta.';
      default:
        return 'Este restaurante não está liberado. Entre em contato conosco para concluir o processo.';
    }
  };

  const buttonBackground = (): string => {
    switch (variant) {
      case 'financial':
        return '$red9';
      default:
        return '#04BF7B';
    }
  };

  const handleSelectAvailable = async () => {
    if (availableRestaurant) {
      if (onSelectAvailable) {
        onSelectAvailable(availableRestaurant);
      } else {
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
    const affectedRestaurants = rest.filter(
      (r) => (variant === 'financial' ? r.financeBlock : r.registrationReleasedNewApp === false), // ajuste conforme sua lógica de 'false'
    );

    let message = '';

    if (variant === 'financial') {
      message = `Olá! Estou com pendências em minha conta, represento os seguintes restaurantes:\n${affectedRestaurants.map((r) => `- ${r.name}`).join('\n')}\nConsegue me ajudar?`;
    } else {
      message = `Olá! gostaria de liberar o meu acesso, represento os seguintes restaurantes:\n${affectedRestaurants.map((r) => `- ${r.name}`).join('\n')}\nConsegue me ajudar?`;
    }

    const encodedText = encodeURIComponent(message)
      .replace('!', '%21')
      .replace("'", '%27')
      .replace('(', '%28')
      .replace(')', '%29')
      .replace('*', '%2A');

    await Linking.openURL(`https://wa.me/5521999954372?text=${encodedText}`);

    setTimeout(() => handleBackButton(), 1000);
  };

  return (
    <BaseDialog
      open={openModal}
      title={title()}
      description={description()}
      onOpenChange={(isOpen) => {
        if (!isOpen) handleBackButton();
      }}
    >
      <YStack
        display="flex"
        justifyContent="center"
        alignSelf="center"
        gap="$3"
        width="100%"
        marginTop="$4"
      >
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

        <Button
          width="100%"
          theme="active"
          aria-label="Close"
          backgroundColor={buttonBackground()}
          color="$white1"
          onPress={handleContactPress}
        >
          Entre em contato
        </Button>
      </YStack>
    </BaseDialog>
  );
}
