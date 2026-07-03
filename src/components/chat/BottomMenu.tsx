import Icons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { Text, View } from 'tamagui';
import { useChat } from '../../contexts/chat.context';
import { useAuthContext } from '../../contexts/auth.context';

function BottomMenu() {
  const { unreadMessages } = useChat();
  const { logout } = useAuthContext();

  const handleLogout = async () => {
    await logout();
  };

  return (
    <View
      justifyContent="center"
      alignItems="center"
      flexDirection="row"
      gap={10}
      height={50}
      borderTopWidth={0.4}
      borderTopColor="#EcEcEc"
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
        <Icons name="person" size={20} color="gray" />
        <Text fontSize={12} color="gray">
          Perfil
        </Text>
      </View>
      <View
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
          <Icons name="chatbubbles" size={20} color="#04BF7B" />

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

        <Text fontSize={12} color="#04BF7B">
          Chat
        </Text>
      </View>
      <View
        onPress={async () => {
          await handleLogout();
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
        <Icons name="log-out" size={20} color="gray" />
        <Text fontSize={12} color="gray">
          Sair
        </Text>
      </View>
    </View>
  );
}

export default BottomMenu;
