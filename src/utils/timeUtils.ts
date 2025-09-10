import { DateTime } from 'luxon'

export function isBefore13Hours () {
  const currentDate = DateTime.now().setZone('America/Sao_Paulo')
  const currentHour = Number(
    `${currentDate.hour.toString().padStart(2, '0')}${currentDate.minute
      .toString()
      .padStart(2, '0')}${currentDate.second.toString().padStart(2, '0')}`
  )
  return 130000 >= currentHour
}

export function getSecondsUntil13h () {
  const now = DateTime.now().setZone('America/Sao_Paulo').toJSDate()
  const target = new Date()

  target.setHours(13, 0, 0, 0)

  const differenceInMillis = target.getTime() - now.getTime()

  const differenceInSeconds = Math.floor(differenceInMillis / 1000)

  return differenceInSeconds
}

export function getDeliveryWindow(data: any) {
  if (!data || !data.addressInfos || !data.addressInfos.length) return '';
  const addr = data.addressInfos[0];
  const startTime = addr.initialDeliveryTime.substring(11, 16);
  const endTime = addr.finalDeliveryTime.substring(11, 16);
  return `Entre ${startTime} e ${endTime}`;
}

