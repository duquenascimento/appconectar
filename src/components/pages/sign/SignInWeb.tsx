import { useAuthContext } from "@/src/contexts/auth.context";
import { VersionInfo } from "@/src/utils/VersionApp";
import { useState } from "react";
import { ActivityIndicator, Linking } from "react-native";
import { Button, Image, Input, Stack, Text, View, XStack, YStack } from "tamagui";
import { ValidationDialog } from "./ValidationDialog";
import Icons from '@expo/vector-icons/Ionicons';

export function SignInWeb(props: {
  page: string;
  onButtonPress: (page: string) => void;
  onLoginPress: (email: string, password: string, registerInvalid: Function, setLoading: Function, setErros: Function, saveAuthToken: Function) => void;
  modal: () => void;
}) {
  const [showPw, setShowPw] = useState(true);
  const [registerInvalid, setRegisterInvalid] = useState(false);
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [erros, setErros] = useState([]);
  const [loading, setLoading] = useState(false);
  const { saveAuthToken } = useAuthContext();

  if (loading) {
    return (
      <View flex={1} justifyContent="center" alignItems="center">
        <ActivityIndicator size="large" color="#04BF7B" />
      </View>
    );
  }

  return (
    <YStack paddingHorizontal={24} flex={1} justifyContent="center" alignItems="center">
      <ValidationDialog
        openModal={registerInvalid}
        setRegisterInvalid={setRegisterInvalid}
        erros={erros}
      />
      <Image
        src={require('@assets/images/logo-conectar-positivo.svg')}
        width={240}
        height={80}
        objectFit="fill"
        marginBottom="$8"
      />

      <Stack width="$20">
        <Text fontSize="$8">Bem-vindo</Text>
        <Text color="$gray10Dark">Insira suas credenciais abaixo para acessar a sua conta.</Text>
      </Stack>

      <XStack
        width="$20"
        backgroundColor="white"
        borderWidth={1}
        borderRadius={9}
        borderColor="lightgray"
        marginTop="$3.5"
        alignItems="center"
        flexDirection="row"
        zIndex={20}
      >
        <Input
          autoCapitalize="none"
          onChangeText={setEmail}
          focusStyle={{ outlineStyle: 'none' }}
          value={email}
          placeholder="Email"
          backgroundColor="$colorTransparent"
          borderWidth="$0"
          borderColor="$colorTransparent"
          flex={1}
          maxLength={256}
          width="100%"
        />
      </XStack>
      <XStack
        width="$20"
        backgroundColor="white"
        paddingRight="$3.5"
        borderWidth={1}
        borderRadius={9}
        borderColor="lightgray"
        marginTop="$3.5"
        alignItems="center"
        flexDirection="row"
        zIndex={20}
        focusStyle={{ borderColor: '#049A63', borderWidth: 1 }}
        hoverStyle={{ borderColor: '#049A63', borderWidth: 1 }}
      >
        <Input
          autoCapitalize="none"
          onChangeText={setPassword}
          focusStyle={{ outlineStyle: 'none' }}
          value={password}
          placeholder="Senha"
          backgroundColor="$colorTransparent"
          borderWidth="$0"
          borderColor="$colorTransparent"
          secureTextEntry={showPw}
          flex={1}
          marginRight="$3.5"
          maxLength={20}
        />
        <Icons
          name={showPw ? 'eye' : 'eye-off'}
          size={24}
          onPress={() => {
            setShowPw(!showPw);
          }}
        ></Icons>
      </XStack>

      <Button
        onPress={() =>
          props.onLoginPress(email, password, setRegisterInvalid, setLoading, setErros, saveAuthToken)
        }
        hoverStyle={{ backgroundColor: '#03a86c' }}
        marginTop="$3.5"
        backgroundColor="#04BF7B"
        color="white"
        fontWeight="$10"
        width="$20"
      >
        Entrar
      </Button>

      <Text onPress={props.modal} fontSize="$5" marginTop="$5" fontWeight="$15" cursor="pointer">
        Esqueceu sua senha?
      </Text>

      <Text
        marginTop={5}
        color="gray"
        cursor="pointer"
        onPress={() => {
          Linking.openURL(
            'https://www.conectarhortifruti.com.br/termos/politica-de-privacidade',
          ).catch((err) => console.error('Erro ao abrir URL:', err));
        }}
      >
        Politica de privacidade
      </Text>

      <XStack marginTop="$9" borderColor="$gray7Light" borderWidth={1} borderRadius={9} width="$20">
        <Button
          width="50%"
          borderTopRightRadius={0}
          borderBottomRightRadius={0}
          height="$5"
          backgroundColor={props.page !== 'SignIn' ? '$gray1Light' : '$background'}
        >
          Entrar
        </Button>
        <Button
          width="50%"
          borderTopLeftRadius={0}
          borderBottomLeftRadius={0}
          height="$5"
          backgroundColor={props.page !== 'SignUp' ? '$gray1Light' : '$background'}
          onPress={() => props.onButtonPress('SignUp')}
        >
          Criar conta
        </Button>
      </XStack>
      <VersionInfo />
    </YStack>
  );
}