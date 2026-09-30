import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { getBrazilDateTime } from './dateUtils';
import { getSecondsUntilTime } from './timeUtils';
import { getToken } from './utils';

const NOTIFICATION_TITLE = 'Confirme o seu pedido';
const NOTIFICATION_BODY = 'O seu pedido já pode ser confirmado!';

export const scheduleNotification = async (
  phoneNumber: string,
  targetHour: number,
  targetMinute: number,
): Promise<string[]> => {
  const erros: string[] = [];
  if (!phoneNumber) {
    erros.push('Por favor, cadastre o telefone do resposável pelo recebimento.');
    return erros;
  }
  if (Platform.OS !== 'web') {
    const { status } = await Notifications.getPermissionsAsync();
    if (status !== 'granted') {
      const result = await Notifications.requestPermissionsAsync();
      if (result.status !== 'granted') {
        console.log('No notification permissions granted!');
        return ['Permissão para notificações negada.'];
      }
    }

    // Título e corpo são iguais para todo fornecedor, então um agendamento que já
    // exista pode ser de outro fornecedor, em outro horário: cancelar e reagendar.
    const scheduledNotifications = await Notifications.getAllScheduledNotificationsAsync();
    const previouslyScheduled = scheduledNotifications.filter(
      (notification) =>
        notification.content.title === NOTIFICATION_TITLE &&
        notification.content.body === NOTIFICATION_BODY,
    );
    await Promise.all(
      previouslyScheduled.map((notification) =>
        Notifications.cancelScheduledNotificationAsync(notification.identifier),
      ),
    );

    await Notifications.scheduleNotificationAsync({
      content: {
        title: NOTIFICATION_TITLE,
        body: NOTIFICATION_BODY,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds: getSecondsUntilTime(targetHour, targetMinute),
      },
    });
    console.log('Notificação local agendada');
  }

  // Agendamento ChatGurur
  try {
    const sendDateTime = getBrazilDateTime().set({
      hour: targetHour,
      minute: targetMinute,
      second: 0,
    });
    const sendDate = sendDateTime.toFormat('yyyy-MM-dd');
    const sendTime = sendDateTime.toFormat('HH:mm');

    const token = await getToken();
    if (!token) return ['Ocorreu uma falha ao enviar agendamento da notificação.'];

    await fetch(`${process.env.EXPO_PUBLIC_API_URL}/confirm/agendamento`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        token,
        selectedRestaurant: {
          addressInfos: [
            {
              phoneNumber,
            },
          ],
        },
        message: 'Olá! Seu pedido já pode ser confirmado na plataforma.',
        sendDate,
        sendTime,
      }),
    });
  } catch (error) {
    console.error('Erro ao agendar via ChatGuru:', error);
  }

  return erros;
};
