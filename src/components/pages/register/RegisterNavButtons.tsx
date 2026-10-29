import { Button, Text, View } from 'tamagui';
import { useRegisterLayout } from './useRegisterLayout';

export function RegisterNavButtons({
  nextLabel,
  onBack,
  onNext,
}: {
  nextLabel: string;
  onBack: () => void;
  onNext: () => void;
}) {
  const { isWeb, pagePadding, touchHeight, containerProps } = useRegisterLayout();

  return (
    <View {...containerProps}>
      <View
        paddingHorizontal={pagePadding}
        paddingTop={isWeb ? 8 : 0}
        paddingBottom={isWeb ? 32 : 0}
        height={isWeb ? undefined : 60}
        justifyContent="center"
        gap={15}
        flexDirection="row"
      >
        <Button
          flex={1}
          height={touchHeight}
          borderColor="lightgray"
          display="flex"
          borderWidth={0.5}
          backgroundColor="white"
          onPress={onBack}
        >
          <Text>Voltar</Text>
        </Button>
        <Button
          data-testid="register-botao-avancar"
          flex={1}
          height={touchHeight}
          backgroundColor="#04BF7B"
          onPress={onNext}
        >
          <Text color="white">{nextLabel}</Text>
        </Button>
      </View>
    </View>
  );
}
