export function handleHttpException(error: any): Error {
  console.log("[Error]", error);
  let message: string = 'Houve um erro ao processar a solicitação.';
  if (error.response) {
    message = error.response.data.msg ?? error.response.data.message;
  } else if (error.message) {
    message = error.message;
  }

  return new Error(message);
}
