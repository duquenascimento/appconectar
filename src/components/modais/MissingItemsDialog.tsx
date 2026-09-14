/* eslint-disable react-native/no-inline-styles */
/* eslint-disable react/require-default-props */
import React from 'react';
import { Dialog, Adapt, Sheet, Button, XStack } from 'tamagui';

interface MissingItemsDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  missingItemsCount?: number;
  scheduleItemsCount?: number;
}

const getDescription = (missingItemsCount = 0, scheduleItemsCount = 0): string => {
  const hasMissing = missingItemsCount > 0;
  const hasSchedule = scheduleItemsCount > 0;

  if (hasMissing && hasSchedule) {
    return (
      `Este fornecedor possui ${missingItemsCount} iten(s) em falta e ` +
      `${scheduleItemsCount} iten(s) com entrega agendada. ` +
      'Deseja finalizar o pedido mesmo assim?'
    );
  }

  if (hasMissing) {
    return (
      `Este fornecedor possui ${missingItemsCount} iten(s) em falta. ` +
      'Deseja finalizar o pedido mesmo assim?'
    );
  }

  if (hasSchedule) {
    return (
      `Este fornecedor possui ${scheduleItemsCount} iten(s) com entrega agendada. ` +
      'Deseja finalizar o pedido mesmo assim?'
    );
  }

  return 'Deseja finalizar o pedido mesmo assim?';
};

export default function MissingItemsDialog({
  open,
  onClose,
  onConfirm,
  missingItemsCount,
  scheduleItemsCount,
}: MissingItemsDialogProps) {
  return (
    <Dialog modal open={open} onOpenChange={onClose}>
      {/* Adapta a modal em telas pequenas (mobile) */}
      <Adapt /* when="sm" */ platform="touch">
        <Sheet animation="medium" zIndex={200000} modal dismissOnSnapToBottom>
          <Sheet.Frame padding="$4" gap="$4">
            <Adapt.Contents />
          </Sheet.Frame>
          <Sheet.Overlay
            animation="quickest"
            enterStyle={{ opacity: 0 }}
            exitStyle={{ opacity: 0 }}
          />
        </Sheet>
      </Adapt>

      <Dialog.Portal>
        <Dialog.Overlay
          key="overlay"
          animation="quick"
          opacity={0.5}
          enterStyle={{ opacity: 0 }}
          exitStyle={{ opacity: 0 }}
        />
        <Dialog.Content
          bordered
          elevate
          key="content"
          enterStyle={{ x: 0, y: -20, opacity: 0, scale: 0.9 }}
          exitStyle={{ x: 0, y: 10, opacity: 0, scale: 0.95 }}
          gap="$4"
        >
          <Dialog.Title>Atenção!</Dialog.Title>
          <Dialog.Description>
            {getDescription(missingItemsCount, scheduleItemsCount)}
          </Dialog.Description>

          {/* Container para os botões de ação */}
          <XStack alignSelf="flex-end" gap="$4" paddingTop="$2">
            <Button onPress={onClose}>Voltar</Button>
            <Button theme="active" backgroundColor="#04BF7B" color="$white1" onPress={onConfirm}>
              Confirmar
            </Button>
          </XStack>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog>
  );
}
