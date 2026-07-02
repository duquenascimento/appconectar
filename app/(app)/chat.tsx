import Icons from '@expo/vector-icons/Ionicons';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Text, View } from 'tamagui';
import {
  TouchableOpacity,
  TextInput,
  SafeAreaView,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import {
  GiftedChat,
  IMessage,
  Send,
  DayProps,
  InputToolbar,
  Bubble,
  ComposerProps,
  SendProps,
  BubbleProps,
  InputToolbarProps,
} from 'react-native-gifted-chat';
import dayjs from 'dayjs';
import { useChat } from '@/src/contexts/chat.context';
import { JoinChatPayload, GiftedChatMessage } from '../../src/types/chatTypes';
import 'dayjs/locale/pt-br';
import { useRestaurantContext } from '../../src/contexts/restaurant.context';
import { useAuthContext } from '../../src/contexts/auth.context';
import { VersionInfo } from '../../src/utils/VersionApp';
import CustomComposer from '../../src/components/CustomComposer';

function Chat() {
  const { selectedRestaurant } = useRestaurantContext();
  const { getTokenPayload, logout } = useAuthContext();
  const [userId, setUserId] = useState<string | null>(null);

  const {
    messages,
    getMessages,
    joinChat,
    isConnected,
    clearUnreadMessages,
    sendMessage,
    markMessagesAsRead,
    markMessagesAsReadDebounced,
    roomConnected,
    unreadMessages,
  } = useChat();

  const didMarkInitialMessagesAsReadRef = useRef(false);

  const router = useRouter();

  useEffect(() => {
    if (isConnected) {
      async function handleJoinChat() {
        if (isConnected) {
          const token = await getTokenPayload();
          if (!token || !selectedRestaurant) return;
          setUserId(token.id);
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
          getMessages({
            channelId: payload.channelId,
            channelType: payload.channelType,
            page: 1,
            limit: 20,
          });
          clearUnreadMessages();
        }
      }
      handleJoinChat();
    }
  }, [
    isConnected,
    joinChat,
    getMessages,
    clearUnreadMessages,
    getTokenPayload,
    selectedRestaurant,
  ]);

  useEffect(() => {
    if (!isConnected || !selectedRestaurant) return;
    if (messages.length === 0) return;
    if (didMarkInitialMessagesAsReadRef.current) return;

    markMessagesAsRead({
      channelType: 'restaurant',
      channelId: selectedRestaurant.id,
    });

    didMarkInitialMessagesAsReadRef.current = true;
  }, [isConnected, messages.length, markMessagesAsRead, selectedRestaurant]);

  // eslint-disable-next-line no-underscore-dangle
  const lastMessageId = messages[0]?._id;

  useEffect(() => {
    if (!isConnected || !selectedRestaurant) return;
    if (messages.length === 0) return;

    const lastMessage = messages[0];

    if (lastMessage?.userType === 'attendant') {
      markMessagesAsReadDebounced({
        channelType: 'restaurant',
        channelId: selectedRestaurant.id,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isConnected, lastMessageId, markMessagesAsReadDebounced, selectedRestaurant]);

  const onSend = useCallback(
    (newMessages: IMessage[] = []) => {
      if (newMessages.length > 0 && selectedRestaurant) {
        sendMessage({
          channelType: 'restaurant',
          channelId: selectedRestaurant.id,
          content: newMessages[0].text,
          externalId: selectedRestaurant.externalId,
        });
      }
    },
    [sendMessage, selectedRestaurant],
  );

  const renderDay = (props: DayProps) => {
    if (!props.currentMessage) return null;

    const messageDate = dayjs(props.currentMessage.createdAt).startOf('day');
    const now = dayjs().startOf('day');
    const diff = now.diff(messageDate, 'days');

    let dateText = messageDate.locale('pt-br').format('D [de] MMMM');
    if (diff === 0) {
      dateText = 'Hoje';
    } else if (diff === 1) {
      dateText = 'Ontem';
    }

    return (
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          marginVertical: 16,
          paddingHorizontal: 24,
        }}
      >
        <View style={{ flex: 1, height: 1, backgroundColor: '#E5EbEB' }} />
        <View
          style={{
            marginLeft: 10,
            marginRight: 10,
            backgroundColor: '#F3F4F6',
            paddingLeft: 8,
            paddingRight: 8,
            paddingTop: 2,
            paddingBottom: 2,
            borderRadius: 12,
          }}
        >
          <Text style={{ color: '#6B7280', fontSize: 12, fontWeight: '500' }}>{dateText}</Text>
        </View>
        <View style={{ flex: 1, height: 1, backgroundColor: '#E5EbEB' }} />
      </View>
    );
  };

  const renderInputToolbar = (props: InputToolbarProps<GiftedChatMessage>) => (
    <InputToolbar
      {...props}
      containerStyle={{
        backgroundColor: '#fff',
        borderTopWidth: 1,
        borderTopColor: '#E5E7EB',
        paddingHorizontal: 12,
        paddingVertical: 8,
      }}
      primaryStyle={{ alignItems: 'flex-end' }}
    />
  );

  const renderComposer = (props: ComposerProps) => {
    return <CustomComposer {...props} />;
  };

  const renderSend = (props: SendProps<GiftedChatMessage>) => (
    <Send
      {...props}
      containerStyle={{
        width: 44,
        height: 44,
        alignItems: 'center',
        justifyContent: 'center',
        marginHorizontal: 4,
      }}
    >
      <View
        style={{
          width: 40,
          height: 40,
          borderRadius: 20,
          backgroundColor: '#04BF7B',
          alignItems: 'center',
          justifyContent: 'center',
          shadowColor: '#04BF7B',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.3,
          shadowRadius: 3,
          elevation: 2,
        }}
      >
        <MaterialCommunityIcons name="send" size={18} color="white" style={{ marginLeft: 3 }} />
      </View>
    </Send>
  );

  const renderBubble = (props: BubbleProps<GiftedChatMessage>) => (
    <Bubble
      {...props}
      wrapperStyle={{
        left: {
          backgroundColor: '#F3F4F6',
          borderBottomLeftRadius: 4,
          borderTopLeftRadius: 16,
          borderTopRightRadius: 16,
          borderBottomRightRadius: 16,
          padding: 2,
          marginBottom: 4,
        },
        right: {
          backgroundColor: '#04BF7B',
          borderBottomRightRadius: 4,
          borderTopLeftRadius: 16,
          borderTopRightRadius: 16,
          borderBottomLeftRadius: 16,
          padding: 2,
          marginBottom: 4,
        },
      }}
      textStyle={{
        left: { color: '#1F2937' },
        right: { color: '#FFFFFF' },
      }}
    />
  );

  const handleLogout = async () => {
    await logout();
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      <KeyboardAvoidingView
        style={{ flex: 1, paddingBottom: 7 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            paddingHorizontal: 16,
            paddingVertical: 12,
            borderBottomWidth: 1,
            borderBottomColor: '#F3F4F6',
            backgroundColor: '#fff',
            zIndex: 10,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.05,
            shadowRadius: 4,
            elevation: 3,
            height: 60,
          }}
        >
          <TouchableOpacity
            onPress={() => router.navigate('/(app)/products')}
            style={{
              padding: 8,
              marginRight: 8,
              marginLeft: -8,
              borderRadius: 20,
            }}
          >
            <Ionicons name="chevron-back" size={24} color="#04BF7B" />
          </TouchableOpacity>

          <Text
            style={{
              fontSize: 20,
              fontWeight: '700',
              color: '#111827',
            }}
          >
            Chat
          </Text>

          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: roomConnected ? '#ECFDF5' : '#FEF2F2',
              paddingTop: 2,
              paddingBottom: 2,
              paddingLeft: 8,
              paddingRight: 8,
              borderRadius: 20,
              borderWidth: 1,
              borderColor: roomConnected ? '#D1FAE5' : '#FEE2E2',
              marginLeft: 12,
            }}
          >
            <View
              style={{
                width: 8,
                height: 8,
                borderRadius: 4,
                backgroundColor: roomConnected ? '#10B981' : '#EF4444',
                marginRight: 6,
              }}
            />

            <Text
              style={{
                fontSize: 12,
                color: roomConnected ? '#065F46' : '#991B1B',
                fontWeight: '600',
              }}
            >
              {roomConnected ? 'Conectado' : 'Desconectado'}
            </Text>
          </View>
        </View>

        <View style={{ flex: 1, backgroundColor: '#FAFAFA' }}>
          <GiftedChat
            messages={messages}
            onSend={(mes) => onSend(mes)}
            user={{
              _id: userId || '',
            }}
            isUsernameVisible
            keyboardAvoidingViewProps={{ keyboardVerticalOffset: 0 }}
            locale="pt-br"
            colorScheme="light"
            renderDay={renderDay}
            renderInputToolbar={renderInputToolbar}
            renderComposer={renderComposer}
            renderSend={renderSend}
            renderBubble={renderBubble}
            textInputProps={{
              placeholder: 'Digite uma mensagem...',
            }}
            isSendButtonAlwaysVisible
          />
        </View>

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
      </KeyboardAvoidingView>
      <VersionInfo />
    </SafeAreaView>
  );
}

export default Chat;
