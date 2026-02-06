import { AxiosError } from "axios";

export function handleHttpException(error: any): Error {
  let message: string = 'Houve um erro ao processar a solicitação.';
  if (error.response) {
    message = error.response.data.msg ?? error.response.data.message;
  } else if (error.message) {
    message = error.message;
  }

  return new Error(message);
}

export function extractErrorMessage(error: any): string {
  let message: string = 'Houve um erro ao processar a solicitação.';

  if(error instanceof AxiosError) {
    if (error.response) {
      message = error.response.data.msg ?? error.response.data.message;
    } else {
      message = error.message
    }
  } else if(error instanceof Error) {
    message = error.message;
  }

  return message;
}
