import { isAxiosError } from 'axios';
import { router } from 'expo-router';
import { authSignUp } from '@/src/services/authService';
import { clearStoragesAndSaveCurrentVersion } from '@/src/services/versionService';
import { UserRole } from '@/src/types/userRoleTypes';
import { SignUpRequest } from '@/src/types/userTypes';
import { getPendingInviteCode } from '@/src/utils/inviteCode';
import {
  validateEmail,
  validateName,
  validatePassword,
  validatePhone,
  validatePosition,
} from '@/src/utils/validateFields';

export function validateRegisterInfo(data: SignUpRequest): string[] {
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

export async function handleRegister(
  name: string,
  position: string,
  phone: string,
  email: string,
  password: string,
  registerInvalid: Function,
  setLoading: Function,
  setErros: Function,
  saveLogin: Function,
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

    const pendingInviteCode = await getPendingInviteCode();

    const response = await authSignUp({
      ...signUpData,
      ...(pendingInviteCode ? { inviteCode: pendingInviteCode } : {}),
    });

    // clearStoragesAndSaveCurrentVersion() preserva o pendingInviteCode sozinho
    // (ver clearAllStoragesData em utils.ts) — não precisa recapturar aqui.
    await clearStoragesAndSaveCurrentVersion();

    await saveLogin(response.data.token, response.data.role);

    const userRoles = response.data.role as UserRole[];
    if (userRoles.includes('registering')) {
      router.replace('/register');
    } else if (response.data.role.includes('registered') || response.data.role.includes('client')) {
      router.replace('/products');
    } else {
      router.replace('/');
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
