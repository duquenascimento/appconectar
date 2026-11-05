import { Text, XStack } from 'tamagui';
import { landingColors, landingContent } from './landingContent';

export function ReferralCodeChip(props: { code: string }) {
  return (
    <XStack
      alignSelf="flex-start"
      alignItems="center"
      gap="$2"
      backgroundColor="#F9F9F9"
      borderWidth={1}
      borderColor={landingColors.greenDark}
      borderRadius={9}
      paddingVertical="$1.5"
      paddingHorizontal="$3"
    >
      <Text fontSize={12} color="gray">
        {landingContent.referralCodeLabel}
      </Text>
      <Text
        data-testid="cadastro-chip-codigo-indicacao"
        fontSize={16}
        fontWeight="700"
        color={landingColors.greenDark}
      >
        {props.code}
      </Text>
    </XStack>
  );
}
