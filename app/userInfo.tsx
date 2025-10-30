import { useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import { ActivityIndicator, Platform } from 'react-native';
import Icons from '@expo/vector-icons/Ionicons';
import { View, Text, XStack, YStack, Button, ScrollView } from 'tamagui';
import PageContainer from '@/src/components/box/PageContainer';
import { getStorage } from '@/src/utils/utils';

interface User {
  name: string;
  email: string;
  createdAt: string;
  phone?: string;
}

export default function UserInfo() {
  const [user, setUser] = useState<User | null>(null);
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const router = useRouter();
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    const getSavedRestaurant = async (): Promise<any> => {
      try {
        setLoading(true);
        const data = await getStorage('selectedRestaurant');
        if (!data) return null;

        const parsedData = JSON.parse(data);

        if (!parsedData?.restaurant) {
          console.error('Formato inválido:', parsedData);
          return null;
        }

        setSelectedRestaurant(parsedData.restaurant);
      } catch (error) {
        console.error('Erro ao parsear dados:', error);
        return null;
      } finally {
        setLoading(false);
      }
    };
    getSavedRestaurant();
  }, []);

  const handleCancelRequest = () => {};

  console.log('Restaurante: ', JSON.stringify(selectedRestaurant, null, 2));

  if (loading) {
    return (
      <PageContainer backgroundColor="white">
        <Text>Carregando informações do usuário</Text>
        <View flex={1} justifyContent="center" alignItems="center">
          <ActivityIndicator size="large" color="#04BF7B" />
        </View>
      </PageContainer>
    );
  }

  return (
    <PageContainer backgroundColor="white">
      <ScrollView
        showsVerticalScrollIndicator={false}
        style={{ flex: 1 }}
        contentContainerStyle={{
          padding: 5,
          paddingBottom: 100,
          width: Platform.OS === 'web' ? '68%' : '100%',
          alignSelf: 'center',
        }}
      >
        <Text fontSize={20} fontWeight="700" marginBottom={40}>
          Informações do Usuário
        </Text>
        <YStack gap={16} marginBottom={40}>
          <XStack justifyContent="flex-start" gap={2}>
            <Text fontSize={14} color="#A9A9A9" fontWeight={600}>
              Nome do Restaurante:
            </Text>
            <Text fontSize={14} fontWeight="400">
              {selectedRestaurant?.name}
            </Text>
          </XStack>

          <XStack justifyContent="flex-start" gap={2}>
            <Text fontSize={14} color="#A9A9A9" fontWeight={600}>
              E-mail:
            </Text>
            <Text fontSize={14} fontWeight="400">
              {selectedRestaurant?.email}
            </Text>
          </XStack>

          {selectedRestaurant?.phone && (
            <XStack justifyContent="flex-start" gap={2}>
              <Text fontSize={14} color="#A9A9A9" fontWeight={600}>
                Telefone:
              </Text>
              <Text fontSize={14} fontWeight="400">
                {selectedRestaurant?.phone}
              </Text>
            </XStack>
          )}

          <XStack justifyContent="flex-start" gap={2}>
            <Text fontSize={14} color="#A9A9A9" fontWeight={600}>
              Data de cadastro:
            </Text>
            <Text fontSize={14} fontWeight="400">
              {new Date(selectedRestaurant?.createdAt).toLocaleDateString('pt-BR')}
            </Text>
          </XStack>
        </YStack>

        <Text fontSize={16} fontWeight="400" marginBottom={20}>
          Endereço
        </Text>
        <YStack gap={16}>
          <XStack justifyContent="flex-start" gap={2}>
            <Text fontSize={14} color="#A9A9A9" fontWeight={600}>
              Logradouro:
            </Text>
            <Text fontSize={14} fontWeight="400">
              {`${selectedRestaurant?.addressInfos[0]?.localType} ${selectedRestaurant?.addressInfos[0]?.address}`}
            </Text>
          </XStack>

          <XStack justifyContent="flex-start" gap={2}>
            <Text fontSize={14} color="#A9A9A9" fontWeight={600}>
              Número:
            </Text>
            <Text fontSize={14} fontWeight="400">
              {selectedRestaurant?.addressInfos[0]?.localNumber}
            </Text>
          </XStack>

          <XStack justifyContent="flex-start" gap={2}>
            <Text fontSize={14} color="#A9A9A9" fontWeight={600}>
              Bairro:
            </Text>
            <Text fontSize={14} fontWeight="400">
              {selectedRestaurant?.addressInfos[0]?.neighborhood}
            </Text>
          </XStack>

          <XStack justifyContent="flex-start" gap={2}>
            <Text fontSize={14} color="#A9A9A9" fontWeight={600}>
              Cidade:
            </Text>
            <Text fontSize={14} fontWeight="400">
              {selectedRestaurant?.addressInfos[0]?.city}
            </Text>
          </XStack>
        </YStack>
      </ScrollView>

      <View
        position="absolute"
        bottom={0}
        width="100%"
        padding={20}
        borderTopWidth={0.5}
        borderTopColor="#ccc"
        backgroundColor="white"
        alignItems="center"
      >
        <Button
          width={Platform.OS === 'web' ? '60%' : '90%'}
          backgroundColor="#ff4d4d"
          borderRadius={12}
          height={45}
          onPress={handleCancelRequest}
        >
          <XStack alignItems="center" justifyContent="center" gap={8}>
            <Icons name="close-circle-outline" size={20} color="white" />
            <Text color="white" fontWeight="700">
              Solicitar Cancelamento
            </Text>
          </XStack>
        </Button>
      </View>
    </PageContainer>
  );
}
