import { View, Text } from 'tamagui';

interface BadgeTextProps {
  text: string;
  color: string;
}

export default function BadgeText({ text, color }: BadgeTextProps) {
  return (
    <View
      marginLeft={8}
      paddingHorizontal={8}
      paddingVertical={2}
      borderRadius={12}
      borderWidth={1.5}
      borderColor={color}
      backgroundColor="transparent"
    >
      <Text fontSize={12} color={color} fontWeight="600">
        {text}
      </Text>
    </View>
  );
}
