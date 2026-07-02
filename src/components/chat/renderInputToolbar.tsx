import { InputToolbar, InputToolbarProps } from 'react-native-gifted-chat';
import { GiftedChatMessage } from '../../types/chatTypes';

export const renderInputToolbar = (props: InputToolbarProps<GiftedChatMessage>) => (
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
