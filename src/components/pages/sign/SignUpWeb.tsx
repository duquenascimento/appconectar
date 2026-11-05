import { VersionInfo } from '@/src/utils/VersionApp';
import { Button, Image, Stack, Text, XStack, YStack } from 'tamagui';
import { SignUpForm } from './SignUpForm';

export function SignUpWeb(props: {
  page: string;
  positionOptions: { label: string; value: string }[];
  onButtonPress: (page: string) => void;
  onRegisterPress: (
    name: string,
    position: string,
    phone: string,
    email: string,
    password: string,
    registerInvalid: Function,
    setLoading: Function,
    setErros: Function,
    saveLogin: Function,
  ) => void;
}) {
  return (
    <YStack paddingHorizontal={24} flex={1} justifyContent="center" alignItems="center">
      <Image
        src={require('@assets/images/logo-conectar-positivo.svg')}
        width={240}
        height={80}
        objectFit="fill"
        marginBottom="$6"
      />

      <YStack width="100%" maxWidth={340} alignItems="center">
        <Stack alignItems="center" marginBottom="$3.5">
          <Text fontSize="$8">Criar conta</Text>
          <Text color="$gray10Dark">Preencha com os seus dados abaixo:</Text>
        </Stack>

        <SignUpForm
          positionOptions={props.positionOptions}
          onRegisterPress={props.onRegisterPress}
        />

        <XStack
          marginTop="$6"
          borderColor="$gray7Light"
          borderWidth={1}
          borderRadius={9}
          width="100%"
        >
          <Button
            width="50%"
            borderTopRightRadius={0}
            borderBottomRightRadius={0}
            height="$5"
            backgroundColor={props.page !== 'SignIn' ? '$gray1Light' : '$background'}
            onPress={() => props.onButtonPress('SignIn')}
          >
            Entrar
          </Button>
          <Button
            width="50%"
            borderTopLeftRadius={0}
            borderBottomLeftRadius={0}
            height="$5"
            backgroundColor={props.page !== 'SignUp' ? '$gray1Light' : '$background'}
          >
            Criar conta
          </Button>
        </XStack>
      </YStack>
      <VersionInfo />
    </YStack>
  );
}
