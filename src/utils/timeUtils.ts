import { DateTime } from 'luxon';
import { getBrazilJSDate } from './dateUtils';

export function getSecondsUntilTime(targetHours: number, targetMinutes: number): number {
  const now = getBrazilJSDate(); // Data e hora atual
  const target = getBrazilJSDate(); // Cria uma nova data (hoje)

  target.setHours(targetHours, targetMinutes, 0, 0); // Define o horário alvo na data atual

  const differenceInMillis = target.getTime() - now.getTime(); // Diferença em milissegundos

  // Converter milissegundos para segundos
  const differenceInSeconds = Math.floor(differenceInMillis / 1000);

  // Verifica se o horário já passou e retorna o valor (negativo ou positivo)
  return differenceInSeconds;
}

export function getDeliveryWindow(data: any) {
  if (!data || !data.addressInfos || !data.addressInfos.length) return '';
  const addr = data.addressInfos[0];
  const startTime = addr.initialDeliveryTime.substring(11, 16);
  const endTime = addr.finalDeliveryTime.substring(11, 16);
  return `Entre ${startTime} e ${endTime}`;
}

export function formatTime(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  const minString = minutes.toString().padStart(2, '0');
  const secString = remainingSeconds.toString().padStart(2, '0');

  return `${minString}:${secString}`;
}

export function formatTimeString(time: DateTime | Date | string): string {
  if (typeof time === 'string') {
    const dateTime = DateTime.fromISO(time);
    return dateTime.toFormat('HH:mm');
  } else if (time instanceof Date) {
    const dateTime = DateTime.fromJSDate(time);
    return dateTime.toFormat('HH:mm');
  } else if (time instanceof DateTime) {
    return time.toFormat('HH:mm');
  }
  return '';
}