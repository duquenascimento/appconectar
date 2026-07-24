/* eslint-disable react/require-default-props */
import { View, Text } from 'tamagui';

interface BadgeTextProps {
  text: string;
  color: string;
  marginTop?: number;
  fontSize?: number;
}

export default function BadgeText({ text, color, marginTop = 0, fontSize }: BadgeTextProps) {
  return (
    <View
      alignSelf="flex-start"
      paddingHorizontal={8}
      paddingVertical={2}
      borderRadius={12}
      borderWidth={1.5}
      borderColor={color}
      backgroundColor="transparent"
      marginTop={marginTop}
    >
      <Text fontSize={fontSize || 12} color={color} fontWeight="600">
        {text}
      </Text>
    </View>
  );
}
