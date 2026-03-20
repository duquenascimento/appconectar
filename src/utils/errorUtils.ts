import { AxiosError } from "axios";

export class ApiException extends Error {
   public readonly statusCode: number;
   public readonly error: any;
  
  constructor( message: string, status: number, error?: any) {
    super(message);
    this.statusCode = status;
    this.error = error;
    Object.setPrototypeOf(this, ApiException.prototype);
  }

  static isApiException(error: any): error is ApiException {
    return error instanceof ApiException;
  }

  toString() {
    return `API Exception: Error ${this.statusCode} - ${this.message}`
  }
}

export function handleHttpException(error: any): Error {
  const message = extractErrorMessage(error);

  return new Error(message);
}

export function extractErrorMessage(error: any, defaultMessage?: string): string {
  let message: string | undefined;

  if(error instanceof AxiosError) {
    if (error.response) {
      message = error.response.data.msg ?? error.response.data.message;
    } else {
      message = error.message
    }
  } else if(error instanceof Error) {
    message = error.message;
  }

  return message || defaultMessage || 'Houve um erro ao processar a solicitação.';
}
