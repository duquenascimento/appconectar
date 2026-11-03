import { Input, Text, View } from 'tamagui';
import { registerBoxProps } from '@/src/components/pages/register/RegisterField';
import { useRegisterLayout } from '@/src/components/pages/register/useRegisterLayout';

export function InviteCodeField(props: { value?: string }) {
  const { field } = useRegisterLayout();

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
          {...registerBoxProps(false)}
          {...field}
          data-testid="invite-code-field"
          value={props.value}
          disabled
          opacity={0.5}
        />
      </View>
    </View>
  );
}
