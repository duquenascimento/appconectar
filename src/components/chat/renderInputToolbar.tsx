import { InputToolbar, InputToolbarProps } from 'react-native-gifted-chat';
import { GiftedChatMessage } from '../../types/chatTypes';

export const renderInputToolbar = (props: InputToolbarProps<GiftedChatMessage>) => (
  <InputToolbar
    {...props}
    containerStyle={{
      backgroundColor: '#fff',
      borderTopWidth: 1,
      borderTopColor: '#E5E7EB',
      paddingLeft: 12,
      paddingRight: 12,
      paddingBottom: 12,
      paddingTop: 12,
    }}
    primaryStyle={{ alignItems: 'flex-end' }}
  />
);
