export const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
export const phoneRegex = /^\d{10,11}$/;

export function validateEmail(email: string): string | null {
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

export function validatePassword(password: string): string | null {
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

export function validateName(name: string): string | null {
  if (!name) {
    return 'O nome é obrigatorio';
  }
  if (name.length <= 1) {
    return 'Nome inválido';
  }
  return null;
}

export function validatePosition(position: string): string | null {
  if (!position) {
    return 'O cargo é obrigatorio';
  }
  if (position.length <= 1) {
    return 'Cargo inválido';
  }
  return null;
}

export function validatePhone(phone: string): string | null {
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