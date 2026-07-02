import { Bubble, BubbleProps } from 'react-native-gifted-chat';
import { GiftedChatMessage } from '../../types/chatTypes';

export const renderBubble = (props: BubbleProps<GiftedChatMessage>) => (
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
