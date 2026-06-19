import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { NotificationModal } from './NotificationModal';
import { useNotifications } from '../../contexts/notification.context';

// 1. Mockamos o hook para controlar o que ele retorna em cada cenário de teste
jest.mock('../../contexts/notification.context');

const mockUseNotifications = useNotifications as jest.MockedFunction<typeof useNotifications>;

describe('NotificationModal Component', () => {
  it('deve renderizar os dados da notificação atual e permitir navegar para a próxima', () => {
    // 2. Definimos o estado "mockado" que o Context entregaria
    const mockNextNotification = jest.fn();

    mockUseNotifications.mockReturnValue({
      currentNotification: {
        id: '1',
        title: 'Manutenção Agendada',
        message: 'O sistema ficará fora do ar',
        notificationType: 'WARN',
        footer: 'Aviso Importante',
      },
      hasNotifications: true,
      nextNotification: mockNextNotification,
      prevNotification: jest.fn(),
      dismissNotification: jest.fn(),
      currentIndex: 0,
      totalNotifications: 2,
    });

    // 3. Renderiza o componente (que ainda está vazio ou não existe)
    const { getByText } = render(<NotificationModal />);

    // 4. Asserções: O usuário deve ver o título e a mensagem
    expect(getByText('Manutenção Agendada')).toBeTruthy();
    expect(getByText('O sistema ficará fora do ar')).toBeTruthy();

    // 5. Ação: Usuário clica no botão "Próximo"
    const nextButton = getByText('Próximo');
    fireEvent.press(nextButton);

    // 6. Asserção: A função de avançar do contexto deve ter sido chamada
    expect(mockNextNotification).toHaveBeenCalledTimes(1);
  });

  it('não deve renderizar nada se hasNotifications for falso', () => {
    mockUseNotifications.mockReturnValue({
      currentNotification: null,
      hasNotifications: false,
      nextNotification: jest.fn(),
      prevNotification: jest.fn(),
      dismissNotification: jest.fn(),
      currentIndex: 0,
      totalNotifications: 0,
    });

    const { toJSON } = render(<NotificationModal />);

    // O componente deve retornar null (renderização vazia)
    expect(toJSON()).toBeNull();
  });
});
