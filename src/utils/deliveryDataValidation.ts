import { Address } from '../types/restaurantTypes';

export type DeliveryDataField =
  | 'cep'
  | 'cidade'
  | 'bairro'
  | 'rua'
  | 'numero'
  | 'responsavel'
  | 'telefone'
  | 'horario-inicio'
  | 'horario-fim';

export type DeliveryDataPendencies = Partial<Record<DeliveryDataField, string>>;

export interface DeliveryDataInput {
  zipCode?: string | null;
  city?: string | null;
  neighborhood?: string | null;
  localType?: string | null;
  street?: string | null;
  localNumber?: string | null;
  responsibleName?: string | null;
  phone?: string | null;
  initialTime?: string | null;
  finalTime?: string | null;
}

const MIN_DELIVERY_WINDOW_IN_MINUTES = 90;
const HOUR_PATTERN = /^([01]\d|2[0-3]):[0-5]\d$/;

const isBlank = (value?: string | null) => !value?.trim();
const countDigits = (value?: string | null) => (value ?? '').replace(/\D/g, '').length;

export const toValidHour = (value?: string | null): string => {
  const hour = value?.trim() ?? '';
  return HOUR_PATTERN.test(hour) ? hour : '';
};

const toMinutes = (hour: string) => {
  const [hours, minutes] = hour.split(':').map(Number);
  return hours * 60 + minutes;
};

export const getDeliveryDataFromAddress = (
  address?: Partial<Address> | null,
): DeliveryDataInput => ({
  zipCode: address?.zipCode,
  city: address?.city,
  neighborhood: address?.neighborhood,
  localType: address?.localType,
  street: address?.address,
  localNumber: address?.localNumber,
  responsibleName: address?.responsibleReceivingName,
  phone: address?.responsibleReceivingPhoneNumber,
  initialTime: address?.initialDeliveryTime?.substring(11, 16),
  finalTime: address?.finalDeliveryTime?.substring(11, 16),
});

export const validateDeliveryData = (data: DeliveryDataInput): DeliveryDataPendencies => {
  const pendencies: DeliveryDataPendencies = {};

  const zipCodeDigits = countDigits(data.zipCode);
  if (zipCodeDigits === 0) pendencies.cep = 'CEP é obrigatório';
  else if (zipCodeDigits !== 8) pendencies.cep = 'CEP inválido';

  if (isBlank(data.city)) pendencies.cidade = 'Cidade é obrigatória';
  if (isBlank(data.neighborhood)) pendencies.bairro = 'Bairro é obrigatório';
  if (isBlank(data.localType) || isBlank(data.street)) pendencies.rua = 'Rua é obrigatória';
  if (isBlank(data.localNumber)) pendencies.numero = 'Número é obrigatório';
  if (isBlank(data.responsibleName)) {
    pendencies.responsavel = 'Responsável pelo recebimento é obrigatório';
  }

  const phoneDigits = countDigits(data.phone);
  if (phoneDigits === 0) pendencies.telefone = 'Telefone do responsável é obrigatório';
  else if (phoneDigits < 10 || phoneDigits > 11) pendencies.telefone = 'Telefone inválido';

  const initialTime = toValidHour(data.initialTime);
  const finalTime = toValidHour(data.finalTime);

  if (!initialTime) pendencies['horario-inicio'] = 'Horário inicial é obrigatório';
  if (!finalTime) {
    pendencies['horario-fim'] = 'Horário final é obrigatório';
  } else if (
    initialTime &&
    toMinutes(finalTime) - toMinutes(initialTime) < MIN_DELIVERY_WINDOW_IN_MINUTES
  ) {
    pendencies['horario-fim'] = 'Horário final inválido';
  }

  return pendencies;
};

export const hasDeliveryDataPendencies = (address?: Partial<Address> | null): boolean =>
  !address || Object.keys(validateDeliveryData(getDeliveryDataFromAddress(address))).length > 0;
