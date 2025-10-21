import * as Notifications from 'expo-notifications';
import { DateTime } from 'luxon';
import { Platform } from 'react-native';
import { getSecondsUntil13h } from './timeUtils';
import { getToken } from './utils';

export const scheduleNotification = async (phoneNumber: string): Promise<string[]> => {
    const erros = [];
    if (Platform.OS !== 'web') {
        const { status } = await Notifications.getPermissionsAsync();
        if (status !== 'granted') {
            const result = await Notifications.requestPermissionsAsync();
            if (result.status !== 'granted') {
                console.log('No notification permissions granted!');
                return ['Permissão para notificações negada.'];
            }
        }

        const scheduledNotifications =
            await Notifications.getAllScheduledNotificationsAsync();
        const isAlreadyScheduled = scheduledNotifications.some(
            (notification) =>
                notification.content.title === 'Confirme o seu pedido' &&
                notification.content.body === 'O seu pedido já pode ser confirmado!',
        );

        if (!isAlreadyScheduled) {
            await Notifications.scheduleNotificationAsync({
                content: {
                    title: 'Confirme o seu pedido',
                    body: 'O seu pedido já pode ser confirmado!',
                },
                trigger: {
                    type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
                    seconds: getSecondsUntil13h(),
                },
            });
            console.log('Notificação local agendada');
        } else {
            console.log('Notificação já agendada');
        }

        // setShowNotification(true);
    } else if (Platform.OS === 'web') {
        erros.push('O pedido só pode ser confirmado após as 13h.');
    }

    // Agendamento ChatGurur
    try {
        const sendDateTime = DateTime.now()
            .setZone('America/Sao_Paulo')
            .set({ hour: 13, minute: 0, second: 0 });
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
                            phoneNumber: phoneNumber,
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

    // setShowErros(erros);
    // if (erros.length) setBooleanErros(true);

    return erros;
}