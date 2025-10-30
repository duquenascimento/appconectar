import { useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import { ActivityIndicator, Platform } from 'react-native';
import Icons from '@expo/vector-icons/Ionicons';
import { View, Text, XStack, YStack, Button } from 'tamagui';
import { Linking } from 'react-native';
import PageContainer from '@/src/components/box/PageContainer';
import { getUserData } from '@/src/utils/userUtils';
import { VersionInfo } from '@/src/utils/VersionApp';
import { clearStorage, deleteToken } from '@/src/utils/utils';
import { TwoButtonCustomAlert } from '@/src/components/modais/TwoButtonCustomAlert';

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
  const router = useRouter();

  useEffect(() => {
    let isMounted = true;

    async function loadUser() {
      try {
        setLoading(true);
        const userData = await getUserData();
        if (isMounted) setUser(userData);
      } catch (error) {
        console.error('Falha ao carregar usuário:', error);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadUser();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleCancelRequest = async () => {
    try {
      setShowModal(false);

      const text = encodeURIComponent(
        `Olá! Gostaria de solicitar o cancelamento da minha conta no aplicativo.\n\nNome: ${user?.name}\nE-mail: ${user?.email}\nTelefone: ${user?.phone || 'não informado'}\n\nPoderiam me ajudar com isso?`,
      );

      await Linking.openURL(`https://wa.me/5521999954372?text=${text}`);
    } catch (error) {
      console.error('Erro ao abrir o WhatsApp:', error);
    }
  };
  if (loading) {
    return (
      <PageContainer backgroundColor="white">
        <View flex={1} justifyContent="center" alignItems="center">
          <ActivityIndicator size="large" color="#04BF7B" />
          <Text fontSize={16} marginTop={5} color="gray" textAlign="center">
            Carregando informações do usuário...
          </Text>
        </View>
      </PageContainer>
    );
  }

  return (
    <PageContainer backgroundColor="white">
      <TwoButtonCustomAlert
        visible={showModal}
        title="Tem certeza que deseja nos deixar?"
        message="Ao fazer isto você será redirecionado 
        para nosso canal de atendimento para solicitar o encerramento de sua conta"
        onConfirm={handleCancelRequest}
        onCancel={() => setShowModal(false)}
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
                  <Text fontSize={14}>{new Date(user.createdAt).toLocaleDateString('pt-BR')}</Text>
                </XStack>
              )}
            </YStack>
          ) : (
            <Text color="#999">Não foi possível carregar as informações do usuário.</Text>
          )}
        </View>
      </View>

      <View width="100%" padding={20} alignItems="center">
        <Button
          width={Platform.OS === 'web' ? '60%' : '90%'}
          backgroundColor="#ff4d4d"
          borderRadius={12}
          height={45}
          onPress={() => setShowModal(true)}
        >
          <XStack alignItems="center" justifyContent="center" gap={8}>
            <Text color="white" fontWeight="700">
              Solicitar Cancelamento
            </Text>
          </XStack>
        </Button>
      </View>

      <View
        justifyContent="center"
        alignItems="center"
        flexDirection="row"
        gap={15}
        height={50}
        borderTopWidth={0.4}
        borderTopColor="lightgray"
      >
        <View
          onPress={() => router.push('/products')}
          padding={10}
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
          padding={10}
          marginVertical={10}
          borderRadius={8}
          flexWrap="nowrap"
          flexDirection="column"
          justifyContent="center"
          alignItems="center"
          width={120}
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
          padding={10}
          marginVertical={10}
          borderRadius={8}
          flexWrap="nowrap"
          flexDirection="column"
          justifyContent="center"
          alignItems="center"
          width={80}
          height={70}
        >
          <Icons name="person" size={20} color="#04BF7B" />
          <Text fontSize={12} color="#04BF7B">
            Perfil
          </Text>
        </View>
        <View
          onPress={async () => {
            setLoading(true);
            await Promise.all([clearStorage(), deleteToken()]);
            setLoading(false);
            router.dismissAll();
            router.replace('/');
          }}
          padding={10}
          marginVertical={10}
          borderRadius={8}
          flexWrap="nowrap"
          flexDirection="column"
          justifyContent="center"
          alignItems="center"
          width={50}
          height={70}
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
