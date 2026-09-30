import { AxiosError } from 'axios';
import { extractErrorMessage } from './errorUtils';

describe('extractErrorMessage', () => {
  it('retorna mensagem amigável de timeout quando o código é ECONNABORTED', () => {
    const error = new AxiosError('timeout of 30000ms exceeded');
    error.code = 'ECONNABORTED';

    expect(extractErrorMessage(error)).toBe(
      'Tempo limite excedido. Verifique sua conexão e tente novamente.',
    );
  });

  it('retorna mensagem amigável de timeout quando a mensagem contém "timeout" mesmo sem o código ECONNABORTED', () => {
    const error = new AxiosError('Network Error: timeout exceeded');

    expect(extractErrorMessage(error)).toBe(
      'Tempo limite excedido. Verifique sua conexão e tente novamente.',
    );
  });

  it('extrai a mensagem do backend quando há response, sem confundir com timeout', () => {
    const error = new AxiosError('Request failed with status code 422');
    error.response = {
      data: { msg: 'Cotação retroativa fora da janela permitida' },
      status: 422,
      statusText: 'Unprocessable Entity',
      headers: {},
      config: {} as never,
    };

    expect(extractErrorMessage(error)).toBe('Cotação retroativa fora da janela permitida');
  });

  it('usa error.message quando é AxiosError sem response e sem indício de timeout', () => {
    const error = new AxiosError('Network Error');

    expect(extractErrorMessage(error)).toBe('Network Error');
  });

  it('usa a mensagem de um Error genérico', () => {
    expect(extractErrorMessage(new Error('algo deu errado'))).toBe('algo deu errado');
  });

  it('usa a mensagem padrão quando o erro não é reconhecido', () => {
    expect(extractErrorMessage('erro-string-qualquer', 'Erro padrão')).toBe('Erro padrão');
  });
});
