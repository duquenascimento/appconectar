import { Text, View } from 'tamagui';
import { DayProps } from 'react-native-gifted-chat';
import dayjs from 'dayjs';

export const renderDay = (props: DayProps) => {
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
