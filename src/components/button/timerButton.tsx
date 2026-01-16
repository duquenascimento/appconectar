import { formatTime } from '@/src/utils/timeUtils';
import Icons from '@expo/vector-icons/MaterialCommunityIcons';
import React, { useState, useEffect } from 'react';
import { Button, View, Text, YStack, XStack } from 'tamagui';

export default function TimerButton() {
  // 15 minutos em segundos
  const INITIAL_TIME = 15 * 60;

  const [timeLeft, setTimeLeft] = useState(INITIAL_TIME);
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    if (timeLeft <= 0) {
      setIsActive(false);
      return;
    }

    const intervalId = setInterval(() => {
      setTimeLeft((prevTime) => prevTime - 1);
    }, 1000);

    return () => clearInterval(intervalId);
  }, [timeLeft]);

  const handleCancel = () => {
    console.log('Botão clicado! Iniciando processo de cancelamento...');
    // Aqui virá sua chamada para a API depois
  };

  return (
    <View style={{ padding: 20, textAlign: 'center' }}>
      <YStack flex={1} alignItems="center" marginBottom={10} gap={5} justifyContent="center">
        <XStack alignSelf="center">
          <Button
            onPress={handleCancel}
            disabled={!isActive}
            style={{
              padding: '10px 20px',
              backgroundColor: isActive ? '#d9534f' : '#ccc', // Vermelho se ativo, cinza se inativo
              color: '#fff',
              border: 'none',
              borderRadius: '5px',
              cursor: isActive ? 'pointer' : 'not-allowed',
              fontSize: '1rem',
            }}
          >
            <Text color="#fff">Cancelar Pedido</Text>
          </Button>
        </XStack>
        <XStack flex={1} alignItems="center">
          <Icons name="timer" size={16} color="#aaa" style={{ marginLeft: 8 }} />
          <Text color="#aaa" fontSize={14}>
            {' '}
            Tempo Restante: {formatTime(timeLeft)}
          </Text>
        </XStack>
      </YStack>
    </View>
  );
}
