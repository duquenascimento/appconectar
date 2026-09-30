import * as Notifications from 'expo-notifications';
import { scheduleNotification } from './agendamentoUtils';
import { getBrazilDateTime } from './dateUtils';
import { getToken } from './utils';

jest.mock('expo-notifications', () => ({
  getPermissionsAsync: jest.fn(),
  requestPermissionsAsync: jest.fn(),
  getAllScheduledNotificationsAsync: jest.fn(),
  scheduleNotificationAsync: jest.fn(),
  cancelScheduledNotificationAsync: jest.fn(),
  SchedulableTriggerInputTypes: { TIME_INTERVAL: 'timeInterval' },
}));

jest.mock('./utils', () => ({
  getToken: jest.fn(),
  STORAGE_DEFAULT_KEYS: {},
}));

const notificationsMock = Notifications as jest.Mocked<typeof Notifications>;
const getTokenMock = getToken as jest.MockedFunction<typeof getToken>;

const PHONE_NUMBER = '11999999999';

function getRequestBody(fetchMock: jest.Mock) {
  const [, requestInit] = fetchMock.mock.calls[0];
  return JSON.parse(requestInit.body as string);
}

describe('scheduleNotification', () => {
  const originalFetch = global.fetch;
  let fetchMock: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();

    fetchMock = jest.fn().mockResolvedValue({ ok: true });
    global.fetch = fetchMock as unknown as typeof fetch;

    getTokenMock.mockResolvedValue('token-de-teste');
    notificationsMock.getPermissionsAsync.mockResolvedValue({
      status: 'granted',
    } as unknown as Notifications.NotificationPermissionsStatus);
    notificationsMock.getAllScheduledNotificationsAsync.mockResolvedValue([]);
    notificationsMock.scheduleNotificationAsync.mockResolvedValue('identificador-novo');
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it('agenda o ChatGuru no horário de abertura do fornecedor, não às 13:00', async () => {
    const erros = await scheduleNotification(PHONE_NUMBER, 16, 30);

    expect(erros).toEqual([]);
    expect(fetchMock).toHaveBeenCalledTimes(1);

    const body = getRequestBody(fetchMock);
    expect(body.sendTime).toBe('16:30');
    expect(body.sendDate).toBe(getBrazilDateTime().toFormat('yyyy-MM-dd'));
  });

  it('cancela um agendamento local anterior antes de agendar o novo horário', async () => {
    notificationsMock.getAllScheduledNotificationsAsync.mockResolvedValue([
      {
        identifier: 'agendamento-antigo',
        content: {
          title: 'Confirme o seu pedido',
          body: 'O seu pedido já pode ser confirmado!',
        },
      },
    ] as unknown as Notifications.NotificationRequest[]);

    await scheduleNotification(PHONE_NUMBER, 16, 30);

    expect(notificationsMock.cancelScheduledNotificationAsync).toHaveBeenCalledWith(
      'agendamento-antigo',
    );
    expect(notificationsMock.scheduleNotificationAsync).toHaveBeenCalledTimes(1);
    expect(getRequestBody(fetchMock).sendTime).toBe('16:30');
  });
});
