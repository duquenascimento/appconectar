import { useCallback, useEffect, useRef, useState } from 'react';
import { View, Text, TouchableOpacity, TextInput } from 'react-native';
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

function CustomComposer({ text, textInputProps }: ComposerProps) {
  const [height, setHeight] = useState(40);

  useEffect(() => {
    if (!text) {
      setHeight(40);
    }
  }, [text]);

  return (
    <View style={{ flex: 1, justifyContent: 'center' }}>
      <View
        style={{
          height,
          backgroundColor: '#ffffff',
          borderRadius: 20,
          marginRight: 4,
          borderWidth: 0.5,
          borderColor: '#d1d1d1',
          overflow: 'hidden',
        }}
      >
        <TextInput
          {...textInputProps}
          placeholder="Digite uma mensagem..."
          placeholderTextColor="#888"
          multiline
          value={text}
          showsVerticalScrollIndicator={false}
          underlineColorAndroid="transparent"
          scrollEnabled={height >= 120}
          onContentSizeChange={(e) => {
            const contentHeight = e.nativeEvent.contentSize.height;
            setHeight(Math.min(120, Math.max(40, contentHeight)));
          }}
          style={[
            {
              height,
              fontSize: 16,
              color: '#000',
              textAlignVertical: 'top',

              paddingLeft: 16,
              paddingTop: 8,
              paddingBottom: 8,

              marginRight: -24,
              paddingRight: 40,

              backgroundColor: 'transparent',
              borderWidth: 0,

              outlineStyle: 'none' as unknown as 'none',
            },
            textInputProps?.style,
          ]}
        />
      </View>
    </View>
  );
}

function Chat() {
  const { selectedRestaurant } = useRestaurantContext();
  const { getTokenPayload } = useAuthContext();
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
          externalId: 'AAAA',
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
          paddingHorizontal: 16,
        }}
      >
        <View style={{ flex: 1, height: 1, backgroundColor: '#E5E7EB' }} />
        <View style={{ marginHorizontal: 12 }}>
          <Text style={{ color: '#9CA3AF', fontSize: 12, fontWeight: 'normal' }}>{dateText}</Text>
        </View>
        <View style={{ flex: 1, height: 1, backgroundColor: '#E5E7EB' }} />
      </View>
    );
  };

  const renderInputToolbar = (props: InputToolbarProps<GiftedChatMessage>) => (
    <InputToolbar
      {...props}
      containerStyle={{
        backgroundColor: '#fff',
        borderTopWidth: 0,
        paddingHorizontal: 8,
        paddingVertical: 4,
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
          width: 44,
          height: 44,
          borderRadius: 22,
          backgroundColor: '#00a884',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <MaterialCommunityIcons name="send" size={20} color="white" style={{ marginLeft: 4 }} />
      </View>
    </Send>
  );

  const renderBubble = (props: BubbleProps<GiftedChatMessage>) => (
    <Bubble
      {...props}
      wrapperStyle={{
        left: {
          backgroundColor: '#f7fafc',
          shadowColor: '#555',
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.1,
          shadowRadius: 2,
          elevation: 1.5,
        },
        right: {
          backgroundColor: '#04BF7B',
        },
      }}
    />
  );

  return (
    <View style={{ flex: 1 }}>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: 8,
          paddingVertical: 12,
          borderBottomWidth: 1,
          borderBottomColor: '#e5e5e5',
          backgroundColor: '#fff',
          elevation: 2,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.05,
          shadowRadius: 1,
        }}
      >
        <TouchableOpacity
          onPress={() => router.navigate('/(app)/products')}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            paddingRight: 8,
          }}
        >
          <Ionicons name="chevron-back" size={24} color="#04BF7B" />
        </TouchableOpacity>
        <Text style={{ fontSize: 18, fontWeight: '600', color: '#000', marginLeft: -4 }}>Chat</Text>
      </View>

      <View style={{ flex: 1 }}>
        <GiftedChat
          messages={messages}
          onSend={(mes) => onSend(mes)}
          user={{
            _id: userId || '',
          }}
          isUsernameVisible
          isAlignedTop
          keyboardAvoidingViewProps={{ keyboardVerticalOffset: 0 }}
          locale="pt-br"
          colorScheme="light"
          listViewProps={{
            contentContainerStyle: {
              flexGrow: 1,
              justifyContent: 'flex-end',
            },
          }}
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
    </View>
  );
}

export default Chat;
