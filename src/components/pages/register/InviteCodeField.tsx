import { Input, Text, View } from 'tamagui';

export function InviteCodeField(props: { value?: string }) {
  if (!props.value) return null;

  return (
    <View marginTop={10}>
      <Text fontSize={12} marginBottom={5} color="gray">
        Código do promotor
      </Text>
      <View
        backgroundColor="white"
        borderColor="lightgray"
        borderWidth={1}
        borderRadius={5}
        padding={10}
      >
        <Input
          data-testid="invite-code-field"
          value={props.value}
          disabled
          opacity={0.5}
          backgroundColor="white"
          borderRadius={2}
        />
      </View>
    </View>
  );
}
