import Icons from '@expo/vector-icons/Ionicons';
import { Text, XStack } from 'tamagui';
import { landingColors } from './landingContent';

export function PromoterBanner(props: { promoterName: string }) {
  return (
    <XStack
      alignSelf="stretch"
      alignItems="center"
      gap="$2"
      backgroundColor="white"
      borderWidth={1}
      borderColor={landingColors.greenDark}
      borderRadius={9}
      paddingVertical="$2"
      paddingHorizontal="$3"
    >
      <Icons name="ribbon-outline" size={20} color={landingColors.green} />
      <Text data-testid="cadastro-banner-indicacao" fontSize={16} flexShrink={1}>
        Você foi indicado por{' '}
        <Text fontSize={16} fontWeight="700">
          {props.promoterName}
        </Text>
        !
      </Text>
    </XStack>
  );
}
