import Icons from '@expo/vector-icons/Ionicons';
import { Text, XStack, YStack } from 'tamagui';
import { IconName, landingColors } from './landingContent';

export function BenefitCard(props: {
  icon: IconName;
  title: string;
  text: string;
  iconPosition: 'top' | 'left';
}) {
  const iconOnLeft = props.iconPosition === 'left';

  return (
    <XStack
      flex={1}
      flexDirection={iconOnLeft ? 'row' : 'column'}
      alignItems={iconOnLeft ? 'center' : 'flex-start'}
      gap="$3"
      backgroundColor="white"
      borderWidth={1}
      borderColor="lightgray"
      borderRadius={9}
      padding="$4"
    >
      <Icons name={props.icon} size={28} color={landingColors.green} />
      <YStack flex={1} gap="$1">
        <Text fontSize={16} fontWeight="700">
          {props.title}
        </Text>
        <Text fontSize={14} color="$gray10Dark">
          {props.text}
        </Text>
      </YStack>
    </XStack>
  );
}
