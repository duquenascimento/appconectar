import { chatSocket } from './chatSocketService';
import { PushRegisterPayload, PushRegisterResponse } from '../types/chatTypes';

const PUSH_REGISTER_TIMEOUT_MS = 10_000;

export function registerPushWithSocket(payload: PushRegisterPayload): Promise<void> {
  if (!chatSocket.connected) {
    return Promise.reject(new Error('O socket não está conectado para registrar o push.'));
  }

  return new Promise((resolve, reject) => {
    chatSocket
      .timeout(PUSH_REGISTER_TIMEOUT_MS)
      .emit(
        'push_register',
        payload,
        (timeoutError: Error | null, response?: PushRegisterResponse) => {
          if (timeoutError) {
            reject(new Error('O servidor não confirmou o registro do push dentro do prazo.'));
            return;
          }

          if (!response?.ok) {
            reject(new Error(response?.error ?? 'Não foi possível registrar o push no servidor.'));
            return;
          }

          resolve();
        },
      );
  });
}
