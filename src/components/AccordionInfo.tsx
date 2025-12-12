import Icons from '@expo/vector-icons/Ionicons';
import { useState } from 'react';
import { Text, View } from 'tamagui';

interface AccordionInfoProps {
  title: string;
  subtitle?: string;
  content: React.ReactNode;
  marginBottom?: number;
}

export function AccordionInfo({ title, subtitle, content, marginBottom = 15 }: AccordionInfoProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <View
      marginBottom={marginBottom}
      width="100%"
      alignSelf="center"
      borderWidth={1}
      borderColor="#04BF7B"
      borderRadius={8}
      overflow="hidden"
    >
      <View
        backgroundColor="#F0F9F6"
        padding={12}
        flexDirection="row"
        alignItems="center"
        justifyContent="space-between"
        onPress={() => setIsExpanded(!isExpanded)}
        cursor="pointer"
      >
        <View flex={1} flexDirection="row" alignItems="center" gap={8}>
          <Icons name="information-circle" size={20} color="#04BF7B" />
          <View flex={1}>
            <Text fontSize={14} fontWeight="600" color="#04BF7B">
              {title}
            </Text>
            {subtitle && (
              <Text fontSize={12} color="#04BF7B" marginTop={4}>
                {subtitle}
              </Text>
            )}
          </View>
        </View>
        <Icons name={isExpanded ? 'chevron-up' : 'chevron-down'} size={24} color="#04BF7B" />
      </View>

      {isExpanded && (
        <View backgroundColor="white" padding={12} gap={12}>
          {content}
        </View>
      )}
    </View>
  );
}
