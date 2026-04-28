import FontAwesome from "@expo/vector-icons/FontAwesome"
import { Text, View, XStack, YStack } from "tamagui"
import { CreditCard } from "../types/creditCardTypes"

function getCardBrandIconName(brand: string) {
  switch (brand) {
    case 'VISA':
      return 'cc-visa';
    case 'MASTERCARD':
      return 'cc-mastercard';
    default:
      return 'credit-card';
  }
}

export const CreditCardSection = (props: {creditCard: CreditCard}) => {
  const { creditCard } = props
  return (
    <YStack
      backgroundColor="white"
      borderRadius={8}
      padding="$3.5"
      gap="$2.5"
      borderColor="$gray6"
      borderWidth={1}
    >
      <Text fontSize={14} color="$gray11">
        Cartão de crédito
      </Text>
      <XStack alignItems="center">
        <View paddingRight={'$2'}>
          <FontAwesome name={getCardBrandIconName(creditCard.brand)} size={24}  color="$gray11" />
        </View>
        <Text fontSize={14} fontWeight="bold">
          {creditCard!.nickname + " "}
        </Text>
        <Text fontSize={14}>
          • {creditCard.fourLastDigits}
        </Text>
      </XStack>
    </YStack>
  )
}