import { useCallback, useEffect, useRef, useState } from 'react';
import { Text, View, styled } from 'tamagui';
import { TouchableOpacity, SafeAreaView, Platform, KeyboardAvoidingView } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { GiftedChat, IMessage, ComposerProps } from 'react-native-gifted-chat';
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
import { renderDay } from '../../src/components/chat/renderDay';

const OuterBackground = styled(View, {
  flex: 1,
  backgroundColor: '#fff',

  $gtSm: {
    backgroundColor: '#F3F4F6',
  },
});

const ChatContainerStyled = styled(View, {
  flex: 1,
  width: '100%',
  marginHorizontal: 'auto',
  backgroundColor: '#fff',

  $gtSm: {
    width: '50%',
    marginTop: 24,
    marginBottom: 24,
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
});

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

  const renderComposer = (props: ComposerProps) => {
    return <CustomComposer {...props} />;
  };

  const renderLoadEarlier = useCallback(() => {
    return null;
  }, []);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      <OuterBackground>
        <KeyboardAvoidingView
          style={{ flex: 1, paddingBottom: 7 }}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <ChatContainerStyled>
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

            <View style={{ flex: 1, backgroundColor: '#F6F6F6' }}>
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
          </ChatContainerStyled>
          <BottomMenu />
        </KeyboardAvoidingView>
      </OuterBackground>

      <VersionInfo />
    </SafeAreaView>
  );
}
export default Chat;
