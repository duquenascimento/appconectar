import { useCallback, useEffect, useRef, useState } from 'react';
import { Text, View } from 'tamagui';
import { TouchableOpacity, SafeAreaView, Platform, KeyboardAvoidingView } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { GiftedChat, IMessage, DayProps, ComposerProps } from 'react-native-gifted-chat';
import dayjs from 'dayjs';
import { useChat } from '@/src/contexts/chat.context';
import { JoinChatPayload } from '../../src/types/chatTypes';
import 'dayjs/locale/pt-br';
import { useRestaurantContext } from '../../src/contexts/restaurant.context';
import { useAuthContext } from '../../src/contexts/auth.context';
import { VersionInfo } from '../../src/utils/VersionApp';
import CustomComposer from '../../src/components/CustomComposer';
import { renderSend } from '../../src/components/chat/renderSend';
import { renderBubble } from '../../src/components/chat/renderBubble';
import { renderInputToolbar } from '../../src/components/chat/renderInputToolbar';
import BottomMenu from '../../src/components/chat/BottomMenu';

function Chat() {
  const MESSAGE_LIMIT = 20;

  const { selectedRestaurant } = useRestaurantContext();
  const { getTokenPayload } = useAuthContext();
  const [userId, setUserId] = useState<string | null>(null);

  const [isLoadingEarlierMessages, setIsLoadingEarlierMessages] = useState(false);

  const messagesPageRef = useRef(1);
  const loadMoreDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isFetchingMoreMessagesRef = useRef(false);
  const didMarkInitialMessagesAsReadRef = useRef(false);

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
  } = useChat();

  const router = useRouter();

  useEffect(() => {
    return () => {
      if (loadMoreDebounceRef.current) {
        clearTimeout(loadMoreDebounceRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!isConnected) return;

    async function handleJoinChat() {
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

      messagesPageRef.current = 1;
      didMarkInitialMessagesAsReadRef.current = false;

      await getMessages({
        channelId: payload.channelId,
        channelType: payload.channelType,
        page: 1,
        limit: MESSAGE_LIMIT,
      });

      clearUnreadMessages();
    }

    handleJoinChat();
  }, [
    isConnected,
    joinChat,
    getMessages,
    clearUnreadMessages,
    getTokenPayload,
    selectedRestaurant,
  ]);

  const handleLoadEarlierMessages = useCallback(() => {
    if (!selectedRestaurant) return;
    if (!roomConnected) return;
    if (isFetchingMoreMessagesRef.current) return;

    /**
     * Se carregou menos mensagens do que deveria para a página atual,
     * provavelmente não existem mais mensagens antigas.
     *
     * Exemplo:
     * page 1 deveria ter 20.
     * page 2 deveria totalizar 40.
     * Se tiver só 27, não chama page 3.
     */
    const expectedLoadedMessages = messagesPageRef.current * MESSAGE_LIMIT;

    if (messages.length < expectedLoadedMessages) return;

    if (loadMoreDebounceRef.current) {
      clearTimeout(loadMoreDebounceRef.current);
    }

    loadMoreDebounceRef.current = setTimeout(async () => {
      if (!selectedRestaurant) return;
      if (isFetchingMoreMessagesRef.current) return;

      isFetchingMoreMessagesRef.current = true;
      setIsLoadingEarlierMessages(true);

      const nextPage = messagesPageRef.current + 1;

      try {
        await getMessages({
          channelId: selectedRestaurant.id,
          channelType: 'restaurant',
          page: nextPage,
          limit: MESSAGE_LIMIT,
        });

        messagesPageRef.current = nextPage;
      } finally {
        isFetchingMoreMessagesRef.current = false;
        setIsLoadingEarlierMessages(false);
      }
    }, 400);
  }, [getMessages, messages.length, roomConnected, selectedRestaurant]);

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

  const renderComposer = (props: ComposerProps) => {
    return <CustomComposer {...props} />;
  };

  const renderLoadEarlier = useCallback(() => {
    return null;
  }, []);

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
            renderLoadEarlier={renderLoadEarlier}
            textInputProps={{
              placeholder: 'Digite uma mensagem...',
            }}
            isSendButtonAlwaysVisible
            loadEarlierMessagesProps={{
              isAvailable: messages.length >= MESSAGE_LIMIT,
              isInfiniteScrollEnabled: true,
              isLoading: isLoadingEarlierMessages,
              onPress: handleLoadEarlierMessages,
            }}
          />
        </View>

        <BottomMenu />
      </KeyboardAvoidingView>

      <VersionInfo />
    </SafeAreaView>
  );
}
export default Chat;
