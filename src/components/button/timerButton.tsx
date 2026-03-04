import { formatTime } from '@/src/utils/timeUtils';
import Icons from '@expo/vector-icons/MaterialCommunityIcons';
import React, { useEffect, useRef, useState } from 'react';
import { Button, View, Text, YStack, XStack } from 'tamagui';

interface TimerButtonProps {
  deadline?: number; // tempo em segundos
  onCancel?: () => void;
}

export default function TimerButton({ deadline, onCancel }: TimerButtonProps) {
  const [timeLeft, setTimeLeft] = useState(() => Math.max(deadline ?? 0, 0));
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const isActive = timeLeft > 0;

  // 🔁 sincroniza quando o deadline mudar
  useEffect(() => {
    setTimeLeft(Math.max(deadline ?? 0, 0));
  }, [deadline]);

  // ⏱️ controla o countdown
  useEffect(() => {
    if (!isActive) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    intervalRef.current = setInterval(() => {
      setTimeLeft((prev) => Math.max(prev - 1, 0));
    }, 1000);

    // Cleanup function - implicitly returns void
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isActive]);

  const handleCancel = () => {
    onCancel?.();
  };

  return (
    <View padding={20}>
      <YStack alignItems="center" gap={6} justifyContent="center">
        <Button
          onPress={handleCancel}
          disabled={!isActive}
          backgroundColor={isActive ? '#d9534f' : '#ccc'}
          borderRadius={6}
        >
          <Text color="#fff">Cancelar Pedido</Text>
        </Button>

        {deadline !== undefined && (
          <XStack alignItems="center" gap={6}>
            <Icons name="timer" size={16} color="#aaa" />
            <Text color="#aaa" fontSize={14}>
              Tempo restante: {formatTime(timeLeft)}
            </Text>
          </XStack>
        )}
      </YStack>
    </View>
  );
}
