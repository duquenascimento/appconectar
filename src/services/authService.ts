import axios from "axios";
import { PasswordChangeRequest, SignInRequest, SignInResponse, SignUpRequest } from "../types/userTypes";

const API_URL = process.env.EXPO_PUBLIC_API_URL;

export async function authSignIn(data: SignInRequest): Promise<SignInResponse> {
    try {
        const response = await axios.post(`${API_URL}/auth/signin`, data);
        return response.data;
    } catch (error) {
        console.error('Erro ao tentar logar', error);
        throw error;
    }
}

export async function authSignUp(data: SignUpRequest): Promise<SignInResponse> {
    try {
        const response = await axios.post(`${API_URL}/auth/signup`, data);
        return response.data;
    } catch (error) {
        console.error('Erro ao cadastrar um novo usuário', error);
        throw error;
    }
}

export async function authChangePassword(data: PasswordChangeRequest): Promise<void> {
    try {
        const response = await axios.post(`${API_URL}/auth/pwChange`, data);
        return response.data;
    } catch (error) {
        console.error('Erro ao trocar de senha', error);
        throw error;
    }
}

export async function authRecoveryPassword(email: string): Promise<void> {
    try {
        const response = await axios.post(`${API_URL}/auth/recovery`, { email: email.toLowerCase() });
        return response.data;
    } catch (error) {
        console.error('Erro ao recuperar senha', error);
        throw error;
    }
}

export async function authRecoveryCheck(email: string, code: string): Promise<void> {
    try {
        const response = await axios.post(`${API_URL}/auth/recoveryCheck`, { email: email.toLowerCase(), codeSent: code });
        return response.data;
    } catch (error) {
        console.error('Erro ao recuperar senha', error);
        throw error;
    }
}

export async function authLoginCheck(token: string): Promise<void> {
    try {
        const response = await axios.post(`${API_URL}/auth/checkLogin`, { token });
        return response.data;
    } catch (error) {
        console.error('Erro ao verificar a autenticação', error);
        throw error;
    }
}
