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
import { validateEmail, validateName, validatePassword, validatePhone, validatePosition } from '@/src/utils/validateFields';
import { SignInMobile } from '@/src/components/pages/sign/SignInMobile';
import { SignUpMobile } from '@/src/components/pages/sign/SignUpMobile';
import { SignInWeb } from '@/src/components/pages/sign/SignInWeb';
import { SignUpWeb } from '@/src/components/pages/sign/SignUpWeb';

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
      errorMessage = err.response?.data?.msg ?? err.response?.data?.message ?? errorMessage;

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
      errorMessage = err.response?.data?.msg ?? err.response?.data?.message ?? errorMessage;

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
                  onLoginPress={handleLogin}
                  modal={handleCloseModal}
                />
              </View>
            ) : (
              <View width={screenWidth} height="100%">
                <SignUpWeb
                  page={currentPage}
                  positionOptions={positionOptions}
                  onRegisterPress={handleRegister}
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
                onLoginPress={handleLogin}
                modal={handleCloseModal}
              />
            </View>
            <View width={screenWidth} height="100%">
              <SignUpMobile
                page={currentPage}
                positionOptions={positionOptions}
                onRegisterPress={handleRegister}
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
