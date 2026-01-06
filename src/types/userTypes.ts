export type SignInRequest = {
    email: string;
    password: string;
}

export type SignInResponse = {
    status: number;
    msg?: string | null;
    data: {
        token: string;
        role: string[];
    }
}

export type SignUpRequest = {
  email: string;
  password: string;
  name: string;
  position: string;
  phone: string;
}

export type PasswordChangeRequest = {
    email: string;
    codeSent: string;
    newPW: string;
}