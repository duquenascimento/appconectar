import { Send, SendProps } from 'react-native-gifted-chat';
import { View } from 'tamagui';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { GiftedChatMessage } from '../../types/chatTypes';

export const renderSend = (props: SendProps<GiftedChatMessage>) => (
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
