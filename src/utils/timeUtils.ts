import { DateTime } from 'luxon';

export function getTomorrowDate(): DateTime {
  const tomorrow = DateTime.now().setZone('America/Sao_Paulo').plus({ days: 1 });
  return tomorrow;
}

export function isBefore13Hours(): boolean {
  const now = DateTime.now().setZone('America/Sao_Paulo'); // Data e hora atual
  const targetTime = now.set({ hour: 13, minute: 0, second: 0, millisecond: 0 }); // Define 13h00 no mesmo dia
  return now.valueOf() < targetTime.valueOf(); // Compara os timestamps em milissegundos
}

export function getSecondsUntil13h() {
  const now = DateTime.now().setZone('America/Sao_Paulo').toJSDate(); // Data e hora atual
  const target = new Date(); // Cria uma nova data (hoje)

  target.setHours(13, 0, 0, 0); // Define 13h00 na data atual

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
