import PageContainer from '@/src/components/box/PageContainer';
import CustomAlert from '@/src/components/modais/CustomAlert';
import { TwoButtonCustomAlert } from '@/src/components/modais/TwoButtonCustomAlert';
import { useAuthContext } from '@/src/contexts/auth.context';
import { deleteUser, getUserData } from '@/src/utils/userUtils';
import { VersionInfo } from '@/src/utils/VersionApp';
import Icons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Platform } from 'react-native';
import { Button, Text, View, XStack, YStack } from 'tamagui';

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
  const { logout } = useAuthContext();
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
    setDeleted(false);
    setLoading(false);
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
          onPress={handleLogout}
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
