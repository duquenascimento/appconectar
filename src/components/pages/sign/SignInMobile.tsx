import { useAuthContext } from "@/src/contexts/auth.context";
import { useState } from "react";
import { ActivityIndicator, Linking } from "react-native";
import { Button, View } from "tamagui";
import { Image, Input, Text, XStack, YStack } from "tamagui";
import { ValidationDialog } from "./ValidationDialog";
import Icons from '@expo/vector-icons/Ionicons';
import { VersionInfo } from "@/src/utils/VersionApp";
import logo from '@/assets/images/logo-conectar-positivo.svg';

export function SignInMobile(props: {
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
        src={logo}
        objectFit="contain"
        maxWidth={200}
        height={80}
        marginBottom="$9"
      />
      <Text alignSelf="center" fontSize="$8">
        Bem-vindo
      </Text>
      <Text alignSelf="flex-start" color="$gray10Dark">
        Insira suas credenciais abaixo para acessar a sua conta.
      </Text>

      <XStack
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
          placeholder="Email"
          onChangeText={setEmail}
          backgroundColor="$colorTransparent"
          borderWidth="$0"
          borderColor="$colorTransparent"
          flex={1}
          maxLength={256}
          focusStyle={{ borderColor: '#049A63', borderWidth: 1 }}
          value={email}
          hoverStyle={{ borderColor: '#049A63', borderWidth: 1 }}
        />
      </XStack>
      <XStack
        backgroundColor="white"
        paddingRight="$3.5"
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
          placeholder="Senha"
          onChangeText={setPassword}
          backgroundColor="$colorTransparent"
          borderWidth="$0"
          borderColor="$colorTransparent"
          secureTextEntry={showPw}
          flex={1}
          marginRight="$3.5"
          maxLength={35}
          focusStyle={{ borderColor: '#049A63', borderWidth: 1 }}
          value={password}
          hoverStyle={{ borderColor: '#049A63', borderWidth: 1 }}
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
        marginTop="$3.5"
        backgroundColor="#04BF7B"
        color="white"
        fontWeight="$10"
        width={230}
        onPress={() =>
          props.onLoginPress(email, password, setRegisterInvalid, setLoading, setErros, saveAuthToken)
        }
      >
        Entrar
      </Button>

      {/* <Text color='$gray10Dark' marginTop='$3.5'>Ou entre com</Text>
            <Button backgroundColor='white' borderColor='lightgray' width={230} marginTop='$5'><Icons name='logo-google' />Continuar com Google</Button>
            <Button backgroundColor='white' borderColor='lightgray' width={230} marginTop='$3.5'><Icons name='logo-microsoft' />Continuar com Microsoft</Button> */}

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

      <XStack marginTop="$9" borderColor="$gray7Light" borderWidth={1} borderRadius={9}>
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