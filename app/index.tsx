import {
  Text,
  Input,
  YStack,
  Button,
  XStack,
  Image,
  View,
  Stack,
  Dialog,
  Adapt,
  Sheet,
} from 'tamagui';
import Icons from '@expo/vector-icons/Ionicons';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Linking,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
  Platform,
  ScrollView,
  useWindowDimensions,
} from 'react-native';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getStorage } from '../src/utils/utils';
import { openURL } from 'expo-linking';
import { VersionInfo } from '../src/utils/VersionApp';
import DropDownPicker from 'react-native-dropdown-picker';
import { TextInputMask } from 'react-native-masked-text';
import { useAuthContext } from '@/src/contexts/auth.context';
import { authLoginCheck, authSignIn, authSignUp } from '@/src/services/authService';
import { SignInRequest, SignUpRequest } from '@/src/types/userTypes';
import { isAxiosError } from 'axios';
import { PwRecoveryModal } from '@/src/components/pages/sign/PwdRecoveryModal';

const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const phoneRegex = /^\d{10,11}$/;

const positionOptions = [
  { label: 'Proprietário(a)/Sócio(a)', value: 'Proprietário(a)/Sócio(a)' },
  { label: 'Diretor(a)', value: 'Diretor(a)' },
  { label: 'Coordenador(a)', value: 'Coordenador(a)' },
  { label: 'Gerente', value: 'Gerente' },
  { label: 'Comprador(a)', value: 'Comprador(a)' },
  { label: 'Caixa/Financeiro', value: 'Caixa/Financeiro' },
  { label: 'Chef/Cozinheiro(a)', value: 'Chef/Cozinheiro(a)' },
  { label: 'Sous Chef', value: 'Sous Chef' },
  { label: 'Maître', value: 'Maître' },
  { label: 'Nutricionista', value: 'Nutricionista' },
  { label: 'Estoquista', value: 'Estoquista' },
  { label: 'Barista', value: 'Barista' },
  { label: 'Barman', value: 'Barman' },
  { label: 'Auxiliar de cozinha', value: 'Auxiliar de cozinha' },
  { label: 'Garçom(ete)', value: 'Garçom(ete)' },
  { label: 'Auxiliar de limpeza', value: 'Auxiliar de limpeza' },
  { label: 'Outros', value: 'Outros' },
];

function validateEmail(email: string): string | null {
  if (!email) {
    return 'O e-mail é obrigatorio';
  }
  if (email.length > 256) {
    return 'O e-mail precisa ter 256 ou menos caracteres';
  }
  if (!emailRegex.test(email)) {
    return 'Formato de e-mail inválido';
  }
  return null;
}

function validatePassword(password: string): string | null {
  if (!password) {
    return 'A senha é obrigatorio';
  }
  if (password.length > 35) {
    return 'A senha precisa ter 35 ou menos caracteres';
  }
  if (password.length < 8) {
    return 'A senha precisa ter 8 digitos ou mais';
  }
  return null;
}

function validateName(name: string): string | null {
  if (!name) {
    return 'O nome é obrigatorio';
  }
  if (name.length <= 1) {
    return 'Nome inválido';
  }
  return null;
}

function validatePosition(position: string): string | null {
  if (!position) {
    return 'O cargo é obrigatorio';
  }
  if (position.length <= 1) {
    return 'Cargo inválido';
  }
  return null;
}

function validatePhone(phone: string): string | null {
  if (!phone) {
    return 'O telefone não pode estar em branco';
  } else {
    const phoneOnlyDigits = phone.replace(/\D/g, '');
    if (!phoneRegex.test(phoneOnlyDigits)) {
      return 'Telefone inválido';
    }
  }
  return null;
}

function validateRegisterInfo(data: SignUpRequest): string[] {
  const erros: string[] = [];
  const emailValidation = validateEmail(data.email);
  if (emailValidation) {
    erros.push(emailValidation);
  }

  const passwordValidation = validatePassword(data.password);
  if (passwordValidation) {
    erros.push(passwordValidation);
  }

  const nameValidation = validateName(data.name);
  if (nameValidation) {
    erros.push(nameValidation);
  }

  const positionValidation = validatePosition(data.position);
  if (positionValidation) {
    erros.push(positionValidation);
  }

  const phoneValidation = validatePhone(data.phone);
  if (phoneValidation) {
    erros.push(phoneValidation);
  }

  return erros;
}

async function handleLogin(
  email: string,
  password: string,
  registerInvalid: Function,
  setLoading: Function,
  setErros: Function,
  saveAuthToken: Function,
) {
  const emailValidation = validateEmail(email);
  if (emailValidation) {
    registerInvalid(true);
    setErros([emailValidation]);
    return;
  }

  const passwordValidation = validatePassword(password);
  if (passwordValidation) {
    registerInvalid(true);
    setErros([passwordValidation]);
    return;
  }

  try {
    setLoading(true);

    const signInData = {
      email: email.toLowerCase(),
      password,
    } as SignInRequest;
    const response = await authSignIn(signInData);

    await Promise.all([
      saveAuthToken(response.data.token),
      AsyncStorage.setItem('role', response.data.role[0]),
    ]);
    if (response.data.role.includes('registering')) {
      router.replace('/register');
    } else {
      router.replace('/products');
    }
  } catch (err) {
    console.error(err);

    let errorMessage = 'Houve um erro ao processar a solicitação.';
    if (isAxiosError(err)) {
      errorMessage = err.response?.data?.msg ?? err.response?.data?.message;

      if (errorMessage === 'invalid password') {
        errorMessage = 'Senha inválida';
      } else if (errorMessage === 'user not found') {
        errorMessage = 'Usuário não encontrado';
      }
    }
    registerInvalid(true);
    setErros([errorMessage]);
  } finally {
    setLoading(false);
  }
}

async function handleRegister(
  name: string,
  position: string,
  phone: string,
  email: string,
  password: string,
  registerInvalid: Function,
  setLoading: Function,
  setErros: Function,
  saveAuthToken: Function,
) {
  const erros: string[] = [];
  const signUpData = {
    email: email.toLowerCase(),
    password,
    name,
    position,
    phone,
  } as SignUpRequest;
  const registerErrors = validateRegisterInfo(signUpData);
  if (registerErrors.length > 0) {
    registerInvalid(true);
    setErros(registerErrors);
    return;
  }

  try {
    setLoading(true);

    const response = await authSignUp(signUpData);
    await Promise.all([
      saveAuthToken(response.data.token),
      AsyncStorage.setItem('role', response.data.role[0]),
    ]);

    if (response.data.role.includes('registering')) {
      router.replace('/register');
    } else {
      router.replace('/products');
    }
  } catch (err) {
    console.error(err);

    let errorMessage = 'Houve um erro ao processar a solicitação.';
    if (isAxiosError(err)) {
      errorMessage = err.response?.data?.msg ?? err.response?.data?.message;

      if (errorMessage === 'email already exists') {
        errorMessage = 'Este e-mail já existe na plataforma, utilize outro ou logue ao invés disso';
      }
    }
    registerInvalid(true);
    setErros([errorMessage]);
  } finally {
    setLoading(false);
  }
}

export default function Sign() {
  const [currentPage, setCurrentPage] = useState('SignIn');
  const [visiblePage, setVisiblePage] = useState(true);
  const scrollRef = useRef<ScrollView>(null);
  const [loading, setLoading] = useState(true);
  const [closeModal, setCloseModal] = useState<boolean>(false);
  const { authToken, deleteAuthToken } = useAuthContext();
  const { width: screenWidth } = useWindowDimensions();

  const handleCloseModal = () => {
    setCloseModal(!closeModal);
  };

  const checkLogin = useCallback(async () => {
    try {
      if (authToken == null) {
        setLoading(false);
        return;
      }
      process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
      await authLoginCheck(authToken);
      const role = await getStorage('role');
      if (role === 'registering') {
        router.replace('/register');
      } else {
        router.replace('/products');
      }
    } catch (err) {
      await AsyncStorage.clear();
      await deleteAuthToken();

      console.error(err);
      
    } finally {
      setLoading(false);
    }
  }, [authToken, deleteAuthToken]);

  useEffect(() => {
    checkLogin();
  }, [checkLogin]);
  useEffect(() => {
    console.log("criou a tela de login");
  }, []);

  const handleButtonPress = (page: string) => {
    if (Platform.OS === 'web') {
      setVisiblePage(!visiblePage);
      setCurrentPage(page);
    } else if (scrollRef.current != null) {
      scrollRef.current.scrollTo({ x: page === 'SignUp' ? screenWidth : 0 });
    }
  };

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const page = event.nativeEvent.contentOffset.x > screenWidth / 2 ? 'SignUp' : 'SignIn';
    setCurrentPage(page);
  };

  if (loading) {
    return (
      <View flex={1} justifyContent="center" alignItems="center">
        <ActivityIndicator size="large" color="#04BF7B" />
      </View>
    );
  }

  return (
    <Stack backgroundColor={'$background'} height="100%">
      {closeModal && <PwRecoveryModal onClose={handleCloseModal} />}
      <ScrollView
        horizontal
        pagingEnabled
        onScroll={handleScroll}
        ref={scrollRef}
        scrollEnabled={Platform.OS !== 'web'}
      >
        {Platform.OS === 'web' ? (
          <>
            {visiblePage ? (
              <View width={screenWidth} height="100%">
                <SignInWeb
                  page={currentPage}
                  onButtonPress={handleButtonPress}
                  modal={handleCloseModal}
                />
              </View>
            ) : (
              <View width={screenWidth} height="100%">
                <SignUpWeb
                  page={currentPage}
                  onButtonPress={handleButtonPress}
                  modal={handleCloseModal}
                />
              </View>
            )}
          </>
        ) : (
          <>
            <View width={screenWidth} height="100%">
              <SignInMobile
                page={currentPage}
                onButtonPress={handleButtonPress}
                modal={handleCloseModal}
              />
            </View>
            <View width={screenWidth} height="100%">
              <SignUpMobile
                page={currentPage}
                onButtonPress={handleButtonPress}
                modal={handleCloseModal}
              />
            </View>
          </>
        )}
      </ScrollView>
    </Stack>
  );
}

/* Mobile: */

export function SignInMobile(props: {
  page: string;
  onButtonPress: (page: string) => void;
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
      <DialogInstance
        openModal={registerInvalid}
        setRegisterInvalid={setRegisterInvalid}
        erros={erros}
      />
      <Image
        src={require('../assets/images/logo-conectar-positivo.png')}
        objectFit="contain"
        maxWidth={200}
        height={80}
        marginBottom="$9"
      ></Image>
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
          handleLogin(email, password, setRegisterInvalid, setLoading, setErros, saveAuthToken)
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

export function SignUpMobile(props: {
  page: string;
  onButtonPress: (page: string) => void;
  modal: () => void;
}) {
  const [showPw, setShowPw] = useState(true);
  const [showConfirmPw, setShowConfirmPw] = useState(true);
  const [name, setName] = useState('');
  const [nameValid, setNameValid] = useState(false);
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState('');
  const [positionItems, setPositionItems] = useState(positionOptions);
  const [phone, setPhone] = useState('');
  const [phoneValid, setPhoneValid] = useState(false);
  const [phoneTouched, setPhoneTouched] = useState(false);
  const [emailValid, setEmailValid] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordValid, setPasswordValid] = useState(true);
  const [erros, setErros] = useState([]);
  const [registerInvalid, setRegisterInvalid] = useState(false);
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
      <DialogInstance
        openModal={registerInvalid}
        setRegisterInvalid={setRegisterInvalid}
        erros={erros}
      />
      <Image
        src={require('../assets/images/logo-conectar-positivo.png')}
        objectFit="contain"
        maxWidth={200}
        height={80}
        marginBottom="$6"
      ></Image>

      <Text alignSelf="flex-start" fontSize="$8">
        Criar conta
      </Text>
      <Text alignSelf="flex-start" color="$gray10Dark">
        Preencha com os seus dados abaixo:
      </Text>

      <XStack
        width="$100"
        backgroundColor="white"
        borderWidth={1}
        borderRadius={9}
        borderColor={name.length > 0 && !nameValid ? '$red10' : 'lightgray'}
        marginTop="$3.5"
        alignItems="center"
        flexDirection="row"
        zIndex={20}
        hoverStyle={{
          borderColor: name.length > 0 && !nameValid ? '$red10' : '#049A63',
          borderWidth: 1,
        }}
        focusStyle={{
          borderColor: name.length > 0 && !nameValid ? '$red10' : '#049A63',
          borderWidth: 1,
        }}
      >
        <Input
          placeholder="Nome"
          onChangeText={(e) => {
            setName(e);
            setNameValid(e.length > 1);
          }}
          value={name}
          backgroundColor="$colorTransparent"
          borderWidth={0}
          flex={1}
          style={{
            paddingHorizontal: 12,
            paddingVertical: Platform.OS === 'android' ? 8 : 10,
            includeFontPadding: false,
            textAlignVertical: 'center',
          }}
        />
      </XStack>

      <XStack style={{ zIndex: 50, width: '100%' }} marginTop="$3.5">
        <DropDownPicker
          open={open}
          value={position}
          items={positionItems}
          setOpen={setOpen}
          setValue={setPosition}
          setItems={setPositionItems}
          placeholder="Selecione o cargo"
          style={{
            borderColor: 'lightgray',
            height: 50,
          }}
          dropDownContainerStyle={{
            borderColor: 'lightgray',
            zIndex: 50,
          }}
          listMode={Platform.OS === 'ios' ? 'MODAL' : 'SCROLLVIEW'}
        />
      </XStack>

      <XStack
        width="$100"
        backgroundColor="white"
        borderWidth={1}
        borderRadius={9}
        overflow="hidden"
        borderColor={phone.length === 0 ? 'lightgray' : phoneValid ? 'lightgray' : 'red'}
        marginTop="$3.5"
        alignItems="center"
        flexDirection="row"
        zIndex={20}
        hoverStyle={{
          borderColor: '#049A63',
          borderWidth: 1,
        }}
        focusStyle={{
          borderColor: '#049A63',
          borderWidth: 1,
        }}
      >
        <TextInputMask
          type="cel-phone"
          options={{
            maskType: 'BRL',
            withDDD: true,
            dddMask: '(99) ',
          }}
          value={phone}
          onChangeText={(text: string) => {
            setPhone(text);
            setPhoneValid(!!validatePhone(text));
          }}
          placeholder="Telefone"
          keyboardType="phone-pad"
          onBlur={() => {
            setPhoneValid(!!validatePhone(phone));
          }}
          style={{
            backgroundColor: 'white',
            borderRadius: 8,
            paddingHorizontal: 12,
            paddingVertical: 10,
            fontSize: 16,
            width: '100%',
            borderWidth: 0,
          }}
        />
      </XStack>

      <XStack
        width="$100"
        backgroundColor="white"
        borderWidth={1}
        borderRadius={9}
        borderColor={email.length > 0 && !emailValid ? 'red' : 'lightgray'}
        marginTop="$3.5"
        alignItems="center"
        flexDirection="row"
        zIndex={20}
      >
        <Input
          autoCapitalize="none"
          placeholder="Email"
          onChangeText={(email) => {
            setEmail(email);
            setEmailValid(!!validateEmail(email));
          }}
          value={email}
          textContentType="emailAddress"
          backgroundColor="$colorTransparent"
          borderWidth="$0"
          flex={1}
          maxLength={256}
          focusStyle={{ borderColor: '#049A63', borderWidth: 1 }}
          hoverStyle={{ borderColor: '#049A63', borderWidth: 1 }}
        />
      </XStack>
      <XStack
        width="$100"
        backgroundColor="white"
        paddingRight="$3.5"
        borderWidth={1}
        borderRadius={9}
        borderColor={password.length === 0 ? 'lightgray' : passwordValid ? 'lightgray' : 'red'}
        marginTop="$3.5"
        alignItems="center"
        flexDirection="row"
        zIndex={20}
        focusStyle={{ borderColor: '#049A63', borderWidth: 1 }}
        hoverStyle={{ borderColor: '#049A63', borderWidth: 1 }}
      >
        <Input
          autoCapitalize="none"
          placeholder="Senha"
          backgroundColor="$colorTransparent"
          borderWidth="$0"
          borderColor="$colorTransparent"
          secureTextEntry={showPw}
          flex={1}
          marginRight="$3.5"
          maxLength={20}
          value={password}
          onChangeText={(text) => {
            setPassword(text);
            setPasswordValid(!!validatePassword(text) && text === confirmPassword);
          }}
          focusStyle={{ outlineStyle: 'none' }}
        />
        <Icons
          name={showPw ? 'eye' : 'eye-off'}
          size={24}
          onPress={() => {
            setShowPw(!showPw);
          }}
        />
      </XStack>
      <XStack
        width="$100"
        backgroundColor="white"
        paddingRight="$3.5"
        borderWidth={1}
        borderRadius={9}
        borderColor={
          confirmPassword.length === 0 ? 'lightgray' : passwordValid ? 'lightgray' : 'red'
        }
        marginTop="$3.5"
        alignItems="center"
        flexDirection="row"
        zIndex={20}
        focusStyle={{ borderColor: '#049A63', borderWidth: 1 }}
        hoverStyle={{ borderColor: '#049A63', borderWidth: 1 }}
      >
        <Input
          autoCapitalize="none"
          placeholder="Confirmar senha"
          backgroundColor="$colorTransparent"
          borderWidth="$0"
          borderColor="$colorTransparent"
          secureTextEntry={showConfirmPw}
          flex={1}
          marginRight="$3.5"
          maxLength={20}
          onChangeText={(text) => {
            setConfirmPassword(text);
            setPasswordValid(text === password);
          }}
          focusStyle={{ outlineStyle: 'none' }}
        />
        <Icons
          name={showConfirmPw ? 'eye' : 'eye-off'}
          size={24}
          onPress={() => {
            setShowConfirmPw(!showConfirmPw);
          }}
        />
      </XStack>

      <Button
        marginTop="$3.5"
        backgroundColor="#04BF7B"
        color="white"
        fontWeight="$10"
        width={230}
        onPress={() => 
          handleRegister(
            name,
            position,
            phone,
            email,
            password,
            setRegisterInvalid,
            setLoading,
            setErros,
            saveAuthToken,
          )
        }
      >
        Cadastrar
      </Button>

      {/* <Text color='$gray10Dark' marginTop='$3.5'>Ou cadastre com</Text>
            <Button backgroundColor='white' borderColor='lightgray' width={230} marginTop='$5'><Icons name='logo-google' />Continuar com Google</Button>
            <Button backgroundColor='white' borderColor='lightgray' width={230} marginTop='$3.5'><Icons name='logo-microsoft' />Continuar com Microsoft</Button> */}

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
      <VersionInfo />
    </YStack>
  );
}

/* Web: */

export function SignInWeb(props: {
  page: string;
  onButtonPress: (page: string) => void;
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
      <DialogInstance
        openModal={registerInvalid}
        setRegisterInvalid={setRegisterInvalid}
        erros={erros}
      />
      <Image
        src={require('../assets/images/logo-conectar-positivo.svg')}
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
          handleLogin(email, password, setRegisterInvalid, setLoading, setErros, saveAuthToken)
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

export function SignUpWeb(props: {
  page: string;
  onButtonPress: (page: string) => void;
  modal: () => void;
}) {
  const [showPw, setShowPw] = useState(true);
  const [showConfirmPw, setShowConfirmPw] = useState(true);
  const [name, setName] = useState('');
  const [nameValid, setNameValid] = useState(true);
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState('');
  const [positionItems, setPositionItems] = useState(positionOptions);
  const [phone, setPhone] = useState('');
  const [phoneValid, setPhoneValid] = useState(true);
  const [emailValid, setEmailValid] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordValid, setPasswordValid] = useState(true);
  const [erros, setErros] = useState([]);
  const [registerInvalid, setRegisterInvalid] = useState(false);
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
      <Image
        src={require('../assets/images/logo-conectar-positivo.svg')}
        width={240}
        height={80}
        objectFit="fill"
        marginBottom="$6"
      />
      {registerInvalid && (
        <DialogInstance
          openModal={registerInvalid}
          setRegisterInvalid={setRegisterInvalid}
          erros={erros}
        />
      )}

      <Stack width="$20">
        <Text fontSize="$8">Criar conta</Text>
        <Text color="$gray10Dark">Preencha com os seus dados abaixo:</Text>
      </Stack>

      <XStack
        width="$20"
        backgroundColor="white"
        borderWidth={1}
        borderRadius={9}
        borderColor={name.length > 0 && !nameValid ? 'red' : 'lightgray'}
        marginTop="$3.5"
        alignItems="center"
        flexDirection="row"
        zIndex={20}
      >
        <Input
          placeholder="Nome"
          onChangeText={(e) => {
            setName(e);
            setNameValid(!!validateName(e));
          }}
          value={name}
          backgroundColor="$colorTransparent"
          borderWidth="0"
          flex={1}
          width="100%"
          focusStyle={{ borderColor: '#049A63', borderWidth: 1 }}
          hoverStyle={{ borderColor: '#049A63', borderWidth: 1 }}
        />
      </XStack>

      <XStack
        width="$20"
        borderWidth={1}
        backgroundColor="white"
        borderRadius={9}
        marginTop="$3.5"
        alignItems="center"
        flexDirection="row"
        zIndex={30}
      >
        <DropDownPicker
          open={open}
          value={position}
          items={positionItems}
          setOpen={setOpen}
          setValue={setPosition}
          setItems={setPositionItems}
          placeholder="Selecione o cargo"
          style={{
            borderColor: 'lightgray',
            height: 50,
          }}
          dropDownContainerStyle={{
            borderColor: 'lightgray',
          }}
          listMode="SCROLLVIEW"
        />
      </XStack>

      <XStack
        width="$20"
        backgroundColor="white"
        borderWidth={1}
        borderRadius={9}
        overflow="hidden"
        borderColor={phone.length === 0 ? 'lightgray' : phoneValid ? 'lightgray' : 'red'}
        marginTop="$3.5"
        alignItems="center"
        flexDirection="row"
        zIndex={20}
        hoverStyle={{
          borderColor: '#049A63',
          borderWidth: 1,
        }}
        focusStyle={{
          borderColor: '#049A63',
          borderWidth: 1,
        }}
      >
        <TextInputMask
          type="cel-phone"
          options={{
            maskType: 'BRL',
            withDDD: true,
            dddMask: '(99) ',
          }}
          value={phone}
          onChangeText={(text: string) => {
            setPhone(text);
            setPhoneValid(!!validatePhone(text));
          }}
          placeholder="Telefone"
          keyboardType="phone-pad"
          onBlur={() => {
            setPhoneValid(!!validatePhone(phone));
          }}
          style={{
            backgroundColor: 'white',
            borderRadius: 8,
            paddingHorizontal: 12,
            paddingVertical: 10,
            fontSize: 16,
            width: '100%',
            borderWidth: 0,
          }}
        />
      </XStack>

      <XStack
        width="$20"
        backgroundColor="white"
        borderWidth={1}
        borderRadius={9}
        borderColor={email.length > 0 && !emailValid ? 'red' : 'lightgray'}
        marginTop="$3.5"
        alignItems="center"
        flexDirection="row"
        zIndex={20}
      >
        <Input
          autoCapitalize="none"
          placeholder="Email"
          onChangeText={(email) => {
            setEmail(email);
            setEmailValid(!!validateEmail(email));
          }}
          value={email}
          textContentType="emailAddress"
          backgroundColor="$colorTransparent"
          borderWidth="$0"
          flex={1}
          maxLength={256}
          focusStyle={{ borderColor: '#049A63', borderWidth: 1 }}
          hoverStyle={{ borderColor: '#049A63', borderWidth: 1 }}
        />
      </XStack>
      <XStack
        width="$20"
        backgroundColor="white"
        paddingRight="$3.5"
        borderWidth={1}
        borderRadius={9}
        borderColor={
          password.length === 0
            ? 'lightgray' // Cinza se vazio
            : passwordValid
              ? 'lightgray'
              : 'red' // Vermelho se inválido
        }
        marginTop="$3.5"
        alignItems="center"
        flexDirection="row"
        zIndex={20}
        focusStyle={{ borderColor: '#049A63', borderWidth: 1 }}
        hoverStyle={{ borderColor: '#049A63', borderWidth: 1 }}
      >
        <Input
          autoCapitalize="none"
          placeholder="Senha"
          backgroundColor="$colorTransparent"
          borderWidth="$0"
          borderColor="$colorTransparent"
          secureTextEntry={showPw}
          flex={1}
          marginRight="$3.5"
          value={password}
          maxLength={20}
          onChangeText={(text) => {
            setPassword(text);
            setPasswordValid(!!validatePassword(text) && text === confirmPassword);
          }}
          focusStyle={{ outlineStyle: 'none' }}
        />
        <Icons
          name={showPw ? 'eye' : 'eye-off'}
          size={24}
          onPress={() => {
            setShowPw(!showPw);
          }}
        />
      </XStack>
      <XStack
        width="$20"
        backgroundColor="white"
        paddingRight="$3.5"
        borderWidth={1}
        borderRadius={9}
        borderColor={
          confirmPassword.length === 0
            ? 'lightgray' // Cinza se vazio
            : passwordValid
              ? 'lightgray'
              : 'red' // Vermelho se inválido
        }
        marginTop="$3.5"
        alignItems="center"
        flexDirection="row"
        zIndex={20}
        focusStyle={{ borderColor: '#049A63', borderWidth: 1 }}
        hoverStyle={{ borderColor: '#049A63', borderWidth: 1 }}
      >
        <Input
          autoCapitalize="none"
          placeholder="Confirmar senha"
          backgroundColor="$colorTransparent"
          borderWidth="$0"
          borderColor="$colorTransparent"
          secureTextEntry={showConfirmPw}
          flex={1}
          marginRight="$3.5"
          maxLength={20}
          onChangeText={(text) => {
            setConfirmPassword(text);
            setPasswordValid(text === password); // Valida se é igual à senha principal
          }}
          focusStyle={{ outlineStyle: 'none' }}
        />
        <Icons
          name={showConfirmPw ? 'eye' : 'eye-off'}
          size={24}
          onPress={() => {
            setShowConfirmPw(!showConfirmPw);
          }}
        />
      </XStack>

      <Button
        onPress={() => 
          handleRegister(
            name,
            position,
            phone,
            email,
            password,
            setRegisterInvalid,
            setLoading,
            setErros,
            saveAuthToken,
          )
        }
        hoverStyle={{ backgroundColor: '#03a86c' }}
        marginTop="$3.5"
        backgroundColor="#04BF7B"
        color="white"
        fontWeight="$10"
        width="$20"
      >
        Cadastrar
      </Button>

      {/* <Text color='$gray10Dark' marginTop='$3.5'>Ou cadastre com</Text>
            <Button backgroundColor='white' borderColor='lightgray' width='$18' marginTop='$5'><Icons name='logo-google' />Continuar com Google</Button>
            <Button backgroundColor='white' borderColor='lightgray' width='$18' marginTop='$3.5'><Icons name='logo-microsoft' />Continuar com Microsoft</Button> */}

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

      <XStack marginTop="$6" borderColor="$gray7Light" borderWidth={1} borderRadius={9} width="$20">
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
      <VersionInfo />
    </YStack>
  );
}

export function DialogInstance(props: {
  openModal: boolean;
  setRegisterInvalid: Function;
  erros: string[];
  cnpj?: string;
}) {
  return (
    <Dialog modal open={props.openModal}>
      <Adapt platform="touch">
        <Sheet
          animationConfig={{
            type: 'spring',
            damping: 20,
            mass: 0.5,
            stiffness: 200,
          }}
          animation="medium"
          zIndex={200000}
          modal
          dismissOnSnapToBottom
          snapPointsMode="fit"
        >
          <Sheet.Frame padding="$4" gap="$4">
            <Adapt.Contents />
          </Sheet.Frame>
          <Sheet.Overlay
            animation="quickest"
            enterStyle={{ opacity: 0 }}
            exitStyle={{ opacity: 0 }}
          />
        </Sheet>
      </Adapt>

      <Dialog.Portal>
        <Dialog.Overlay
          key="overlay"
          animation="quick"
          opacity={0.5}
          enterStyle={{ opacity: 0 }}
          exitStyle={{ opacity: 0 }}
        />

        <Dialog.Content
          bordered
          elevate
          key="content"
          animateOnly={['transform', 'opacity']}
          animation={[
            'quicker',
            {
              opacity: {
                overshootClamping: true,
              },
            },
          ]}
          enterStyle={{ x: 0, y: -20, opacity: 0, scale: 0.9 }}
          exitStyle={{ x: 0, y: 10, opacity: 0, scale: 0.95 }}
          gap="$4"
        >
          <Dialog.Title>Ops!</Dialog.Title>
          <Dialog.Description>
            Houve alguns probleminhas, corrija antes de continuar
          </Dialog.Description>

          {props.erros.map((erro) => {
            return <Text key={erro}>{erro}</Text>;
          })}

          <XStack alignSelf="center" gap="$4">
            <Dialog.Close displayWhenAdapted asChild>
              {/* Envolva os botões em um container único */}
              <XStack gap="$4">
                <Button
                  width="$20"
                  theme="active"
                  aria-label="Close"
                  backgroundColor="#04BF7B"
                  color="$white1"
                  onPress={() => props.setRegisterInvalid(false)}
                >
                  Ok
                </Button>
                {props.erros.find(
                  (erro) =>
                    erro ===
                    'Este cnpj já existe na plataforma, utilize outro ou logue ao invés disso',
                ) && (
                  <Button
                    width="$20"
                    theme="active"
                    backgroundColor="#FFA500"
                    color="$white1"
                    onPress={() => {
                      let msg = `Olá! Gostaria de acessar a conta com o CNPJ ${
                        props.cnpj ?? ''
                      }, pode me ajudar?`;
                      msg = encodeURIComponent(msg)
                        .replace('!', '%21')
                        .replace("'", '%27')
                        .replace('(', '%28')
                        .replace(')', '%29')
                        .replace('*', '%2A');

                      const endpoint = `https://wa.me/5521999954372?text=${msg}`;
                      openURL(endpoint).catch((err) =>
                        console.error(`Erro ao redirecionar ao Whatsapp: ${err}`),
                      );
                    }}
                  >
                    Suporte
                  </Button>
                )}
              </XStack>
            </Dialog.Close>
          </XStack>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog>
  );
}
