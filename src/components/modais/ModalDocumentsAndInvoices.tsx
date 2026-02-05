import { Dialog, Button, Adapt, Sheet, YStack, XStack } from 'tamagui';

interface ModalDocumentsAndInvoicesProps {
  openModal: boolean;
  setRegisterInvalid: () => void;
}

export function ModalDocumentsAndInvoices({
  openModal,
  setRegisterInvalid,
}: ModalDocumentsAndInvoicesProps) {
  return (
    <Dialog modal open={openModal}>
      <Adapt platform="touch">
        <Sheet
          animationConfig={{
            type: 'spring',
            damping: 20,
            mass: 0.5,
            stiffness: 200,
          }}
          animation="medium"
          zIndex={200000}
          modal
          dismissOnSnapToBottom
          snapPoints={[100]}
          snapPointsMode="percent"
        >
          <Sheet.Frame padding="$4" gap="$4" flex={1}>
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
          animateOnly={['transform', 'opacity']}
          animation={[
            'quicker',
            {
              opacity: {
                overshootClamping: true,
              },
            },
          ]}
          enterStyle={{ x: 0, y: -20, opacity: 0, scale: 0.9 }}
          exitStyle={{ x: 0, y: 10, opacity: 0, scale: 0.95 }}
          gap="$4"
        >
          <YStack flex={1} justifyContent="center" alignItems="center" padding="$4" gap="$4">
            <Dialog.Title textAlign="center" marginHorizontal="auto" color="red">
              Documento ainda não disponível
            </Dialog.Title>
            <Dialog.Description textAlign="center">
              O documento ainda não foi disponibilizado.
            </Dialog.Description>

            <XStack justifyContent="center" alignSelf="center" gap="$4">
              <Dialog.Close displayWhenAdapted asChild>
                <Button
                  width="$20"
                  theme="active"
                  aria-label="Close"
                  backgroundColor="#04BF7B"
                  color="$white1"
                  onPress={() => setRegisterInvalid(false)}
                >
                  Fechar
                </Button>
              </Dialog.Close>
            </XStack>
          </YStack>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog>
  );
}
