import {
  DeliveryDataInput,
  getDeliveryDataFromAddress,
  hasDeliveryDataPendencies,
  validateDeliveryData,
} from './deliveryDataValidation';

const completeData: DeliveryDataInput = {
  zipCode: '01310-100',
  city: 'São Paulo',
  neighborhood: 'Bela Vista',
  localType: 'AVENIDA',
  street: 'Paulista',
  localNumber: '1000',
  responsibleName: 'Maria',
  phone: '(11) 91234-5678',
  initialTime: '08:00',
  finalTime: '12:00',
};

describe('validateDeliveryData', () => {
  it('não devolve pendência quando os dados estão completos', () => {
    expect(validateDeliveryData(completeData)).toEqual({});
  });

  it.each([
    ['zipCode', 'cep', 'CEP é obrigatório'],
    ['city', 'cidade', 'Cidade é obrigatória'],
    ['neighborhood', 'bairro', 'Bairro é obrigatório'],
    ['street', 'rua', 'Rua é obrigatória'],
    ['localType', 'rua', 'Rua é obrigatória'],
    ['localNumber', 'numero', 'Número é obrigatório'],
    ['responsibleName', 'responsavel', 'Responsável pelo recebimento é obrigatório'],
    ['phone', 'telefone', 'Telefone do responsável é obrigatório'],
    ['initialTime', 'horario-inicio', 'Horário inicial é obrigatório'],
    ['finalTime', 'horario-fim', 'Horário final é obrigatório'],
  ] as const)('marca %s vazio como pendente', (input, field, message) => {
    expect(validateDeliveryData({ ...completeData, [input]: '' })).toEqual({ [field]: message });
    expect(validateDeliveryData({ ...completeData, [input]: '   ' })).toEqual({ [field]: message });
    expect(validateDeliveryData({ ...completeData, [input]: undefined })).toEqual({
      [field]: message,
    });
  });

  it('aceita telefone com 10 e 11 dígitos e recusa 9 e 12', () => {
    expect(validateDeliveryData({ ...completeData, phone: '(11) 1234-5678' })).toEqual({});
    expect(validateDeliveryData({ ...completeData, phone: '(11) 91234-5678' })).toEqual({});
    expect(validateDeliveryData({ ...completeData, phone: '(11) 1234-567' })).toEqual({
      telefone: 'Telefone inválido',
    });
    expect(validateDeliveryData({ ...completeData, phone: '119123456789' })).toEqual({
      telefone: 'Telefone inválido',
    });
  });

  it('aceita CEP com 8 dígitos, com ou sem hífen, e recusa 7', () => {
    expect(validateDeliveryData({ ...completeData, zipCode: '01310100' })).toEqual({});
    expect(validateDeliveryData({ ...completeData, zipCode: '01310-100' })).toEqual({});
    expect(validateDeliveryData({ ...completeData, zipCode: '0131010' })).toEqual({
      cep: 'CEP inválido',
    });
    expect(validateDeliveryData({ ...completeData, zipCode: '01310-10' })).toEqual({
      cep: 'CEP inválido',
    });
  });

  it('trata horário que não é uma hora válida como vazio', () => {
    expect(validateDeliveryData({ ...completeData, initialTime: ':00.0' })).toEqual({
      'horario-inicio': 'Horário inicial é obrigatório',
    });
    expect(validateDeliveryData({ ...completeData, finalTime: '25:00' })).toEqual({
      'horario-fim': 'Horário final é obrigatório',
    });
  });

  it('exige 1h30 entre o horário inicial e o final', () => {
    expect(
      validateDeliveryData({ ...completeData, initialTime: '08:00', finalTime: '09:00' }),
    ).toEqual({ 'horario-fim': 'Horário final inválido' });
    expect(
      validateDeliveryData({ ...completeData, initialTime: '08:00', finalTime: '09:29' }),
    ).toEqual({ 'horario-fim': 'Horário final inválido' });
    expect(
      validateDeliveryData({ ...completeData, initialTime: '08:00', finalTime: '09:30' }),
    ).toEqual({});
    expect(
      validateDeliveryData({ ...completeData, initialTime: '10:00', finalTime: '08:00' }),
    ).toEqual({ 'horario-fim': 'Horário final inválido' });
  });

  it('não acusa o horário final como inválido quando falta o inicial', () => {
    expect(validateDeliveryData({ ...completeData, initialTime: '' })).toEqual({
      'horario-inicio': 'Horário inicial é obrigatório',
    });
  });
});

describe('getDeliveryDataFromAddress', () => {
  const savedAddress = {
    zipCode: '01310100',
    city: 'São Paulo',
    neighborhood: 'Bela Vista',
    localType: 'AVENIDA',
    address: 'Paulista',
    localNumber: '1000',
    responsibleReceivingName: 'Maria',
    responsibleReceivingPhoneNumber: '(11) 91234-5678',
    initialDeliveryTime: '1970-01-01T08:00:00.000Z',
    finalDeliveryTime: '1970-01-01T12:00:00.000Z',
  };

  it('lê os dados do restaurante salvo sem pendência', () => {
    expect(validateDeliveryData(getDeliveryDataFromAddress(savedAddress))).toEqual({});
    expect(hasDeliveryDataPendencies(savedAddress)).toBe(false);
  });

  it('lê o horário vazio salvo pelo formulário como pendência', () => {
    const address = {
      ...savedAddress,
      initialDeliveryTime: '1970-01-01T:00.000Z',
      finalDeliveryTime: '1970-01-01T:00.000Z',
    };

    expect(validateDeliveryData(getDeliveryDataFromAddress(address))).toEqual({
      'horario-inicio': 'Horário inicial é obrigatório',
      'horario-fim': 'Horário final é obrigatório',
    });
    expect(hasDeliveryDataPendencies(address)).toBe(true);
  });

  it('considera pendente o restaurante sem endereço', () => {
    expect(hasDeliveryDataPendencies(undefined)).toBe(true);
  });
});
