import { Input, Label, Text, YStack } from 'tamagui'

interface InputNomeProps {
  value: string;
  onChangeText: (text: string) => void;
  error?: string;
}

export function InputNome({ error, onChangeText, value }: InputNomeProps) {
  return (
    <YStack>
      <Label>Nome da combinação</Label>
      <Input
        placeholder="Digite o nome da combinação"
        value={value}
        onChangeText={onChangeText}
        borderColor={error ? 'red' : 'lightgray'}
      />
      {error && (
        <Text p={'$1'} color="red">
          {error}
        </Text>
      )}
    </YStack>
  )
}