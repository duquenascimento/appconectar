import { findFirstInvalidStep } from './register.form.validator';

const validValues = {
  document: '000.000.000-00',
  restaurantName: 'Restaurante Teste',
  zipcode: '00000-000',
  neigh: 'Bairro Teste',
  localType: 'RUA',
  street: 'Rua Teste',
  localNumber: '1',
  email: 'teste@example.com',
  paymentWay: 'CC32',
};

describe('findFirstInvalidStep', () => {
  const fetchMock = jest.fn();

  beforeEach(() => {
    fetchMock.mockReset();
    global.fetch = fetchMock as unknown as typeof fetch;
  });

  it('retorna null quando os passos anteriores estão válidos', async () => {
    expect(await findFirstInvalidStep(validValues, 3)).toBeNull();
  });

  it('retorna null no primeiro passo, que não tem passo anterior', async () => {
    expect(await findFirstInvalidStep({}, 0)).toBeNull();
  });

  it('volta para o passo do endereço quando falta um campo dele', async () => {
    const result = await findFirstInvalidStep({ ...validValues, street: '' }, 3);

    expect(result?.step).toBe(1);
    expect(result?.errors.map((err) => err.path)).toContain('street');
  });

  it('volta para o passo do contato quando o e-mail é inválido', async () => {
    const result = await findFirstInvalidStep({ ...validValues, email: 'sem-dominio' }, 3);

    expect(result?.step).toBe(2);
  });

  it('prioriza o primeiro passo inválido', async () => {
    const result = await findFirstInvalidStep({ ...validValues, document: '', street: '' }, 3);

    expect(result?.step).toBe(0);
  });

  it('volta ao passo mais distante quando mais de um passo anterior está inválido', async () => {
    const result = await findFirstInvalidStep(
      { ...validValues, street: '', email: 'sem-dominio' },
      3,
    );

    expect(result?.step).toBe(1);
  });

  it('ignora passos a partir do atual', async () => {
    const result = await findFirstInvalidStep({ ...validValues, email: '' }, 2);

    expect(result).toBeNull();
  });

  it('não consulta o ViaCEP ao revalidar passos anteriores', async () => {
    await findFirstInvalidStep(validValues, 3);

    expect(fetchMock).not.toHaveBeenCalled();
  });
});
