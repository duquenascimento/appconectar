import Icons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Platform } from 'react-native';
import { Button, Switch, Text, View, XStack, YStack } from 'tamagui';
import PageContainer from '../../src/components/box/PageContainer';
import CustomAlert from '../../src/components/modais/CustomAlert';
import { TwoButtonCustomAlert } from '../../src/components/modais/TwoButtonCustomAlert';
import { useAuthContext } from '../../src/contexts/auth.context';
import {
  getUserNotificationSettings,
  updateUserNotificationSettings,
} from '../../src/services/userNotificationSettingsService';
import { UserNotificationSettings } from '../../src/types/userNotificationSettingsTypes';
import { getBrazilLocaleString } from '../../src/utils/dateUtils';
import { extractErrorMessage } from '../../src/utils/errorUtils';
import { deleteUser, getUserData } from '../../src/utils/userUtils';
import { VersionInfo } from '../../src/utils/VersionApp';
// import { useChat } from '../../src/contexts/chat.context';

interface User {
  name: string;
  email: string;
  createdAt: string;
  phone?: string;
}

export default function UserInfo() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [deleted, setDeleted] = useState<boolean>(false);
  const [notificationSettings, setNotificationSettings] = useState<UserNotificationSettings | null>(
    null,
  );
  const [savingOrderConfirmed, setSavingOrderConfirmed] = useState<boolean>(false);
  const [notificationSettingsError, setNotificationSettingsError] = useState<string | null>(null);
  const { logout } = useAuthContext();
  const router = useRouter();

  // OBS: CHAT REMOVIDO TEMPORARIAMENTE

  /* const { unreadMessages, joinChat, getUnreadMessages, isConnected } = useChat();

  useEffect(() => {
    async function handleJoinChat() {
      if (isConnected) {
        const token = await getTokenPayload();
        if (!token || !selectedRestaurant) return;
        const payload: JoinChatPayload = {
          userId: token.id,
          userName: token.name,
          restaurantId: selectedRestaurant.id,
          channelType: 'restaurant',
          channelId: selectedRestaurant.id,
          userType: 'restaurant',
          allChannels: [selectedRestaurant.id],
          channelName: selectedRestaurant.name,
        };

        await joinChat(payload);
        getUnreadMessages({
          channelId: selectedRestaurant.id,
          channelType: 'restaurant',
        });
      }
    }

    handleJoinChat();
  }, [joinChat, getUnreadMessages, isConnected, getTokenPayload, selectedRestaurant]); */

  useEffect(() => {
    let isMounted = true;

    async function loadUser() {
      try {
        setLoading(true);

        const [userResult, notificationSettingsResult] = await Promise.allSettled([
          getUserData(),
          getUserNotificationSettings(),
        ]);

        if (!isMounted) return;

        if (userResult.status === 'fulfilled') {
          setUser(userResult.value);
        } else {
          console.error('Falha ao carregar usuário:', userResult.reason);
        }

        if (notificationSettingsResult.status === 'fulfilled') {
          setNotificationSettings(notificationSettingsResult.value);
        } else {
          console.error(
            'Falha ao carregar preferências de notificação:',
            notificationSettingsResult.reason,
          );
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadUser();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleToggleOrderConfirmed = async (checked: boolean) => {
    if (!notificationSettings || savingOrderConfirmed) {
      return;
    }

    const previousSettings = notificationSettings;
    setNotificationSettings({ ...notificationSettings, orderConfirmed: checked });
    setSavingOrderConfirmed(true);

    try {
      const updated = await updateUserNotificationSettings({ orderConfirmed: checked });
      setNotificationSettings(updated);
    } catch (error) {
      setNotificationSettings(previousSettings);
      setNotificationSettingsError(
        extractErrorMessage(error, 'Não foi possível atualizar sua preferência de notificação.'),
      );
    } finally {
      setSavingOrderConfirmed(false);
    }
  };

  const handleDeleteRequest = async () => {
    try {
      setShowModal(false);
      setIsDeleting(true);
      await deleteUser();
      setDeleted(true);
    } catch (error) {
      console.error('Falha ao excluir conta de usuário', error);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleLogout = async () => {
    setLoading(true);
    await logout();
  };

  if (loading || isDeleting) {
    return (
      <PageContainer backgroundColor="white">
        <View flex={1} justifyContent="center" alignItems="center">
          <ActivityIndicator size="large" color="#04BF7B" />
          <Text fontSize={16} marginTop={5} color="gray" textAlign="center">
            {isDeleting ? 'Excluindo sua conta...' : 'Carregando informações'}
          </Text>
        </View>
      </PageContainer>
    );
  }

  return (
    <PageContainer backgroundColor="white">
      <CustomAlert
        visible={deleted}
        title="Obrigado por usar nosso app!"
        message="Aguardamos pelo seu retorno em breve!"
        onConfirm={handleLogout}
      />

      <TwoButtonCustomAlert
        visible={showModal}
        title="Tem certeza que deseja nos deixar?"
        message="Ao confirmar, sua conta será removida e você será redirecionado para a página de login"
        onConfirm={handleDeleteRequest}
        onCancel={() => setShowModal(false)}
      />

      <CustomAlert
        visible={!!notificationSettingsError}
        title="Não foi possível salvar"
        message={notificationSettingsError ?? ''}
        onConfirm={() => setNotificationSettingsError(null)}
      />
      <View
        flex={1}
        paddingTop={15}
        paddingHorizontal={10}
        paddingBottom={100}
        width={Platform.OS === 'web' ? '68%' : '92%'}
        alignSelf="center"
      >
        <Text>Informações do Usuário</Text>

        <View marginTop={100}>
          {user ? (
            <YStack gap={18} marginBottom={40}>
              <XStack justifyContent="flex-start" gap={4}>
                <Text fontSize={14} color="#A9A9A9" fontWeight="600">
                  Nome:
                </Text>
                <Text fontSize={14}>{user.name}</Text>
              </XStack>

              <XStack justifyContent="flex-start" gap={4}>
                <Text fontSize={14} color="#A9A9A9" fontWeight="600">
                  E-mail:
                </Text>
                <Text fontSize={14}>{user.email}</Text>
              </XStack>

              {user.phone && (
                <XStack justifyContent="flex-start" gap={4}>
                  <Text fontSize={14} color="#A9A9A9" fontWeight="600">
                    Telefone:
                  </Text>
                  <Text fontSize={14}>{user.phone}</Text>
                </XStack>
              )}

              {user.createdAt && (
                <XStack justifyContent="flex-start" gap={4}>
                  <Text fontSize={14} color="#A9A9A9" fontWeight="600">
                    Data de cadastro:
                  </Text>
                  <Text fontSize={14}>{getBrazilLocaleString(user.createdAt)}</Text>
                </XStack>
              )}
            </YStack>
          ) : (
            <Text color="#999">Não foi possível carregar as informações do usuário.</Text>
          )}
        </View>

        <View marginTop={20}>
          <Text fontSize={16} fontWeight="600" marginBottom={16}>
            Preferências de notificação
          </Text>

          {notificationSettings ? (
            <XStack alignItems="center" gap={10}>
              <Text fontSize={14} color="#A9A9A9">
                Confirmação de pedido
              </Text>
              <Switch
                size="$2"
                checked={notificationSettings.orderConfirmed}
                onCheckedChange={handleToggleOrderConfirmed}
                disabled={savingOrderConfirmed}
                backgroundColor={notificationSettings.orderConfirmed ? '$green10' : '#7c7c7dff'}
                padding={0}
              >
                <Switch.Thumb backgroundColor="white" animation="quick" scale={0.9} />
              </Switch>
            </XStack>
          ) : (
            <Text color="#999" fontSize={14}>
              Não foi possível carregar suas preferências de notificação.
            </Text>
          )}
        </View>
      </View>

      <View width="100%" padding={20} alignItems="center">
        <Button
          width={Platform.OS === 'web' ? '40%' : '70%'}
          backgroundColor="#ff6d6d"
          borderRadius={12}
          height={45}
          onPress={() => setShowModal(true)}
        >
          <XStack alignItems="center" justifyContent="center" gap={8}>
            <Text color="white" fontWeight="700">
              Excluir conta
            </Text>
          </XStack>
        </Button>
      </View>

      <View
        justifyContent="center"
        alignItems="center"
        flexDirection="row"
        gap={10}
        height={50}
        borderTopWidth={0.4}
        borderTopColor="lightgray"
        backgroundColor="white"
        paddingLeft={20}
        paddingRight={20}
      >
        <View
          onPress={() => router.push('/products')}
          paddingLeft={15}
          paddingRight={15}
          marginVertical={10}
          borderRadius={8}
          flexDirection="column"
          justifyContent="center"
          alignItems="center"
          width={50}
          height={70}
        >
          <Icons name="home" size={20} color="gray" />
          <Text fontSize={12} color="gray">
            Home
          </Text>
        </View>
        <View
          onPress={async () => {
            setLoading(true);
            setLoading(false);
            router.push('/ordersScreen');
          }}
          paddingLeft={15}
          paddingRight={15}
          marginVertical={10}
          borderRadius={8}
          flexWrap="nowrap"
          flexDirection="column"
          justifyContent="center"
          alignItems="center"
          height={70}
        >
          <Icons name="journal" size={20} color="gray" />
          <Text fontSize={12} color="gray">
            Meus Pedidos
          </Text>
        </View>
        <View
          onPress={async () => {
            setLoading(true);
            setLoading(false);
            router.push('/userInfo');
          }}
          paddingLeft={15}
          paddingRight={15}
          marginVertical={10}
          borderRadius={8}
          flexWrap="nowrap"
          flexDirection="column"
          justifyContent="center"
          alignItems="center"
          height={70}
        >
          <Icons name="person" size={20} color="#04BF7B" />
          <Text fontSize={12} color="#04BF7B">
            Perfil
          </Text>
        </View>
        {/* 
          OBS: CHAT REMOVIDO TEMPORARIAMENTE
          */}
        {/* <View
          onPress={() => {
            router.push('/chat');
          }}
          paddingLeft={15}
          paddingRight={15}
          marginVertical={10}
          borderRadius={8}
          flexWrap="nowrap"
          flexDirection="column"
          justifyContent="center"
          alignItems="center"
          height={70}
          position="relative"
        >
          <View position="relative">
            <Icons name="chatbubbles" size={20} color="gray" />

            {unreadMessages > 0 && (
              <View
                position="absolute"
                top={-4}
                right={-10}
                minWidth={16}
                height={16}
                borderRadius={999}
                backgroundColor="#04BF7B"
                justifyContent="center"
                alignItems="center"
                paddingHorizontal={5}
              >
                <Text fontSize={9} color="white" fontWeight="bold">
                  {unreadMessages > 99 ? '99+' : unreadMessages}
                </Text>
              </View>
            )}
          </View>

          <Text fontSize={12} color="gray">
            Chat
          </Text>
        </View> */}
        <View
          paddingLeft={15}
          paddingRight={15}
          marginVertical={10}
          borderRadius={8}
          flexWrap="nowrap"
          flexDirection="column"
          justifyContent="center"
          alignItems="center"
          height={70}
          onPress={async () => {
            setLoading(true);
            await logout();
          }}
        >
          <Icons name="log-out" size={20} color="gray" />
          <Text fontSize={12} color="gray">
            Sair
          </Text>
        </View>
      </View>
      <VersionInfo />
    </PageContainer>
  );
}
