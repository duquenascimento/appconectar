import { isAxiosError } from 'axios';
import { router, useFocusEffect, usePathname } from 'expo-router';
import { useCallback, useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { Stack, View } from 'tamagui';
import { PwRecoveryModal } from '@/src/components/pages/sign/PwdRecoveryModal';
import { SignInMobile } from '@/src/components/pages/sign/SignInMobile';
import { SignInWeb } from '@/src/components/pages/sign/SignInWeb';
import { useAuthContext } from '@/src/contexts/auth.context';
import { authLoginCheck, authSignIn } from '@/src/services/authService';
import { clearStoragesAndSaveCurrentVersion } from '@/src/services/versionService';
import { UserRole } from '@/src/types/userRoleTypes';
import { SignInRequest } from '@/src/types/userTypes';
import { clearAllStoragesData, getToken } from '@/src/utils/utils';
import { validateEmail, validatePassword } from '@/src/utils/validateFields';

async function handleLogin(
  email: string,
  password: string,
  registerInvalid: Function,
  setLoading: Function,
  setErros: Function,
  saveLogin: Function,
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

    // clearStoragesAndSaveCurrentVersion() preserva um pendingInviteCode
    // eventualmente capturado antes do login (ver clearAllStoragesData em utils.ts).
    await clearStoragesAndSaveCurrentVersion();

    await saveLogin(response.data.token, response.data.role);

    const userRoles = response.data.role as UserRole[];
    if (userRoles.includes('registering')) {
      router.replace('/register');
    } else if (response.data.role.includes('registered') || response.data.role.includes('client')) {
      router.replace('/products');
    } else {
      await clearAllStoragesData();
      router.replace('/');
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

export default function Sign() {
  const [loading, setLoading] = useState(false);
  const [closeModal, setCloseModal] = useState<boolean>(false);
  const { isInitialized, logout, getUserRoles } = useAuthContext();
  const pathname = usePathname();

  const handleCloseModal = () => {
    setCloseModal(!closeModal);
  };

  useFocusEffect(
    useCallback(() => {
      const checkLogin = async () => {
        if (!isInitialized) return;
        if (loading) return;

        setLoading(true);

        try {
          const token = await getToken();

          if (!token) {
            await clearAllStoragesData();
            return;
          }

          process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

          await authLoginCheck(token);

          const userRoles = await getUserRoles();

          if (!userRoles || userRoles.length === 0) {
            await logout();
            return;
          }

          if (userRoles?.includes('registering')) {
            router.replace('/register');
          } else if (userRoles?.includes('registered') || userRoles?.includes('client')) {
            router.replace('/products');
          } else if (pathname !== '/') {
            router.replace('/');
          }
        } catch (err) {
          await logout();
        } finally {
          setLoading(false);
        }
      };

      checkLogin();
    }, [isInitialized, pathname]),
  );

  const handleButtonPress = () => {
    router.push('/cadastro');
  };

  if (loading) {
    return (
      <View flex={1} justifyContent="center" alignItems="center">
        <ActivityIndicator size="large" color="#04BF7B" />
      </View>
    );
  }

  return (
    <Stack backgroundColor="$background" height="100%">
      {closeModal && <PwRecoveryModal onClose={handleCloseModal} />}
      {Platform.OS === 'web' ? (
        <View height="100%">
          <SignInWeb
            page="SignIn"
            onButtonPress={handleButtonPress}
            onLoginPress={handleLogin}
            modal={handleCloseModal}
          />
        </View>
      ) : (
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1 }}
        >
          <ScrollView nestedScrollEnabled contentContainerStyle={{ flexGrow: 1 }}>
            <SignInMobile
              page="SignIn"
              onButtonPress={handleButtonPress}
              onLoginPress={handleLogin}
              modal={handleCloseModal}
            />
          </ScrollView>
        </KeyboardAvoidingView>
      )}
    </Stack>
  );
}
