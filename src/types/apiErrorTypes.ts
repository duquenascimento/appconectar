export interface ApiError {
  status: number;
  msg: string;
}

export interface ApiErrorResponse {
  response?: {
    data?: ApiError;
    status?: number;
  };
  message?: string;
}

export function isApiError(error: any): error is ApiErrorResponse {
  return error?.response?.data?.status !== undefined && error?.response?.data?.msg !== undefined;
}

export function getErrorMessage(error: any): string {
  if (isApiError(error)) {
    return error.response?.data?.msg || 'Erro desconhecido';
  }
  return error?.message || 'Erro desconhecido';
}
