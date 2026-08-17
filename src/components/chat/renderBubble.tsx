import { Bubble, BubbleProps } from 'react-native-gifted-chat';
import { GiftedChatMessage } from '../../types/chatTypes';

export const renderBubble = (props: BubbleProps<GiftedChatMessage>) => (
  <Bubble
    {...props}
    wrapperStyle={{
      left: {
        backgroundColor: '#FFFFFF',
        borderBottomLeftRadius: 4,
        borderTopLeftRadius: 16,
        borderTopRightRadius: 16,
        borderBottomRightRadius: 16,
        padding: 2,
        marginBottom: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 1,
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
